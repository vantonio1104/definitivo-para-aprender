"""
Script para recrear la base de datos ComercioTech desde cero,
aplicando la nueva estructura de _id como enteros numéricos.
"""
from config.conexion import get_database
from pymongo import IndexModel, ASCENDING, DESCENDING
from datetime import datetime

db = get_database()

print("Borrando colecciones existentes...")
for col in ["clientes", "productos", "pedidos", "usuarios", "contadores"]:
    db[col].drop()
    print(f"  🗑️ {col} eliminada")

# 1. ESQUEMAS DE VALIDACIÓN
print("\nCreando colecciones con validadores JSON Schema...")

db.create_collection("clientes", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "nombre", "apellido", "correo"],
        "additionalProperties": True,
        "properties": {
            "_id": {"bsonType": "int"},
            "nombre": {"bsonType": "string", "minLength": 2, "maxLength": 100},
            "apellido": {"bsonType": "string", "minLength": 2, "maxLength": 100},
            "correo": {"bsonType": "string", "pattern": "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"},
            "telefono": {"bsonType": "string", "pattern": "^\\+?[0-9\\s\\-]{7,20}$"},
            "fecha_registro": {"bsonType": "date"},
            "activo": {"bsonType": "bool"}
        }
    }
})

db.create_collection("productos", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "nombre", "precio", "categoria"],
        "additionalProperties": True,
        "properties": {
            "_id": {"bsonType": "int"},
            "nombre": {"bsonType": "string", "minLength": 2, "maxLength": 200},
            "precio": {"bsonType": ["double", "int", "long"], "minimum": 0.01},
            "categoria": {"bsonType": "string", "enum": ["Electrónica", "Ropa y Calzado", "Hogar y Jardín", "Deportes", "Alimentos", "Libros y Educación", "Herramientas", "Juguetes", "Salud y Belleza", "Otros"]},
            "descripcion": {"bsonType": "string", "maxLength": 2000},
            "stock": {"bsonType": "int", "minimum": 0},
            "activo": {"bsonType": "bool"},
            "fecha_creacion": {"bsonType": "date"}
        }
    }
})

db.create_collection("pedidos", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "fecha", "estado", "id_cliente", "detalle"],
        "additionalProperties": True,
        "properties": {
            "_id": {"bsonType": "int"},
            "fecha": {"bsonType": "date"},
            "estado": {"bsonType": "string", "enum": ["pendiente", "procesando", "despachado", "entregado", "cancelado"]},
            "id_cliente": {"bsonType": "int"},
            "detalle": {
                "bsonType": "array",
                "minItems": 1,
                "items": {
                    "bsonType": "object",
                    "required": ["id_producto", "cantidad", "precio_unitario"],
                    "additionalProperties": False,
                    "properties": {
                        "id_producto": {"bsonType": "int"},
                        "cantidad": {"bsonType": "int", "minimum": 1},
                        "precio_unitario": {"bsonType": ["double", "int", "long"], "minimum": 0.01}
                    }
                }
            },
            "total": {"bsonType": ["double", "int", "long"], "minimum": 0},
            "historial_estados": {
                "bsonType": "array",
                "items": {
                    "bsonType": "object",
                    "required": ["estado", "fecha"],
                    "properties": {
                        "estado": {"bsonType": "string"},
                        "fecha": {"bsonType": "date"}
                    }
                }
            },
            "direccion_entrega": {"bsonType": "string"},
            "notas": {"bsonType": "string", "maxLength": 500}
        }
    }
})

db.create_collection("usuarios", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "usuario", "password_hash", "rol"],
        "additionalProperties": False,
        "properties": {
            "_id": {"bsonType": "int"},
            "usuario": {"bsonType": "string", "minLength": 3, "maxLength": 50},
            "password_hash": {"bsonType": "string", "minLength": 60},
            "rol": {"bsonType": "string", "enum": ["admin", "vendedor", "bodega", "reportes"]},
            "activo": {"bsonType": "bool"},
            "ultimo_acceso": {"bsonType": ["date", "null"]}
        }
    }
})

