"""
Operaciones CRUD para la colección 'productos'.
"""
from config.conexion import get_database
from models.producto import Producto
from utils.validaciones import validar_precio
from utils.id_generator import siguiente_id
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from typing import List, Optional

db = get_database()
productos_col = db.productos

def crear_producto(nombre: str, precio: float, categoria: str, descripcion: str) -> Optional[int]:
    """Inserta un nuevo producto validando el precio. Asigna código secuencial."""
    if not validar_precio(precio):
        print("ERROR: El precio no puede ser negativo.")
        return None

    producto = Producto(nombre, precio, categoria, descripcion)
    try:
        producto_dict = producto.to_dict()
        nuevo_id = siguiente_id("productos", 301)
        producto_dict["_id"] = nuevo_id

        resultado = productos_col.insert_one(producto_dict)
        print(f"Producto insertado con ID: {nuevo_id}")
        return nuevo_id
    except PyMongoError as e:
        print(f"Error insertando producto: {e}")
        return None

def leer_productos() -> List[dict]:
    """Retorna el listado completo de productos."""
    return list(productos_col.find())

def actualizar_producto(codigo: str, datos_nuevos: dict) -> bool:
    """Modifica atributos de un producto usando su código."""
    if "precio" in datos_nuevos and not validar_precio(datos_nuevos["precio"]):
        print("ERROR: El precio nuevo no puede ser negativo.")
        return False

    try:
        resultado = productos_col.update_one({"_id": int(codigo)}, {"$set": datos_nuevos})
        if resultado.modified_count > 0:
            print("Producto actualizado con éxito.")
            return True
        print("No se encontró el producto o no hubo cambios reales.")
        return False
    except Exception as e:
        print(f"Error actualizando producto: {e}")
        return False

def eliminar_producto(codigo: str) -> bool:
    """Elimina un producto del catálogo usando su código."""
    try:
        resultado = productos_col.delete_one({"_id": int(codigo)})
        if resultado.deleted_count > 0:
            print("Producto eliminado con éxito.")
            return True
        print("No se encontró el producto para eliminar.")
        return False
    except Exception as e:
        print(f"Error eliminando producto: {e}")
        return False

def buscar_producto_por_codigo(codigo: int) -> Optional[dict]:
    """Busca un producto por su código secuencial."""
    return productos_col.find_one({"_id": codigo})
