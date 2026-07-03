"""
models/pedido.py — Modelo de datos para la entidad Pedido
==========================================================
Define la estructura de un documento de pedido, incluyendo el
array 'detalle[]' con subdocumentos embebidos.

DECISIÓN DE DISEÑO — detalle[] como subdocumentos embebidos:
  Los ítems del pedido van embebidos (no en colección separada) porque:
  1. Siempre se acceden junto al pedido → un solo findOne() sin JOINs.
  2. El precio_unitario es un snapshot inmutable del precio al momento
     de la compra. Si el precio del producto cambia, el pedido histórico
     conserva el valor real pagado.
  3. La cardinalidad es acotada (típicamente 1–50 ítems por pedido).
"""

from datetime import datetime, timezone
from typing import Optional
# pyrefly: ignore [missing-import]
from bson import ObjectId


def nuevo_item_detalle(
    id_producto: ObjectId,
    cantidad: int,
    precio_unitario: float,
) -> dict:
    """Construye un subdocumento de ítem para el array detalle[].

    Args:
        id_producto:     ObjectId del producto en la colección 'productos'.
        cantidad:        Unidades compradas (mínimo 1).
        precio_unitario: Precio al momento de la compra (snapshot inmutable).

    Returns:
        dict: Subdocumento listo para incluir en detalle[].
    """
    return {
        "id_producto":     id_producto,
        "cantidad":        int(cantidad),
        "precio_unitario": float(precio_unitario),
    }


def calcular_total(detalle: list[dict]) -> float:
    """Calcula el total del pedido sumando cantidad × precio_unitario.

    Args:
        detalle: Lista de subdocumentos del array detalle[].

    Returns:
        float: Total del pedido redondeado a 2 decimales.
    """
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
    """Construye un documento de pedido listo para insertar en MongoDB.

    El estado inicial siempre es 'pendiente'. El historial de estados
    se inicializa con la entrada de creación para trazabilidad completa.

    Args:
        id_cliente:        ObjectId del cliente en la colección 'clientes'.
        detalle:           Lista de subdocumentos generados con nuevo_item_detalle().
        direccion_entrega: Dirección de despacho (opcional).
        notas:             Observaciones adicionales (opcional).

    Returns:
        dict: Documento BSON del pedido listo para db.pedidos.insert_one().
    """
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
