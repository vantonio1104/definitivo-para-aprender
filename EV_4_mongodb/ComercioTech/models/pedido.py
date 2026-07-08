"""
Modelo de datos para Pedido y su Detalle embebido.
"""
from datetime import datetime
from typing import List, Dict, Any

class Pedido:
    """Clase que representa una transacción de compra (Pedido)."""
    
    def __init__(self, id_cliente: int, detalle: List[Dict[str, Any]], estado: str = "pendiente"):
        """
        Inicializa un Pedido.
        
        Args:
            id_cliente (int): Referencia numérica al documento Cliente.
            detalle (List[Dict]): Lista de subdocumentos con los productos comprados.
            estado (str): Estado actual del pedido.
        """
        self.fecha = datetime.utcnow()
        self.estado = estado
        self.id_cliente = id_cliente
        self.detalle = detalle
        self.total = sum(d["cantidad"] * d["precio_unitario"] for d in detalle)
        
    def to_dict(self) -> dict:
        """Convierte a diccionario BSON."""
        return {
            "fecha": self.fecha,
            "estado": self.estado,
            "id_cliente": self.id_cliente,
            "detalle": self.detalle,
            "total": self.total
        }
