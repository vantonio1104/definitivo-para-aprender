"""
Operaciones CRUD para la colección 'productos'.
"""
from config.conexion import get_database
from models.producto import Producto
from utils.validaciones import validar_precio
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from typing import List, Optional

db = get_database()
productos_col = db.productos

def crear_producto(nombre: str, precio: float, categoria: str, descripcion: str) -> Optional[ObjectId]:
    """Inserta un nuevo producto validando el precio."""
    if not validar_precio(precio):
        print("ERROR: El precio no puede ser negativo.")
        return None
        
    producto = Producto(nombre, precio, categoria, descripcion)
    try:
        resultado = productos_col.insert_one(producto.to_dict())
        print(f"Producto insertado con ID: {resultado.inserted_id}")
        return resultado.inserted_id
    except PyMongoError as e:
        print(f"Error insertando producto: {e}")
        return None

def leer_productos() -> List[dict]:
    """Retorna el listado completo de productos."""
    return list(productos_col.find())

def actualizar_producto(id_producto: str, datos_nuevos: dict) -> bool:
    """Modifica atributos de un producto."""
    if "precio" in datos_nuevos and not validar_precio(datos_nuevos["precio"]):
        print("ERROR: El precio nuevo no puede ser negativo.")
        return False
        
    try:
        resultado = productos_col.update_one({"_id": ObjectId(id_producto)}, {"$set": datos_nuevos})
        return resultado.modified_count > 0
    except Exception as e:
        print(f"Error actualizando producto: {e}")
        return False

def eliminar_producto(id_producto: str) -> bool:
    """Elimina un producto del catálogo."""
    try:
        resultado = productos_col.delete_one({"_id": ObjectId(id_producto)})
        return resultado.deleted_count > 0
    except Exception as e:
        print(f"Error eliminando producto: {e}")
        return False
