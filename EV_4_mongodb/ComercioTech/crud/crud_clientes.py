"""
Operaciones CRUD para la colección 'clientes'.
"""
from config.conexion import get_database
from models.cliente import Cliente
from utils.validaciones import validar_correo
from utils.id_generator import siguiente_id
from pymongo.errors import DuplicateKeyError, PyMongoError
from bson.objectid import ObjectId
from typing import List, Optional

db = get_database()
clientes_col = db.clientes

def crear_cliente(nombre: str, apellido: str, correo: str, telefono: str) -> Optional[int]:
    """
    Inserta un nuevo cliente validando el correo electrónico.
    Asigna un código secuencial automático (101, 102, ...).

    Maneja el error de clave duplicada si el correo ya existe.
    """
    if not validar_correo(correo):
        print("ERROR: Correo electrónico inválido.")
        return None

    cliente = Cliente(nombre, apellido, correo, telefono)
    try:
        cliente_dict = cliente.to_dict()
        nuevo_id = siguiente_id("clientes", 101)
        cliente_dict["_id"] = nuevo_id

        resultado = clientes_col.insert_one(cliente_dict)
        print(f"Cliente insertado con ID: {nuevo_id}")
        return nuevo_id
    except DuplicateKeyError:
        print("ERROR: El correo electrónico ya está registrado.")
        return None
    except PyMongoError as e:
        print(f"Error de base de datos: {e}")
        return None

def leer_clientes() -> List[dict]:
    """Lee y retorna todos los clientes."""
    try:
        return list(clientes_col.find())
    except PyMongoError as e:
        print(f"Error leyendo clientes: {e}")
        return []

def actualizar_cliente(codigo: str, datos_nuevos: dict) -> bool:
    """Actualiza parcialmente los datos de un cliente usando su código."""
    if "correo" in datos_nuevos and not validar_correo(datos_nuevos["correo"]):
        print("ERROR: El nuevo correo electrónico es inválido.")
        return False

    try:
        resultado = clientes_col.update_one({"_id": int(codigo)}, {"$set": datos_nuevos})
        if resultado.modified_count > 0:
            print("Cliente actualizado con éxito.")
            return True
        print("No se encontró el cliente o no hubo cambios reales.")
        return False
    except Exception as e:
        print(f"Error al actualizar: {e}")
        return False

def eliminar_cliente(codigo: str) -> bool:
    """Elimina un cliente por su código."""
    try:
        resultado = clientes_col.delete_one({"_id": int(codigo)})
        if resultado.deleted_count > 0:
            print("Cliente eliminado con éxito.")
            return True
        print("No se encontró el cliente para eliminar.")
        return False
    except Exception as e:
        print(f"Error al eliminar: {e}")
        return False

def buscar_cliente_por_codigo(codigo: int) -> Optional[dict]:
    """Busca un cliente por su código secuencial."""
    return clientes_col.find_one({"_id": codigo})