# 2. ÍNDICES
print("\nCreando índices...")
db.clientes.create_index("correo", unique=True)
db.clientes.create_index("telefono", sparse=True)
db.clientes.create_index([("apellido", ASCENDING), ("nombre", ASCENDING)])
db.productos.create_index([("categoria", ASCENDING), ("nombre", ASCENDING)])
db.productos.create_index([("nombre", "text"), ("descripcion", "text")], weights={"nombre": 10, "descripcion": 3})
db.productos.create_index("precio")
db.pedidos.create_index([("id_cliente", ASCENDING), ("fecha", DESCENDING)])
db.pedidos.create_index([("estado", ASCENDING), ("fecha", ASCENDING)])
db.pedidos.create_index("detalle.id_producto")
db.usuarios.create_index("usuario", unique=True)

# 3. INSERTAR DATOS SEMILLA
print("\nInsertando datos semilla...")

db.clientes.insert_many([
    {"_id": 101, "nombre": "Valentina", "apellido": "Morales", "correo": "valentina.morales@gmail.com", "telefono": "+56912345678", "fecha_registro": datetime.fromisoformat("2024-03-15T10:00:00"), "activo": True},
    {"_id": 102, "nombre": "Rodrigo", "apellido": "Fernández", "correo": "rodrigo.fernandez@outlook.com", "telefono": "+56987654321", "fecha_registro": datetime.fromisoformat("2024-06-01T14:30:00"), "activo": True},
    {"_id": 103, "nombre": "Camila", "apellido": "Vásquez", "correo": "camila.vasquez@empresa.cl", "telefono": "+56922334455", "fecha_registro": datetime.fromisoformat("2025-01-20T09:15:00"), "activo": True},
    {"_id": 104, "nombre": "Andrés", "apellido": "Soto", "correo": "andres.soto@gmail.com", "telefono": "+56933221100", "fecha_registro": datetime.fromisoformat("2025-04-10T11:45:00"), "activo": False}
])

db.productos.insert_many([
    {"_id": 301, "nombre": "Laptop Lenovo IdeaPad 3", "precio": 549990.0, "categoria": "Electrónica", "descripcion": "Laptop 15.6\", Intel Core i5 12ª gen", "stock": 25, "activo": True, "fecha_creacion": datetime.fromisoformat("2024-01-10T00:00:00")},
    {"_id": 302, "nombre": "Zapatillas Running Nike Air Zoom", "precio": 89990.0, "categoria": "Ropa y Calzado", "descripcion": "Suela amortiguada, talla 42", "stock": 80, "activo": True, "fecha_creacion": datetime.fromisoformat("2024-02-05T00:00:00")},
    {"_id": 303, "nombre": "Set de Ollas Antiadherentes (6 piezas)", "precio": 34990.0, "categoria": "Hogar y Jardín", "descripcion": "6 ollas con tapas de vidrio", "stock": 50, "activo": True, "fecha_creacion": datetime.fromisoformat("2024-03-01T00:00:00")},
    {"_id": 304, "nombre": "Bicicleta de Montaña Trek Marlin 5", "precio": 449990.0, "categoria": "Deportes", "descripcion": "MTB aro 29, 21 velocidades", "stock": 10, "activo": True, "fecha_creacion": datetime.fromisoformat("2024-04-15T00:00:00")},
    {"_id": 305, "nombre": "Smartwatch Samsung Galaxy Watch 6", "precio": 179990.0, "categoria": "Electrónica", "descripcion": "Reloj inteligente 44mm, GPS", "stock": 30, "activo": True, "fecha_creacion": datetime.fromisoformat("2024-05-20T00:00:00")}
])

