# Semilla para insertar usuarios de prueba en MongoDB
import sys
import os
from datetime import datetime, timezone

# Añadir ruta al sys.path para importar correctamente
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bcrypt
from config.conexion import get_db, cerrar_conexion
from pymongo.errors import DuplicateKeyError

def crear_hash(password_plano: str) -> str:
    # Genera un hash bcrypt con salt rounds 12
    return bcrypt.hashpw(
        password_plano.encode('utf-8'), 
        bcrypt.gensalt(rounds=12)
    ).decode('utf-8')

def insertar_usuarios_prueba():
    db = get_db()
    
    usuarios_prueba = [
        {
            "usuario": "admin_ct",
            "password_hash": crear_hash("Admin2024!"),
            "rol": "admin",
            "activo": True,
            "ultimo_acceso": datetime.now(timezone.utc)
        },
        {
            "usuario": "vendedor1",
            "password_hash": crear_hash("Vendedor#1"),
            "rol": "vendedor",
            "activo": True,
            "ultimo_acceso": datetime.now(timezone.utc)
        },
        {
            "usuario": "bodega_ct",
            "password_hash": crear_hash("Bodega@2024"),
            "rol": "bodega",
            "activo": True,
            "ultimo_acceso": None
        },
        {
            "usuario": "reporter_ct",
            "password_hash": crear_hash("Reports01!"),
            "rol": "reportes",
            "activo": True,
            "ultimo_acceso": None
        }
    ]

    print("\n[INFO] Insertando usuarios en la base de datos...")
    
    db.usuarios.create_index("usuario", unique=True, name="idx_usuarios_usuario_unique")

    insertados = 0
    for u in usuarios_prueba:
        try:
            db.usuarios.insert_one(u)
            print(f"  [OK] Usuario creado: {u['usuario']} (Rol: {u['rol']})")
            insertados += 1
        except DuplicateKeyError:
            print(f"  [!] El usuario '{u['usuario']}' ya existe. Omitiendo.")
        except Exception as e:
            print(f"  [ERROR] Error al insertar '{u['usuario']}': {e}")
            
    print(f"\n[OK] Proceso completado. {insertados} usuarios nuevos agregados.")

if __name__ == "__main__":
    try:
        insertar_usuarios_prueba()
    finally:
        cerrar_conexion()
