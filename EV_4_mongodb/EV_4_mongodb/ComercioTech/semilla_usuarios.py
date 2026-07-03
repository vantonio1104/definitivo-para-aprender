"""
semilla_usuarios.py — Script para insertar los usuarios de prueba en MongoDB
==============================================================================
Genera los hashes bcrypt correctos e inserta a los operadores en la 
colección 'usuarios' para poder iniciar sesión en ComercioTech.
"""

import sys
import os
from datetime import datetime, timezone

# Asegurar que importamos desde la ruta correcta
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bcrypt
from config.conexion import get_db, cerrar_conexion
from pymongo.errors import DuplicateKeyError

def crear_hash(password_plano: str) -> str:
    """Genera un hash seguro usando bcrypt con 12 rondas."""
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

    print("\n📦 Insertando usuarios en la base de datos 'comerciotech'...")
    
    # Crear el índice único si no existe
    db.usuarios.create_index("usuario", unique=True, name="idx_usuarios_usuario_unique")

    insertados = 0
    for u in usuarios_prueba:
        try:
            db.usuarios.insert_one(u)
            print(f"  ✅ Usuario creado: {u['usuario']} (Rol: {u['rol']})")
            insertados += 1
        except DuplicateKeyError:
            print(f"  ⚠️  El usuario '{u['usuario']}' ya existe. Omitiendo.")
        except Exception as e:
            print(f"  ❌ Error al insertar '{u['usuario']}': {e}")
            
    print(f"\n🎉 Proceso completado. {insertados} usuarios nuevos agregados.")

if __name__ == "__main__":
    try:
        insertar_usuarios_prueba()
    finally:
        cerrar_conexion()
