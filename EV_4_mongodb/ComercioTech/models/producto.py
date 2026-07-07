"""
Modelo de datos para Producto.
"""

class Producto:
    """Clase que representa un Producto en el catálogo de ComercioTech."""
    
    def __init__(self, nombre: str, precio: float, categoria: str, descripcion: str):
        self.nombre = nombre
        self.precio = float(precio)
        self.categoria = categoria
        self.descripcion = descripcion
        
    def to_dict(self) -> dict:
        """Convierte a diccionario BSON."""
        return {
            "nombre": self.nombre,
            "precio": self.precio,
            "categoria": self.categoria,
            "descripcion": self.descripcion
        }