db.pedidos.insert_many([
    {"_id": 201, "fecha": datetime.fromisoformat("2025-11-25T10:30:00"), "estado": "entregado", "id_cliente": 101, "detalle": [{"id_producto": 301, "cantidad": 1, "precio_unitario": 549990.0}, {"id_producto": 305, "cantidad": 1, "precio_unitario": 179990.0}], "total": 729980.0, "direccion_entrega": "Av. Providencia 1234", "historial_estados": [{"estado": "pendiente", "fecha": datetime.fromisoformat("2025-11-25T10:30:00")}, {"estado": "procesando", "fecha": datetime.fromisoformat("2025-11-25T11:00:00")}, {"estado": "despachado", "fecha": datetime.fromisoformat("2025-11-26T09:00:00")}, {"estado": "entregado", "fecha": datetime.fromisoformat("2025-11-27T14:15:00")}]},
    {"_id": 202, "fecha": datetime.fromisoformat("2026-07-01T16:45:00"), "estado": "pendiente", "id_cliente": 102, "detalle": [{"id_producto": 302, "cantidad": 2, "precio_unitario": 89990.0}, {"id_producto": 303, "cantidad": 1, "precio_unitario": 34990.0}], "total": 214970.0, "direccion_entrega": "Calle Los Leones 456", "historial_estados": [{"estado": "pendiente", "fecha": datetime.fromisoformat("2026-07-01T16:45:00")}]},
    {"_id": 203, "fecha": datetime.fromisoformat("2026-06-28T09:00:00"), "estado": "despachado", "id_cliente": 103, "detalle": [{"id_producto": 304, "cantidad": 1, "precio_unitario": 449990.0}], "total": 449990.0, "direccion_entrega": "Pasaje Los Pinos 789", "notas": "Entregar en portería", "historial_estados": [{"estado": "pendiente", "fecha": datetime.fromisoformat("2026-06-28T09:00:00")}, {"estado": "procesando", "fecha": datetime.fromisoformat("2026-06-28T10:30:00")}, {"estado": "despachado", "fecha": datetime.fromisoformat("2026-06-30T08:00:00")}]},
    {"_id": 204, "fecha": datetime.fromisoformat("2026-05-10T12:00:00"), "estado": "cancelado", "id_cliente": 101, "detalle": [{"id_producto": 303, "cantidad": 1, "precio_unitario": 34990.0}], "total": 34990.0, "notas": "Cancelado por duplicidad", "historial_estados": [{"estado": "pendiente", "fecha": datetime.fromisoformat("2026-05-10T12:00:00")}, {"estado": "cancelado", "fecha": datetime.fromisoformat("2026-05-10T12:30:00")}]}
])

db.usuarios.insert_many([
    {"_id": 401, "usuario": "admin_ct", "password_hash": "$2b$12$an.qXBaPBCdlYSLTgAakruxT5M.F3mD6eV9qBQN/hzHFSJ2joDi1C", "rol": "admin", "activo": True, "ultimo_acceso": datetime.fromisoformat("2026-07-01T08:00:00")},
    {"_id": 402, "usuario": "vendedor1", "password_hash": "$2b$12$mQVjZmc7vJHZQ0cU.bxqqee58kT.1HiloXrVDMz8NckdcNF36jxee", "rol": "vendedor", "activo": True, "ultimo_acceso": datetime.fromisoformat("2026-07-02T09:30:00")},
    {"_id": 403, "usuario": "bodega_ct", "password_hash": "$2b$12$3SLpk2DjvY/onlYawDwZ7edZOrDVghOEfXwm3dijyO9bgUvAny5qu", "rol": "bodega", "activo": True, "ultimo_acceso": None},
    {"_id": 404, "usuario": "reporter_ct", "password_hash": "$2b$12$SsZRXQ4LY5jJQPJOrgqIuOkgrizXD37UNhvs1HA9VRX.g.UvzERDy", "rol": "reportes", "activo": True, "ultimo_acceso": None}
])

print("\n✅ Migración completa y exitosa!")
