# Punto de entrada del sistema ComercioTech
import sys
import logging
from config.conexion import get_db, cerrar_conexion
from login import login, solicitar_credenciales
from menu import menu_principal

logging.basicConfig(level=logging.WARNING, format="%(asctime)s [%(levelname)s] %(message)s")

MAX_INTENTOS_LOGIN = 3

def verificar_conexion() -> bool:
    # Verifica la disponibilidad de la base de datos antes de iniciar
    try:
        db = get_db()
        db.command("ping")
        return True
    except Exception as e:
        print(f"\n  [ERROR] No se pudo conectar a la base de datos: {e}")
        return False

def flujo_login() -> dict | None:
    # Maneja la autenticación del usuario con un límite de intentos
    for intento in range(1, MAX_INTENTOS_LOGIN + 1):
        usuario, password = solicitar_credenciales()
        datos_usuario = login(usuario, password)

        if datos_usuario:
            return datos_usuario

        restantes = MAX_INTENTOS_LOGIN - intento
        if restantes > 0:
            print(f"\n  [!] Credenciales incorrectas. Intentos restantes: {restantes}")
        else:
            print("\n  [!] Demasiados intentos fallidos. Acceso bloqueado.")

    return None

def main() -> None:
    # Orquesta el ciclo de vida de la aplicación
    print("\n" + "=" * 56)
    print("  ComercioTech -- Sistema de Gestion de BD")
    print("=" * 56)

    if not verificar_conexion():
        sys.exit(1)

    print("  [OK] Conexion establecida correctamente.")

    usuario = flujo_login()
    if not usuario:
        cerrar_conexion()
        sys.exit(1)

    try:
        menu_principal(usuario)
    except KeyboardInterrupt:
        print("\n\n  Aplicacion interrumpida por el usuario.")
    except Exception as e:
        logging.error("Error inesperado en la aplicacion: %s", e, exc_info=True)
        print(f"\n  [ERROR] Error inesperado: {e}")
    finally:
        cerrar_conexion()
        print("  ¡Hasta pronto!\n")

if __name__ == "__main__":
    main()
