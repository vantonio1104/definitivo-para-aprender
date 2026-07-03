# Modelo de datos para la entidad Cliente
from datetime import datetime, timezone
from typing import Optional

def nuevo_cliente(
    nombre: str,
    apellido: str,
    correo: str,
    telefono: Optional[str] = None,
    activo: bool = True,
) -> dict:
    # Crea un diccionario listo para insertar en la colección de clientes
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
    # Lista de campos del cliente editables por el usuario
    return ["nombre", "apellido", "correo", "telefono", "activo"]
