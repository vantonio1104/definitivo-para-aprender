"""
main.py — Punto de entrada del sistema ComercioTech
====================================================
Orquesta el flujo completo de la aplicación:
  1. Conectar a MongoDB (con reintentos automáticos)
  2. Presentar pantalla de login (máximo 3 intentos)
  3. Mostrar el menú principal al usuario autenticado
  4. Cerrar la conexión al salir

EJECUTAR:
  Desde la carpeta ComercioTech/:
    python main.py

REQUISITOS PREVIOS:
  1. Tener el archivo .env configurado (copiar de .env.example)
  2. Haber ejecutado crear_db.js en mongosh
  3. Haber instalado las dependencias:
       pip install -r requirements.txt
"""

import sys
import logging
from config.conexion import get_db, cerrar_conexion
from login import login, solicitar_credenciales
from menu import menu_principal

# ─── Configuración de logging ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.WARNING,    # En producción: solo WARN y ERROR en consola
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

MAX_INTENTOS_LOGIN = 3


def verificar_conexion() -> bool:
    """Verifica que la conexión a MongoDB esté disponible antes de iniciar.

    Returns:
        bool: True si la conexión fue exitosa, False si falló.
    """
    try:
        db = get_db()
        db.command("ping")
        return True
    except Exception as e:
        print(f"\n  ❌ No se pudo conectar a MongoDB: {e}")
        print("  Verificar:\n"
              "    1. Que el servicio MongoDB está corriendo\n"
              "    2. Las credenciales en el archivo .env\n"
              "    3. Que .env existe (copiar de .env.example)\n")
        return False


def flujo_login() -> dict | None:
    """Gestiona el proceso de autenticación con máximo de intentos.

    Returns:
        dict | None: Datos del usuario autenticado, o None si falló.
    """
    for intento in range(1, MAX_INTENTOS_LOGIN + 1):
        usuario, password = solicitar_credenciales()
        datos_usuario = login(usuario, password)

        if datos_usuario:
            return datos_usuario

        restantes = MAX_INTENTOS_LOGIN - intento
        if restantes > 0:
            print(f"\n  ❌ Credenciales incorrectas. "
                  f"Intentos restantes: {restantes}")
        else:
            print("\n  ❌ Demasiados intentos fallidos. Acceso bloqueado.")

    return None


def main() -> None:
    """Función principal que orquesta el ciclo de vida de la aplicación."""
    print("\n" + "═" * 56)
    print("  🏪  ComercioTech — Sistema de Gestión de BD")
    print("═" * 56)

    # 1. Verificar conexión a MongoDB
    if not verificar_conexion():
        sys.exit(1)

    print("  ✅ Conexión a MongoDB establecida.")

    # 2. Proceso de autenticación
    usuario = flujo_login()
    if not usuario:
        cerrar_conexion()
        sys.exit(1)

    # 3. Menú principal
    try:
        menu_principal(usuario)
    except KeyboardInterrupt:
        print("\n\n  Aplicación interrumpida por el usuario.")
    except Exception as e:
        logging.error("Error inesperado en la aplicación: %s", e, exc_info=True)
        print(f"\n  ❌ Error inesperado: {e}")
    finally:
        # 4. Cerrar conexión siempre, incluso si hay error
        cerrar_conexion()
        print("  ¡Hasta pronto!\n")


if __name__ == "__main__":
    main()
