"""
Generador de IDs secuenciales dinámicos para ComercioTech.

Consulta el documento con el _id más alto en una colección
y retorna ese valor + 1.
"""
from config.conexion import get_database

def siguiente_id(nombre_coleccion: str, base: int) -> int:
    """
    Genera el siguiente ID sumándole 1 al _id más alto actual.

    Args:
        nombre_coleccion (str): Nombre de la colección (ej. "clientes").
        base (int): Valor inicial si la colección está vacía (ej. 101, 201, 301).

    Returns:
        int: Siguiente _id numérico disponible.
    """
    db = get_database()
    col = db[nombre_coleccion]

    # Busca el documento con el _id más alto numéricamente
    ultimo_doc = col.find_one({}, sort=[("_id", -1)])
    
    if ultimo_doc and isinstance(ultimo_doc.get("_id"), int):
        return ultimo_doc["_id"] + 1
    
    # Si la colección está vacía o no tiene _ids numéricos, empezamos en la base
    return base
