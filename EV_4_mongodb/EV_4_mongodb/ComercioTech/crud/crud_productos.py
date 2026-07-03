"""
crud/crud_productos.py — Operaciones CRUD para la colección 'productos'
=======================================================================
Implementa Create, Read, Update y Delete para la entidad Producto.
Incluye búsqueda de texto completo (índice text) y actualización
masiva de precios por categoría.

Referencia normativa: Sección 4.1.6 · Punto G.23
"""

import logging
from typing import Optional
# pyrefly: ignore [missing-import]
from bson import ObjectId
# pyrefly: ignore [missing-import]
from bson.errors import InvalidId
# pyrefly: ignore [missing-import]
from pymongo.errors import PyMongoError

from config.conexion import get_db
from models.producto import nuevo_producto
from utils.validaciones import (
    validar_producto,
    validar_precio,
    validar_categoria,
    validar_stock,
)

logger = logging.getLogger(__name__)


# ─── CREATE ──────────────────────────────────────────────────────────────────

def insertar_producto(datos: dict) -> Optional[str]:
    """Inserta un nuevo producto en la colección 'productos'.

    Args:
        datos: Diccionario con los campos del producto.
               Requeridos: nombre, precio, categoria.
               Opcionales: descripcion, stock.

    Returns:
        str | None: ID del documento insertado o None si hubo error.
    """
    try:
        campos = validar_producto(datos)
        doc = nuevo_producto(**campos)
        resultado = get_db().productos.insert_one(doc)
        id_str = str(resultado.inserted_id)
        logger.info("Producto insertado: %s (%s)", campos["nombre"], id_str)
        return id_str

    except ValueError as e:
        print(f"\n  ⚠️  Datos inválidos:\n{e}")
        return None

    except PyMongoError as e:
        logger.error("Error al insertar producto: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return None


# ─── READ ─────────────────────────────────────────────────────────────────────

def buscar_producto_por_id(id_producto: str) -> Optional[dict]:
    """Busca un producto por su ObjectId.

    Args:
        id_producto: ID del producto como string hexadecimal.

    Returns:
        dict | None: Documento del producto o None si no existe.
    """
    try:
        return get_db().productos.find_one({"_id": ObjectId(id_producto)})
    except InvalidId:
        print(f"\n  ⚠️  ID de producto inválido: '{id_producto}'.")
        return None
    except PyMongoError as e:
        logger.error("Error al buscar producto: %s", e)
        return None


def listar_productos(
    categoria: Optional[str] = None,
    solo_activos: bool = True,
    limite: int = 20,
) -> list[dict]:
    """Lista productos con filtros opcionales de categoría y estado.

    Args:
        categoria:    Si se provee, filtra por esa categoría. None = todas.
        solo_activos: Si True, solo retorna productos activos (default: True).
        limite:       Máximo de documentos a retornar (default: 20).

    Returns:
        list[dict]: Lista de documentos de productos.
    """
    try:
        filtro: dict = {}
        if solo_activos:
            filtro["activo"] = True
        if categoria:
            filtro["categoria"] = categoria

        return list(
            get_db()
            .productos.find(filtro)
            .sort([("categoria", 1), ("nombre", 1)])
            .limit(limite)
        )
    except PyMongoError as e:
        logger.error("Error al listar productos: %s", e)
        return []


def buscar_texto(texto: str) -> list[dict]:
    """Búsqueda de texto completo en nombre y descripción (usa índice text).

    El índice de texto asigna peso 10 al nombre y 3 a la descripción,
    por lo que resultados con coincidencia en el nombre aparecen primero.

    Args:
        texto: Texto a buscar (palabras clave).

    Returns:
        list[dict]: Lista de productos ordenados por relevancia.
    """
    if not texto or not texto.strip():
        return []
    try:
        return list(
            get_db()
            .productos.find(
                {"$text": {"$search": texto.strip()}},
                {"score": {"$meta": "textScore"}},
            )
            .sort([("score", {"$meta": "textScore"})])
            .limit(10)
        )
    except PyMongoError as e:
        logger.error("Error en búsqueda de texto: %s", e)
        return []


# ─── UPDATE ───────────────────────────────────────────────────────────────────

def actualizar_producto(id_producto: str, campos_nuevos: dict) -> bool:
    """Actualiza campos específicos de un producto.

    Args:
        id_producto:   ID del producto a actualizar.
        campos_nuevos: Diccionario con campos y valores a modificar.

    Returns:
        bool: True si se modificó al menos un documento.
    """
    try:
        oid = ObjectId(id_producto)
    except InvalidId:
        print(f"\n  ⚠️  ID de producto inválido: '{id_producto}'.")
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
        print("  ⚠️  Errores:\n  · " + "\n  · ".join(errores))
        return False

    if not datos_validados:
        print("  ⚠️  No hay campos válidos para actualizar.")
        return False

    try:
        resultado = get_db().productos.update_one(
            {"_id": oid},
            {"$set": datos_validados},
        )
        if resultado.matched_count == 0:
            print(f"\n  ⚠️  Producto con ID '{id_producto}' no encontrado.")
            return False
        logger.info("Producto actualizado: %s", id_producto)
        return True

    except PyMongoError as e:
        logger.error("Error al actualizar producto: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return False


def actualizar_precio_por_categoria(categoria: str, factor: float) -> int:
    """Actualiza el precio de todos los productos de una categoría por un factor.

    Ejemplo: factor=1.10 aumenta un 10%; factor=0.90 baja un 10%.

    Args:
        categoria: Categoría cuyos precios se ajustarán.
        factor:    Factor multiplicador (debe ser > 0).

    Returns:
        int: Cantidad de documentos modificados.
    """
    try:
        validar_categoria(categoria)
    except ValueError as e:
        print(f"\n  ⚠️  {e}")
        return 0

    if factor <= 0:
        print("\n  ⚠️  El factor debe ser mayor a 0 (ej. 1.10 para +10%).")
        return 0

    try:
        resultado = get_db().productos.update_many(
            {"categoria": categoria, "activo": True},
            {"$mul": {"precio": factor}},
        )
        logger.info(
            "Precios actualizados en '%s': %d documentos (factor %.2f)",
            categoria, resultado.modified_count, factor,
        )
        return resultado.modified_count

    except PyMongoError as e:
        logger.error("Error al actualizar precios por categoría: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return 0


# ─── DELETE ───────────────────────────────────────────────────────────────────

def desactivar_producto(id_producto: str) -> bool:
    """Desactiva un producto (eliminación lógica).

    Establece activo=False. El producto deja de aparecer en el catálogo
    pero se conserva para el historial de pedidos.

    Args:
        id_producto: ID del producto a desactivar.

    Returns:
        bool: True si fue desactivado correctamente.
    """
    return actualizar_producto(id_producto, {"activo": False})


def eliminar_producto(id_producto: str, confirmar: bool = False) -> bool:
    """Elimina permanentemente un producto.

    ⚠️ Solo usar si el producto nunca fue vendido o es un error de carga.
    Si el producto aparece en pedidos históricos, usar desactivar_producto().

    Args:
        id_producto: ID del producto a eliminar.
        confirmar:   Debe ser True para confirmar la eliminación.

    Returns:
        bool: True si fue eliminado.
    """
    if not confirmar:
        print("\n  ⚠️  Pasar confirmar=True para eliminar permanentemente.")
        return False
    try:
        resultado = get_db().productos.delete_one({"_id": ObjectId(id_producto)})
        if resultado.deleted_count == 0:
            print(f"\n  ⚠️  Producto con ID '{id_producto}' no encontrado.")
            return False
        logger.info("Producto eliminado: %s", id_producto)
        return True
    except (InvalidId, PyMongoError) as e:
        logger.error("Error al eliminar producto: %s", e)
        print(f"\n  ❌ Error: {e}")
        return False
