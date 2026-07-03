"""
crud/crud_pedidos.py — Operaciones CRUD para la colección 'pedidos'
====================================================================
Implementa Create, Read, Update y Delete para la entidad Pedido.
Maneja correctamente el array 'detalle[]' de subdocumentos embebidos,
el cálculo automático del total y la máquina de estados de pedidos.

Referencia normativa: Sección 4.1.6 · Punto G.23
"""

import logging
from datetime import datetime, timezone
from typing import Optional
# pyrefly: ignore [missing-import]
from bson import ObjectId
# pyrefly: ignore [missing-import]
from bson.errors import InvalidId
# pyrefly: ignore [missing-import]
from pymongo.errors import PyMongoError

from config.conexion import get_db
from models.pedido import nuevo_pedido, nuevo_item_detalle, calcular_total
from utils.validaciones import (
    validar_detalle_item,
    validar_transicion_estado,
    ESTADOS_PEDIDO_VALIDOS,
)

logger = logging.getLogger(__name__)


# ─── CREATE ──────────────────────────────────────────────────────────────────

def insertar_pedido(
    id_cliente: str,
    items: list[dict],
    direccion_entrega: Optional[str] = None,
    notas: Optional[str] = None,
) -> Optional[str]:
    """Crea un nuevo pedido con su array detalle[] embebido.

    Valida cada ítem del detalle (id_producto, cantidad, precio_unitario)
    antes de insertar. El total se calcula automáticamente.

    Args:
        id_cliente:        ID del cliente como string hexadecimal.
        items:             Lista de dicts con id_producto, cantidad, precio_unitario.
        direccion_entrega: Dirección de envío (opcional).
        notas:             Observaciones (opcional).

    Returns:
        str | None: ID del pedido creado o None si hubo error.
    """
    # Validar ID de cliente
    try:
        oid_cliente = ObjectId(id_cliente)
    except InvalidId:
        print(f"\n  ⚠️  ID de cliente inválido: '{id_cliente}'.")
        return None

    # Verificar que el cliente existe
    db = get_db()
    if not db.clientes.find_one({"_id": oid_cliente, "activo": True}):
        print(f"\n  ⚠️  Cliente con ID '{id_cliente}' no encontrado o inactivo.")
        return None

    if not items:
        print("\n  ⚠️  El pedido debe tener al menos un ítem en el detalle.")
        return None

    # Validar cada ítem del detalle
    detalle_validado: list[dict] = []
    for idx, item in enumerate(items, start=1):
        try:
            # Convertir id_producto a ObjectId si viene como string
            if isinstance(item.get("id_producto"), str):
                item = dict(item)
                item["id_producto"] = ObjectId(item["id_producto"])

            # Verificar que el producto existe
            if not db.productos.find_one({"_id": item["id_producto"], "activo": True}):
                print(f"\n  ⚠️  Ítem {idx}: producto con ID '{item['id_producto']}' no encontrado.")
                return None

            item_validado = validar_detalle_item(item)
            detalle_validado.append(nuevo_item_detalle(**item_validado))

        except (InvalidId, ValueError) as e:
            print(f"\n  ⚠️  Error en ítem {idx}: {e}")
            return None

    try:
        doc = nuevo_pedido(
            id_cliente=oid_cliente,
            detalle=detalle_validado,
            direccion_entrega=direccion_entrega,
            notas=notas,
        )
        resultado = db.pedidos.insert_one(doc)
        id_str = str(resultado.inserted_id)
        logger.info(
            "Pedido creado: %s | cliente: %s | ítems: %d | total: %.2f",
            id_str, id_cliente, len(detalle_validado), doc["total"],
        )
        return id_str

    except PyMongoError as e:
        logger.error("Error al insertar pedido: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return None


# ─── READ ─────────────────────────────────────────────────────────────────────

def buscar_pedido_por_id(id_pedido: str) -> Optional[dict]:
    """Recupera un pedido completo por su ObjectId (incluye detalle[] embebido).

    Args:
        id_pedido: ID del pedido como string hexadecimal.

    Returns:
        dict | None: Documento completo del pedido o None si no existe.
    """
    try:
        return get_db().pedidos.find_one({"_id": ObjectId(id_pedido)})
    except InvalidId:
        print(f"\n  ⚠️  ID de pedido inválido: '{id_pedido}'.")
        return None
    except PyMongoError as e:
        logger.error("Error al buscar pedido: %s", e)
        return None


def listar_pedidos_por_cliente(id_cliente: str, limite: int = 20) -> list[dict]:
    """Lista el historial de pedidos de un cliente, del más reciente al más antiguo.

    Usa el índice compuesto { id_cliente: 1, fecha: -1 }.

    Args:
        id_cliente: ID del cliente.
        limite:     Máximo de pedidos a retornar (default: 20).

    Returns:
        list[dict]: Lista de pedidos del cliente.
    """
    try:
        oid = ObjectId(id_cliente)
        return list(
            get_db()
            .pedidos.find({"id_cliente": oid})
            .sort("fecha", -1)
            .limit(limite)
        )
    except (InvalidId, PyMongoError) as e:
        logger.error("Error al listar pedidos por cliente: %s", e)
        return []


def listar_pedidos_por_estado(estado: str, limite: int = 50) -> list[dict]:
    """Lista pedidos filtrados por estado, ordenados por fecha ascendente.

    Usa el índice compuesto { estado: 1, fecha: 1 }.
    Útil para alertas de pedidos pendientes retrasados.

    Args:
        estado: Estado del pedido (debe ser uno de ESTADOS_PEDIDO_VALIDOS).
        limite: Máximo de pedidos a retornar (default: 50).

    Returns:
        list[dict]: Lista de pedidos con ese estado.
    """
    if estado not in ESTADOS_PEDIDO_VALIDOS:
        print(f"\n  ⚠️  Estado inválido: '{estado}'.")
        return []
    try:
        return list(
            get_db()
            .pedidos.find({"estado": estado})
            .sort("fecha", 1)
            .limit(limite)
        )
    except PyMongoError as e:
        logger.error("Error al listar pedidos por estado: %s", e)
        return []


def top_productos_vendidos(limite: int = 10) -> list[dict]:
    """Calcula los productos más vendidos usando un pipeline de agregación.

    Pipeline:
      $unwind → $group (suma cantidad) → $sort → $lookup (nombre producto)

    Args:
        limite: Cantidad de productos a retornar (default: 10).

    Returns:
        list[dict]: Lista con nombre, categoría y cantidad total vendida.
    """
    try:
        pipeline = [
            {"$unwind": "$detalle"},
            {"$group": {
                "_id": "$detalle.id_producto",
                "total_vendido": {"$sum": "$detalle.cantidad"},
                "ingresos": {"$sum": {
                    "$multiply": ["$detalle.cantidad", "$detalle.precio_unitario"]
                }},
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


# ─── UPDATE ───────────────────────────────────────────────────────────────────

def cambiar_estado(id_pedido: str, nuevo_estado: str) -> bool:
    """Cambia el estado de un pedido aplicando la máquina de estados.

    Valida que la transición sea permitida y agrega la entrada al
    historial_estados para trazabilidad completa.

    Transiciones válidas:
      pendiente → procesando | cancelado
      procesando → despachado | cancelado
      despachado → entregado | cancelado
      entregado y cancelado → estado terminal (sin más cambios)

    Args:
        id_pedido:    ID del pedido a actualizar.
        nuevo_estado: Nuevo estado deseado.

    Returns:
        bool: True si el estado fue cambiado exitosamente.
    """
    try:
        oid = ObjectId(id_pedido)
    except InvalidId:
        print(f"\n  ⚠️  ID de pedido inválido: '{id_pedido}'.")
        return False

    db = get_db()
    pedido = db.pedidos.find_one({"_id": oid}, {"estado": 1})
    if not pedido:
        print(f"\n  ⚠️  Pedido con ID '{id_pedido}' no encontrado.")
        return False

    estado_actual = pedido.get("estado", "")
    try:
        validar_transicion_estado(estado_actual, nuevo_estado)
    except ValueError as e:
        print(f"\n  ⚠️  {e}")
        return False

    ahora = datetime.now(timezone.utc)
    try:
        resultado = db.pedidos.update_one(
            {"_id": oid},
            {
                "$set":  {"estado": nuevo_estado},
                "$push": {
                    "historial_estados": {
                        "estado": nuevo_estado,
                        "fecha":  ahora,
                    }
                },
            },
        )
        if resultado.modified_count == 0:
            print("\n  ⚠️  El estado no fue modificado.")
            return False

        logger.info(
            "Pedido %s: estado cambiado '%s' → '%s'",
            id_pedido, estado_actual, nuevo_estado,
        )
        return True

    except PyMongoError as e:
        logger.error("Error al cambiar estado del pedido: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return False


def agregar_item_detalle(
    id_pedido: str,
    id_producto: str,
    cantidad: int,
    precio_unitario: float,
) -> bool:
    """Agrega un ítem al array detalle[] de un pedido en estado 'pendiente'.

    Solo se permite modificar pedidos en estado 'pendiente'.
    Recalcula el total del pedido automáticamente.

    Args:
        id_pedido:       ID del pedido a modificar.
        id_producto:     ID del producto a agregar.
        cantidad:        Unidades a agregar.
        precio_unitario: Precio unitario del ítem.

    Returns:
        bool: True si el ítem fue agregado correctamente.
    """
    try:
        oid_pedido   = ObjectId(id_pedido)
        oid_producto = ObjectId(id_producto)
    except InvalidId as e:
        print(f"\n  ⚠️  ID inválido: {e}")
        return False

    db = get_db()
    pedido = db.pedidos.find_one({"_id": oid_pedido})
    if not pedido:
        print(f"\n  ⚠️  Pedido '{id_pedido}' no encontrado.")
        return False

    if pedido.get("estado") != "pendiente":
        print("\n  ⚠️  Solo se pueden modificar pedidos en estado 'pendiente'.")
        return False

    try:
        item = validar_detalle_item({
            "id_producto":     oid_producto,
            "cantidad":        cantidad,
            "precio_unitario": precio_unitario,
        })
        nuevo_item = nuevo_item_detalle(**item)

        # Calcular nuevo total
        detalle_actual = pedido.get("detalle", [])
        detalle_actual.append(nuevo_item)
        nuevo_total = calcular_total(detalle_actual)

        db.pedidos.update_one(
            {"_id": oid_pedido},
            {
                "$push": {"detalle": nuevo_item},
                "$set":  {"total": nuevo_total},
            },
        )
        logger.info(
            "Ítem agregado al pedido %s: producto %s × %d",
            id_pedido, id_producto, cantidad,
        )
        return True

    except (ValueError, PyMongoError) as e:
        logger.error("Error al agregar ítem al pedido: %s", e)
        print(f"\n  ❌ Error: {e}")
        return False


# ─── DELETE ───────────────────────────────────────────────────────────────────

def cancelar_pedido(id_pedido: str) -> bool:
    """Cancela un pedido cambiando su estado a 'cancelado'.

    Usa cambiar_estado() que aplica la validación de la máquina de estados.

    Args:
        id_pedido: ID del pedido a cancelar.

    Returns:
        bool: True si el pedido fue cancelado.
    """
    return cambiar_estado(id_pedido, "cancelado")


def eliminar_pedido(id_pedido: str, confirmar: bool = False) -> bool:
    """Elimina permanentemente un pedido.

    ⚠️ Usar solo en casos excepcionales (pedidos de prueba, errores graves).
    En producción, se recomienda cancelar el pedido en lugar de eliminarlo.

    Args:
        id_pedido: ID del pedido a eliminar.
        confirmar: Debe ser True para confirmar la operación.

    Returns:
        bool: True si fue eliminado.
    """
    if not confirmar:
        print("\n  ⚠️  Pasar confirmar=True para eliminar permanentemente.")
        return False
    try:
        resultado = get_db().pedidos.delete_one({"_id": ObjectId(id_pedido)})
        if resultado.deleted_count == 0:
            print(f"\n  ⚠️  Pedido '{id_pedido}' no encontrado.")
            return False
        logger.info("Pedido eliminado permanentemente: %s", id_pedido)
        return True
    except (InvalidId, PyMongoError) as e:
        logger.error("Error al eliminar pedido: %s", e)
        print(f"\n  ❌ Error: {e}")
        return False
