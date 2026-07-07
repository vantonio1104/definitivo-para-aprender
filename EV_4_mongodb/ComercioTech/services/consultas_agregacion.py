"""
Servicios de Agregación de MongoDB (Fase 4).
Utiliza el framework de agregación para analítica de datos.
"""
from config.conexion import get_database
from typing import List

db = get_database()

def total_vendido_por_cliente() -> List[dict]:
    """
    Calcula el monto total gastado por cada cliente.
    Pipeline:
    1. $lookup: Trae los datos del cliente vinculados al pedido.
    2. $unwind: Desenrolla el array de clientes (producto del lookup).
    3. $unwind: Desenrolla el array de detalle para acceder a cada producto.
    4. $group: Agrupa por cliente, calculando SUM(cantidad * precio_unitario).
    
    Valor de Negocio: Permite identificar a los mejores clientes para campañas
    de fidelización (VIP) o recompensas.
    """
    pipeline = [
        {"$lookup": {
            "from": "clientes",
            "localField": "id_cliente",
            "foreignField": "_id",
            "as": "cliente_info"
        }},
        {"$unwind": "$cliente_info"},
        {"$unwind": "$detalle"},
        {"$group": {
            "_id": "$cliente_info._id",
            "nombre": {"$first": "$cliente_info.nombre"},
            "apellido": {"$first": "$cliente_info.apellido"},
            "total_gastado": {"$sum": {"$multiply": ["$detalle.cantidad", "$detalle.precio_unitario"]}}
        }},
        {"$sort": {"total_gastado": -1}}
    ]
    return list(db.pedidos.aggregate(pipeline))

def producto_mas_vendido() -> List[dict]:
    """
    Identifica los productos más vendidos en términos de volumen (cantidad).
    Pipeline:
    1. $unwind: Desenrolla los detalles de pedidos.
    2. $group: Agrupa por id_producto sumando las cantidades.
    3. $sort: Ordena de mayor a menor cantidad.
    4. $lookup: Recupera el nombre del producto desde la colección 'productos'.
    
    Valor de Negocio: Ayuda a la gerencia de inventario a priorizar el
    reabastecimiento y conocer los productos estrella.
    """
    pipeline = [
        {"$unwind": "$detalle"},
        {"$group": {
            "_id": "$detalle.id_producto",
            "cantidad_total": {"$sum": "$detalle.cantidad"}
        }},
        {"$sort": {"cantidad_total": -1}},
        {"$lookup": {
            "from": "productos",
            "localField": "_id",
            "foreignField": "_id",
            "as": "producto_info"
        }},
        {"$unwind": "$producto_info"},
        {"$project": {
            "nombre_producto": "$producto_info.nombre",
            "cantidad_total": 1
        }}
    ]
    return list(db.pedidos.aggregate(pipeline))

def promedio_gasto_por_pedido() -> List[dict]:
    """
    Calcula el gasto promedio global de todos los pedidos y luego por estado.
    Pipeline:
    1. $unwind: Desenrolla los detalles.
    2. $group: Calcula el total de cada pedido por separado.
    3. $group: Calcula el promedio global ($avg) sobre el total de cada pedido.
    
    Valor de Negocio: Establece el 'Ticket Promedio', una métrica clave (KPI) 
    del comercio electrónico para evaluar el éxito de ventas cruzadas.
    """
    pipeline = [
        {"$unwind": "$detalle"},
        # Primer agrupamiento: calcular total por pedido
        {"$group": {
            "_id": "$_id",
            "estado": {"$first": "$estado"},
            "total_pedido": {"$sum": {"$multiply": ["$detalle.cantidad", "$detalle.precio_unitario"]}}
        }},
        # Segundo agrupamiento: Promedio global general
        {"$group": {
            "_id": "$estado",
            "promedio_ticket": {"$avg": "$total_pedido"}
        }}
    ]
    return list(db.pedidos.aggregate(pipeline))

if __name__ == "__main__":
    print("=== TEST DE AGREGACIONES ===")
    print("\n1. Total vendido por cliente:")
    for doc in total_vendido_por_cliente():
        print(doc)
    print("\n2. Productos más vendidos:")
    for doc in producto_mas_vendido():
        print(doc)
    print("\n3. Ticket promedio por estado de pedido:")
    for doc in promedio_gasto_por_pedido():
        print(doc)
