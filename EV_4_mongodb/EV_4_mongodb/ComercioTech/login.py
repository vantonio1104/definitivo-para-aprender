"""
login.py — Módulo de autenticación de usuarios
===============================================
Valida las credenciales de un operador contra la colección 'usuarios'
de MongoDB. Las contraseñas se comparan usando bcrypt; nunca se almacena
ni se compara texto plano.

Referencia normativa: Sección 4.1.6 · Punto G.22 (Conexión segura)
"""

import logging
from typing import Optional

# pyrefly: ignore [missing-import]
import bcrypt
# pyrefly: ignore [missing-import]
from pymongo.errors import PyMongoError

from config.conexion import get_db

logger = logging.getLogger(__name__)


def verificar_password(password_plano: str, hash_almacenado: str) -> bool:
    """Verifica que una contraseña en texto plano coincida con su hash bcrypt.

    Args:
        password_plano:   Contraseña ingresada por el usuario (texto plano).
        hash_almacenado:  Hash bcrypt almacenado en la colección 'usuarios'.

    Returns:
        bool: True si la contraseña es correcta, False en caso contrario.
    """
    try:
        return bcrypt.checkpw(
            password_plano.encode("utf-8"),
            hash_almacenado.encode("utf-8"),
        )
    except Exception as e:
        logger.error("Error al verificar hash bcrypt: %s", e)
        return False


def login(usuario: str, password: str) -> Optional[dict]:
    """Autentica un operador contra la colección 'usuarios' de MongoDB.

    Proceso:
    1. Busca el documento por nombre de usuario (índice único).
    2. Verifica que el usuario esté activo.
    3. Compara la contraseña con el hash bcrypt almacenado.
    4. Si todo es correcto, retorna el documento del usuario (sin el hash).

    Args:
        usuario:  Nombre de usuario ingresado.
        password: Contraseña en texto plano ingresada por el operador.

    Returns:
        dict | None: Documento del usuario sin 'password_hash' si la
                     autenticación es exitosa; None si falla.
    """
    if not usuario or not usuario.strip():
        print("  ⚠️  El nombre de usuario no puede estar vacío.")
        return None
    if not password:
        print("  ⚠️  La contraseña no puede estar vacía.")
        return None

    try:
        db = get_db()
        doc = db.usuarios.find_one({"usuario": usuario.strip()})

        if doc is None:
            logger.warning("Login fallido: usuario '%s' no encontrado.", usuario)
            return None

        if not doc.get("activo", True):
            print("  ⚠️  Este usuario está desactivado. Contacte al administrador.")
            return None

        hash_bd = doc.get("password_hash", "")
        if not verificar_password(password, hash_bd):
            logger.warning("Login fallido: contraseña incorrecta para '%s'.", usuario)
            return None

        # Autenticación exitosa — retornar datos del usuario sin el hash
        resultado = {k: v for k, v in doc.items() if k != "password_hash"}
        logger.info("Login exitoso: usuario '%s' (rol: %s).", usuario, doc.get("rol"))
        return resultado

    except PyMongoError as e:
        logger.error("Error de base de datos durante login: %s", e)
        print(f"  ❌ Error de conexión durante el login: {e}")
        return None


def solicitar_credenciales() -> tuple[str, str]:
    """Solicita nombre de usuario y contraseña al operador por consola.

    La contraseña no se oculta (getpass opcional para terminales que lo soporten).

    Returns:
        tuple[str, str]: (usuario, password) ingresados por el operador.
    """
    print("\n" + "═" * 50)
    print("  🔐  ACCESO AL SISTEMA — ComercioTech")
    print("═" * 50)
    usuario  = input("  Usuario: ").strip()

    # Intentar usar getpass para ocultar la contraseña en terminales compatibles
    try:
        import getpass
        password = getpass.getpass("  Contraseña: ")
    except Exception:
        password = input("  Contraseña: ")

    return usuario, password
