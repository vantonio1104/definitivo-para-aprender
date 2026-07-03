"""
models/producto.py — Modelo de datos para la entidad Producto
=============================================================
Define la estructura de un documento de producto y proporciona
un constructor que genera el diccionario BSON listo para insertar
en la colección 'productos' de MongoDB.

El modelo es flexible: acepta atributos opcionales adicionales
por categoría (ej. voltaje para Electrónica, talla para Ropa)
sin necesidad de modificar el esquema de la colección.
"""

from datetime import datetime, timezone
from typing import Optional


def nuevo_producto(
    nombre: str,
    precio: float,
    categoria: str,
    descripcion: Optional[str] = None,
    stock: int = 0,
    activo: bool = True,
) -> dict:
    """Construye un documento de producto listo para insertar en MongoDB.

    Args:
        nombre:      Nombre comercial del producto.
        precio:      Precio de venta en la moneda local (debe ser > 0).
        categoria:   Categoría del catálogo (valor controlado por enum en JSON Schema).
        descripcion: Descripción técnica y comercial (opcional).
        stock:       Unidades disponibles en inventario (default: 0).
        activo:      Si False, el producto no aparece en el catálogo (default: True).

    Returns:
        dict: Documento BSON listo para db.productos.insert_one().
    """
    doc: dict = {
        "nombre":         nombre,
        "precio":         float(precio),
        "categoria":      categoria,
        "stock":          int(stock),
        "activo":         activo,
        "fecha_creacion": datetime.now(timezone.utc),
    }
    if descripcion:
        doc["descripcion"] = descripcion.strip()
    return doc


def campos_actualizables() -> list[str]:
    """Retorna los campos de producto que pueden ser modificados.

    Returns:
        list[str]: Lista de nombres de campo actualizables.
    """
    return ["nombre", "precio", "categoria", "descripcion", "stock", "activo"]
