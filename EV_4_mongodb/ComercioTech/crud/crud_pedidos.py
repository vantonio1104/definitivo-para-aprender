"""
Operaciones CRUD para la colección 'pedidos'.
Demuestra el manejo de datos embebidos (subdocumentos) y relaciones.
"""
from config.conexion import get_database
from models.pedido import Pedido
from utils.validaciones import validar_cantidad, validar_estado_pedido
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from typing import List, Tuple, Optional

db = get_database()
pedidos_col = db.pedidos
clientes_col = db.clientes
productos_col = db.productos

def crear_pedido(id_cliente_str: str, items_detalle: List[Tuple[str, int]]) -> Optional[ObjectId]:
    """
    Construye y registra un pedido con productos embebidos.
    
    Args:
        id_cliente_str (str): ObjectId en texto del cliente.
        items_detalle (List[Tuple[str, int]]): Lista de tuplas (id_producto_str, cantidad).
        
    Returns:
        ObjectId: ID del pedido creado, o None si hay error.
    """
    try:
        id_cliente = ObjectId(id_cliente_str)
        if not clientes_col.find_one({"_id": id_cliente}):
            print("ERROR: El cliente referenciado no existe.")
            return None
            
        detalle_embebido = []
        for id_prod_str, cant in items_detalle:
            if not validar_cantidad(cant):
                print(f"ERROR: Cantidad inválida: {cant}")
                return None
                
            id_prod = ObjectId(id_prod_str)
            prod = productos_col.find_one({"_id": id_prod})
            if not prod:
                print(f"ERROR: Producto {id_prod_str} no existe.")
                return None
                
            # Patrón Subdocumento: Embebiendo precio y datos de producto
            detalle_embebido.append({
                "id_producto": id_prod,
                "cantidad": cant,
                "precio_unitario": prod["precio"]
            })
            
        if not detalle_embebido:
            print("ERROR: El pedido no tiene productos.")
            return None
            
        pedido = Pedido(id_cliente, detalle_embebido)
        resultado = pedidos_col.insert_one(pedido.to_dict())
        print(f"Pedido creado satisfactoriamente: {resultado.inserted_id}")
        return resultado.inserted_id
        
    except Exception as e:
        print(f"Error general creando pedido: {e}")
        return None

def leer_pedidos() -> List[dict]:
    """Obtiene la lista de pedidos con todos sus subdocumentos."""
    return list(pedidos_col.find())

def actualizar_estado_pedido(id_pedido: str, nuevo_estado: str) -> bool:
    """Actualiza el valor de estado del pedido (ej. de Pendiente a Enviado)."""
    if not validar_estado_pedido(nuevo_estado):
        print("ERROR: Estado provisto no es válido.")
        return False
        
    try:
        res = pedidos_col.update_one(
            {"_id": ObjectId(id_pedido)},
            {"$set": {"estado": nuevo_estado}}
        )
        return res.modified_count > 0
    except Exception as e:
        print(f"Error actualizando estado: {e}")
        return False

def eliminar_pedido(id_pedido: str) -> bool:
    """Borra el pedido del sistema."""
    try:
        res = pedidos_col.delete_one({"_id": ObjectId(id_pedido)})
        return res.deleted_count > 0
    except Exception as e:
        print(f"Error eliminando pedido: {e}")
        return False
