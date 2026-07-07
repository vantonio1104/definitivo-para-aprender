# Modelo de datos para la entidad Pedido
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

def nuevo_item_detalle(
    id_producto: ObjectId,
    cantidad: int,
    precio_unitario: float,
) -> dict:
    # Crea un subdocumento para un ítem del detalle del pedido
    return {
        "id_producto":     id_producto,
        "cantidad":        int(cantidad),
        "precio_unitario": float(precio_unitario),
    }

def calcular_total(detalle: list[dict]) -> float:
    # Calcula la suma total de cantidad * precio_unitario
    return round(
        sum(item["cantidad"] * item["precio_unitario"] for item in detalle),
        2,
    )

def nuevo_pedido(
    id_cliente: ObjectId,
    detalle: list[dict],
    direccion_entrega: Optional[str] = None,
    notas: Optional[str] = None,
) -> dict:
    # Crea el documento base de un nuevo pedido en estado 'pendiente'
    ahora = datetime.now(timezone.utc)
    doc: dict = {
        "fecha":      ahora,
        "estado":     "pendiente",
        "id_cliente": id_cliente,
        "detalle":    detalle,
        "total":      calcular_total(detalle),
        "historial_estados": [
            {"estado": "pendiente", "fecha": ahora}
        ],
    }
    if direccion_entrega and direccion_entrega.strip():
        doc["direccion_entrega"] = direccion_entrega.strip()
    if notas and notas.strip():
        doc["notas"] = notas.strip()
    return doc
