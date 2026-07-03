# Operaciones CRUD para la colección 'productos'
import logging
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from config.conexion import get_db
from models.producto import nuevo_producto
from utils.validaciones import validar_producto, validar_precio, validar_categoria, validar_stock

logger = logging.getLogger(__name__)

def insertar_producto(datos: dict) -> Optional[str]:
    # Valida y guarda un nuevo producto en la base de datos
    try:
        campos = validar_producto(datos)
        doc = nuevo_producto(**campos)
        resultado = get_db().productos.insert_one(doc)
        id_str = str(resultado.inserted_id)
        logger.info("Producto insertado: %s (%s)", campos["nombre"], id_str)
        return id_str
    except ValueError as e:
        print(f"\n  [!] Datos invalidos:\n{e}")
        return None
    except PyMongoError as e:
        logger.error("Error al insertar producto: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return None

def buscar_producto_por_id(id_producto: str) -> Optional[dict]:
    # Busca un producto por su ObjectId
    try:
        return get_db().productos.find_one({"_id": ObjectId(id_producto)})
    except InvalidId:
        print(f"\n  [!] ID de producto invalido: '{id_producto}'.")
        return None
    except PyMongoError as e:
        logger.error("Error al buscar producto: %s", e)
        return None

def listar_productos(categoria: Optional[str] = None, solo_activos: bool = True, limite: int = 20) -> list[dict]:
    # Lista productos con filtros opcionales de categoría y estado
    try:
        filtro: dict = {}
        if solo_activos:
            filtro["activo"] = True
        if categoria:
            filtro["categoria"] = categoria
        return list(get_db().productos.find(filtro).sort([("categoria", 1), ("nombre", 1)]).limit(limite))
    except PyMongoError as e:
        logger.error("Error al listar productos: %s", e)
        return []

def buscar_texto(texto: str) -> list[dict]:
    # Realiza búsqueda de texto utilizando el índice text
    if not texto or not texto.strip():
        return []
    try:
        return list(
            get_db().productos.find(
                {"$text": {"$search": texto.strip()}},
                {"score": {"$meta": "textScore"}},
            )
            .sort([("score", {"$meta": "textScore"})])
            .limit(10)
        )
    except PyMongoError as e:
        logger.error("Error en búsqueda de texto: %s", e)
        return []

def actualizar_producto(id_producto: str, campos_nuevos: dict) -> bool:
    # Actualiza los campos especificados de un producto
    try:
        oid = ObjectId(id_producto)
    except InvalidId:
        print(f"\n  [!] ID de producto invalido: '{id_producto}'.")
        return False

    datos_validados = {}
    errores = []

    for campo, valor in campos_nuevos.items():
        try:
            if campo == "precio":
                datos_validados["precio"] = validar_precio(valor)
            elif campo == "categoria":
                datos_validados["categoria"] = validar_categoria(valor)
            elif campo == "stock":
                datos_validados["stock"] = validar_stock(valor)
            elif campo == "nombre" and isinstance(valor, str) and len(valor.strip()) >= 2:
                datos_validados["nombre"] = valor.strip()
            elif campo == "descripcion" and isinstance(valor, str):
                datos_validados["descripcion"] = valor.strip()
            elif campo == "activo" and isinstance(valor, bool):
                datos_validados["activo"] = valor
        except ValueError as e:
            errores.append(str(e))

    if errores:
        print("  [!] Errores:\n  - " + "\n  - ".join(errores))
        return False

    if not datos_validados:
        print("  [!] No hay campos validos para actualizar.")
        return False

    try:
        resultado = get_db().productos.update_one({"_id": oid}, {"$set": datos_validados})
        if resultado.matched_count == 0:
            print(f"\n  [!] Producto con ID '{id_producto}' no encontrado.")
            return False
        logger.info("Producto actualizado: %s", id_producto)
        return True
    except PyMongoError as e:
        logger.error("Error al actualizar producto: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return False

def actualizar_precio_por_categoria(categoria: str, factor: float) -> int:
    # Ajusta precios en lote para productos de una misma categoría
    try:
        validar_categoria(categoria)
    except ValueError as e:
        print(f"\n  [!] {e}")
        return 0

    if factor <= 0:
        print("\n  [!] El factor debe ser mayor a 0.")
        return 0

    try:
        resultado = get_db().productos.update_many(
            {"categoria": categoria, "activo": True},
            {"$mul": {"precio": factor}},
        )
        logger.info("Precios actualizados en '%s': %d docs (factor %.2f)", categoria, resultado.modified_count, factor)
        return resultado.modified_count
    except PyMongoError as e:
        logger.error("Error al actualizar precios por categoría: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return 0

def desactivar_producto(id_producto: str) -> bool:
    # Desactiva un producto mediante eliminación lógica
    return actualizar_producto(id_producto, {"activo": False})

def eliminar_producto(id_producto: str, confirmar: bool = False) -> bool:
    # Elimina físicamente un producto si no está en pedidos
    if not confirmar:
        print("\n  [!] Confirmar=True requerido para eliminar permanentemente.")
        return False
    try:
        resultado = get_db().productos.delete_one({"_id": ObjectId(id_producto)})
        if resultado.deleted_count == 0:
            print(f"\n  [!] Producto con ID '{id_producto}' no encontrado.")
            return False
        logger.info("Producto eliminado: %s", id_producto)
        return True
    except (InvalidId, PyMongoError) as e:
        logger.error("Error al eliminar producto: %s", e)
        print(f"\n  [ERROR] Error: {e}")
        return False
