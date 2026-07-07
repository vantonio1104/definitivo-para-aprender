"""
Módulo de utilidades para validar datos antes de interactuar con MongoDB.
Estas validaciones funcionan a nivel de aplicación, como complemento a $jsonSchema en BD.
"""
import re

def validar_correo(correo: str) -> bool:
    """
    Valida el formato de un correo electrónico mediante Expresión Regular.
    
    Args:
        correo (str): Correo electrónico a validar.
        
    Returns:
        bool: True si el correo es válido, False en caso contrario.
    """
    patron = r'^.+@.+\..+$'
    return bool(re.match(patron, correo))

def validar_precio(precio: float) -> bool:
    """Valida que el precio no sea negativo."""
    return precio >= 0

def validar_estado_pedido(estado: str) -> bool:
    """Valida que el estado del pedido sea un valor esperado."""
    estados_validos = ["pendiente", "procesando", "despachado", "entregado", "cancelado"]
    return estado in estados_validos

def validar_cantidad(cantidad: int) -> bool:
    """Valida que la cantidad comprada sea mayor a cero."""
    return cantidad > 0
