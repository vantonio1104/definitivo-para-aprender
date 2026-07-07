# Operaciones CRUD para la colección 'pedidos'
import logging
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from config.conexion import get_db
from models.pedido import nuevo_pedido, nuevo_item_detalle, calcular_total
from utils.validaciones import validar_detalle_item, validar_transicion_estado, ESTADOS_PEDIDO_VALIDOS

logger = logging.getLogger(__name__)

def insertar_pedido(id_cliente: str, items: list[dict], direccion_entrega: Optional[str] = None, notas: Optional[str] = None) -> Optional[str]:
    # Crea un nuevo pedido validando cliente e ítems
    try:
        oid_cliente = ObjectId(id_cliente)
    except InvalidId:
        print(f"\n  [!] ID de cliente invalido: '{id_cliente}'.")
        return None

    db = get_db()
    if not db.clientes.find_one({"_id": oid_cliente, "activo": True}):
        print(f"\n  [!] Cliente con ID '{id_cliente}' no encontrado o inactivo.")
        return None

    if not items:
        print("\n  [!] El pedido debe tener al menos un item.")
        return None

    detalle_validado: list[dict] = []
    for idx, item in enumerate(items, start=1):
        try:
            if isinstance(item.get("id_producto"), str):
                item = dict(item)
                item["id_producto"] = ObjectId(item["id_producto"])

            if not db.productos.find_one({"_id": item["id_producto"], "activo": True}):
                print(f"\n  [!] Item {idx}: producto con ID '{item['id_producto']}' no encontrado.")
                return None

            item_validado = validar_detalle_item(item)
            detalle_validado.append(nuevo_item_detalle(**item_validado))
        except (InvalidId, ValueError) as e:
            print(f"\n  [!] Error en item {idx}: {e}")
            return None

    try:
        doc = nuevo_pedido(id_cliente=oid_cliente, detalle=detalle_validado, direccion_entrega=direccion_entrega, notas=notas)
        resultado = db.pedidos.insert_one(doc)
        id_str = str(resultado.inserted_id)
        logger.info("Pedido creado: %s | cliente: %s | total: %.2f", id_str, id_cliente, doc["total"])
        return id_str
    except PyMongoError as e:
        logger.error("Error al insertar pedido: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return None

def buscar_pedido_por_id(id_pedido: str) -> Optional[dict]:
    # Recupera un pedido por su ObjectId
    try:
        return get_db().pedidos.find_one({"_id": ObjectId(id_pedido)})
    except InvalidId:
        print(f"\n  [!] ID de pedido invalido: '{id_pedido}'.")
        return None
    except PyMongoError as e:
        logger.error("Error al buscar pedido: %s", e)
        return None

def listar_pedidos_por_cliente(id_cliente: str, limite: int = 20) -> list[dict]:
    # Lista el historial de pedidos de un cliente
    try:
        oid = ObjectId(id_cliente)
        return list(get_db().pedidos.find({"id_cliente": oid}).sort("fecha", -1).limit(limite))
    except (InvalidId, PyMongoError) as e:
        logger.error("Error al listar pedidos por cliente: %s", e)
        return []

def listar_pedidos_por_estado(estado: str, limite: int = 50) -> list[dict]:
    # Lista pedidos filtrados por estado
    if estado not in ESTADOS_PEDIDO_VALIDOS:
        print(f"\n  [!] Estado invalido: '{estado}'.")
        return []
    try:
        return list(get_db().pedidos.find({"estado": estado}).sort("fecha", 1).limit(limite))
    except PyMongoError as e:
        logger.error("Error al listar pedidos por estado: %s", e)
        return []

def top_productos_vendidos(limite: int = 10) -> list[dict]:
    # Agrega la cantidad y monto total de ventas por producto
    try:
        pipeline = [
            {"$unwind": "$detalle"},
            {"$group": {
                "_id": "$detalle.id_producto",
                "total_vendido": {"$sum": "$detalle.cantidad"},
                "ingresos": {"$sum": {"$multiply": ["$detalle.cantidad", "$detalle.precio_unitario"]}},
            }},
            {"$sort": {"total_vendido": -1}},
            {"$limit": limite},
            {"$lookup": {
                "from":         "productos",
                "localField":   "_id",
                "foreignField": "_id",
                "as":           "producto",
            }},
            {"$unwind": {"path": "$producto", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": 0,
                "nombre":        {"$ifNull": ["$producto.nombre", "Producto eliminado"]},
                "categoria":     {"$ifNull": ["$producto.categoria", "-"]},
                "total_vendido": 1,
                "ingresos":      {"$round": ["$ingresos", 2]},
            }},
        ]
        return list(get_db().pedidos.aggregate(pipeline))
    except PyMongoError as e:
        logger.error("Error en pipeline de top productos: %s", e)
        return []

def cambiar_estado(id_pedido: str, nuevo_estado: str) -> bool:
    # Cambia el estado de un pedido y añade entrada al historial
    try:
        oid = ObjectId(id_pedido)
    except InvalidId:
        print(f"\n  [!] ID de pedido invalido: '{id_pedido}'.")
        return False

    db = get_db()
    pedido = db.pedidos.find_one({"_id": oid}, {"estado": 1})
    if not pedido:
        print(f"\n  [!] Pedido con ID '{id_pedido}' no encontrado.")
        return False

    estado_actual = pedido.get("estado", "")
    try:
        validar_transicion_estado(estado_actual, nuevo_estado)
    except ValueError as e:
        print(f"\n  [!] {e}")
        return False

    ahora = datetime.now(timezone.utc)
    try:
        resultado = db.pedidos.update_one(
            {"_id": oid},
            {
                "$set":  {"estado": nuevo_estado},
                "$push": {"historial_estados": {"estado": nuevo_estado, "fecha": ahora}},
            },
        )
        if resultado.modified_count == 0:
            print("\n  [!] El estado no fue modificado.")
            return False
        logger.info("Pedido %s: cambiado a '%s'", id_pedido, nuevo_estado)
        return True
    except PyMongoError as e:
        logger.error("Error al cambiar estado: %s", e)
        print(f"\n  [ERROR] Error: {e}")
        return False

def agregar_item_detalle(id_pedido: str, id_producto: str, cantidad: int, precio_unitario: float) -> bool:
    # Agrega un producto al array detalle y recalcula total (solo pendiente)
    try:
        oid_pedido   = ObjectId(id_pedido)
        oid_producto = ObjectId(id_producto)
    except InvalidId as e:
        print(f"\n  [!] ID invalido: {e}")
        return False

    db = get_db()
    pedido = db.pedidos.find_one({"_id": oid_pedido})
    if not pedido:
        print(f"\n  [!] Pedido '{id_pedido}' no encontrado.")
        return False

    if pedido.get("estado") != "pendiente":
        print("\n  [!] Solo se pueden modificar pedidos en estado 'pendiente'.")
        return False

    try:
        item = validar_detalle_item({"id_producto": oid_producto, "cantidad": cantidad, "precio_unitario": precio_unitario})
        nuevo_item = nuevo_item_detalle(**item)

        detalle_actual = pedido.get("detalle", [])
        detalle_actual.append(nuevo_item)
        nuevo_total = calcular_total(detalle_actual)

        db.pedidos.update_one(
            {"_id": oid_pedido},
            {"$push": {"detalle": nuevo_item}, "$set": {"total": nuevo_total}},
        )
        logger.info("Item agregado al pedido %s: producto %s x %d", id_pedido, id_producto, cantidad)
        return True
    except (ValueError, PyMongoError) as e:
        logger.error("Error al agregar item: %s", e)
        print(f"\n  [ERROR] Error: {e}")
        return False

def cancelar_pedido(id_pedido: str) -> bool:
    # Cancela un pedido (cambio a estado cancelado)
    return cambiar_estado(id_pedido, "cancelado")

def eliminar_pedido(id_pedido: str, confirmar: bool = False) -> bool:
    # Elimina físicamente el documento de un pedido
    if not confirmar:
        print("\n  [!] Confirmar=True requerido.")
        return False
    try:
        resultado = get_db().pedidos.delete_one({"_id": ObjectId(id_pedido)})
        if resultado.deleted_count == 0:
            print(f"\n  [!] Pedido '{id_pedido}' no encontrado.")
            return False
        logger.info("Pedido eliminado: %s", id_pedido)
        return True
    except (InvalidId, PyMongoError) as e:
        logger.error("Error al eliminar pedido: %s", e)
        print(f"\n  [ERROR] Error: {e}")
        return False
