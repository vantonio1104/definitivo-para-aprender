"""
Operaciones CRUD para la colección 'pedidos'.
Demuestra el manejo de datos embebidos (subdocumentos) y relaciones.
"""
from config.conexion import get_database
from models.pedido import Pedido
from utils.validaciones import validar_cantidad, validar_estado_pedido
from utils.id_generator import siguiente_id
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from typing import List, Tuple, Optional

db = get_database()
pedidos_col = db.pedidos
clientes_col = db.clientes
productos_col = db.productos

def crear_pedido(codigo_cliente: str, items_detalle: List[Tuple[str, int]]) -> Optional[int]:
    """
    Construye y registra un pedido con productos embebidos.
    Usa códigos secuenciales en vez de ObjectId para la interfaz de usuario.

    Args:
        codigo_cliente (str): Código del cliente (ej. "101").
        items_detalle (List[Tuple[str, int]]): Lista de tuplas (codigo_producto, cantidad).

    Returns:
        int: Código del pedido creado, o None si hay error.
    """
    try:
        # Buscar cliente por ID numérico
        cliente = clientes_col.find_one({"_id": int(codigo_cliente)})
        if not cliente:
            print("ERROR: El cliente referenciado no existe.")
            return None

        detalle_embebido = []
        for codigo_prod, cant in items_detalle:
            if not validar_cantidad(cant):
                print(f"ERROR: Cantidad inválida: {cant}")
                return None

            # Buscar producto por ID numérico
            prod = productos_col.find_one({"_id": int(codigo_prod)})
            if not prod:
                print(f"ERROR: Producto con código {codigo_prod} no existe.")
                return None

            # Patrón Subdocumento: Embebiendo precio y datos de producto
            detalle_embebido.append({
                "id_producto": prod["_id"],
                "cantidad": cant,
                "precio_unitario": prod["precio"]
            })

        if not detalle_embebido:
            print("ERROR: El pedido no tiene productos.")
            return None

        pedido = Pedido(cliente["_id"], detalle_embebido)
        pedido_dict = pedido.to_dict()
        nuevo_id = siguiente_id("pedidos", 201)
        pedido_dict["_id"] = nuevo_id

        resultado = pedidos_col.insert_one(pedido_dict)
        print(f"Pedido creado con ID: {nuevo_id}")
        return nuevo_id

    except Exception as e:
        print(f"Error general creando pedido: {e}")
        return None

def leer_pedidos() -> List[dict]:
    """Obtiene la lista de pedidos con todos sus subdocumentos."""
    return list(pedidos_col.find())

def actualizar_estado_pedido(codigo_pedido: str, nuevo_estado: str) -> bool:
    """Actualiza el valor de estado del pedido usando su código."""
    if not validar_estado_pedido(nuevo_estado):
        print("ERROR: Estado provisto no es válido.")
        return False

    try:
        res = pedidos_col.update_one(
            {"_id": int(codigo_pedido)},
            {"$set": {"estado": nuevo_estado}}
        )
        if res.modified_count > 0:
            print("Estado del pedido actualizado.")
            return True
        print("No se encontró el pedido o el estado es el mismo.")
        return False
    except Exception as e:
        print(f"Error actualizando estado: {e}")
        return False

def eliminar_pedido(codigo_pedido: str) -> bool:
    """Borra el pedido del sistema usando su código."""
    try:
        res = pedidos_col.delete_one({"_id": int(codigo_pedido)})
        if res.deleted_count > 0:
            print("Pedido eliminado con éxito.")
            return True
        print("No se encontró el pedido para eliminar.")
        return False
    except Exception as e:
        print(f"Error eliminando pedido: {e}")
        return False

def buscar_pedido_por_codigo(codigo: int) -> Optional[dict]:
    """Busca un pedido por su código secuencial."""
    return pedidos_col.find_one({"_id": codigo})
