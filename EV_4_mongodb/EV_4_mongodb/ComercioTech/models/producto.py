# Modelo de datos para la entidad Producto
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
    # Crea un diccionario listo para insertar en la colección de productos
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
    # Lista de campos del producto editables por el usuario
    return ["nombre", "precio", "categoria", "descripcion", "stock", "activo"]
