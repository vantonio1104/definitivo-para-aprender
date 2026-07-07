"""
Modelo de datos para Cliente.
"""

class Cliente:
    """Clase que representa un Cliente en el sistema ComercioTech."""
    
    def __init__(self, nombre: str, apellido: str, correo: str, telefono: str):
        """
        Inicializa un objeto Cliente.
        
        Args:
            nombre (str): Nombre del cliente.
            apellido (str): Apellido del cliente.
            correo (str): Correo electrónico (único).
            telefono (str): Número de teléfono de contacto.
        """
        self.nombre = nombre
        self.apellido = apellido
        self.correo = correo
        self.telefono = telefono
        
    def to_dict(self) -> dict:
        """
        Convierte el objeto a un diccionario compatible con BSON para inserción.
        
        Returns:
            dict: Representación del cliente.
        """
        return {
            "nombre": self.nombre,
            "apellido": self.apellido,
            "correo": self.correo,
            "telefono": self.telefono
        }
