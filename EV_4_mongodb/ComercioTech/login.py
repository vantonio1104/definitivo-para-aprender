# Módulo de autenticación de usuarios ComercioTech
import logging
from typing import Optional
import bcrypt
from pymongo.errors import PyMongoError
from config.conexion import get_db

logger = logging.getLogger(__name__)

def verificar_password(password_plano: str, hash_almacenado: str) -> bool:
    # Compara contraseña en texto plano con el hash bcrypt
    try:
        return bcrypt.checkpw(
            password_plano.encode("utf-8"),
            hash_almacenado.encode("utf-8"),
        )
    except Exception as e:
        logger.error("Error al verificar hash bcrypt: %s", e)
        return False

def login(usuario: str, password: str) -> Optional[dict]:
    # Autentica un usuario contra la colección 'usuarios'
    if not usuario or not usuario.strip() or not password:
        print("  [!] El usuario y la contraseña no pueden estar vacíos.")
        return None

    try:
        db = get_db()
        doc = db.usuarios.find_one({"usuario": usuario.strip()})

        if doc is None:
            logger.warning("Login fallido: usuario '%s' no encontrado.", usuario)
            return None

        if not doc.get("activo", True):
            print("  [!] Este usuario está desactivado. Contacte al administrador.")
            return None

        if not verificar_password(password, doc.get("password_hash", "")):
            logger.warning("Login fallido: contraseña incorrecta para '%s'.", usuario)
            return None

        # Retorna el documento del usuario sin incluir el password_hash
        return {k: v for k, v in doc.items() if k != "password_hash"}

    except PyMongoError as e:
        logger.error("Error de base de datos durante login: %s", e)
        print(f"  [ERROR] Error de conexion durante el login: {e}")
        return None

def solicitar_credenciales() -> tuple[str, str]:
    # Solicita credenciales de acceso por consola al operador
    print("\n" + "=" * 50)
    print("  ACCESO AL SISTEMA -- ComercioTech")
    print("=" * 50)
    usuario  = input("  Usuario: ").strip()

    try:
        import getpass
        password = getpass.getpass("  Contrasena: ")
    except Exception:
        password = input("  Contrasena: ")

    return usuario, password
