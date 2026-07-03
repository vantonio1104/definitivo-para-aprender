"""
models/cliente.py — Modelo de datos para la entidad Cliente
============================================================
Define la estructura esperada de un documento de cliente y
proporciona un constructor que genera el diccionario BSON listo
para insertar en la colección 'clientes' de MongoDB.

No se usa un ORM: el modelo es un dict Python puro para mantener
la flexibilidad del esquema documental de MongoDB.
"""

from datetime import datetime, timezone
from typing import Optional


def nuevo_cliente(
    nombre: str,
    apellido: str,
    correo: str,
    telefono: Optional[str] = None,
    activo: bool = True,
) -> dict:
    """Construye un documento de cliente listo para insertar en MongoDB.

    Los campos siguen exactamente el JSON Schema definido en crear_db.js.
    La fecha de registro se asigna automáticamente con la hora UTC actual.

    Args:
        nombre:   Nombre(s) de pila del cliente.
        apellido: Apellido(s) del cliente.
        correo:   Correo electrónico único del cliente.
        telefono: Número de teléfono (opcional).
        activo:   Estado lógico del cliente (default: True).

    Returns:
        dict: Documento BSON listo para db.clientes.insert_one().
    """
    doc: dict = {
        "nombre":          nombre,
        "apellido":        apellido,
        "correo":          correo,
        "fecha_registro":  datetime.now(timezone.utc),
        "activo":          activo,
    }
    if telefono:
        doc["telefono"] = telefono
    return doc


def campos_actualizables() -> list[str]:
    """Retorna los campos del cliente que pueden ser modificados por el usuario.

    Returns:
        list[str]: Lista de nombres de campo actualizables.
    """
    return ["nombre", "apellido", "correo", "telefono", "activo"]
