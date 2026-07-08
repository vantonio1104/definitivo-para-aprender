"""
Módulo de autenticación (Login).
Utiliza `bcrypt` para validar contraseñas de forma segura.
"""
import bcrypt
from config.conexion import get_database

db = get_database()
usuarios_col = db.usuarios

def autenticar_usuario(usuario: str, password_texto_plano: str) -> dict | None:
    """
    Valida credenciales comparando la contraseña enviada con el hash bcrypt.
    Solo permite el acceso a usuarios con el campo `activo` en True.

    Args:
        usuario (str): Nombre de usuario.
        password_texto_plano (str): Contraseña sin encriptar.

    Returns:
        dict | None: Documento del usuario autenticado (incluye 'rol'),
                     o None si las credenciales son incorrectas o el usuario
                     está desactivado.
    """
    try:
        user_doc = usuarios_col.find_one({"usuario": usuario, "activo": True})
        if user_doc:
            hash_almacenado = user_doc["password_hash"].encode('utf-8')
            password_bytes = password_texto_plano.encode('utf-8')

            if bcrypt.checkpw(password_bytes, hash_almacenado):
                return user_doc
    except Exception as e:
        print(f"Error en validación: {e}")
    return None
