"""
respaldo_backup.py — Respaldo de la base de datos ComercioTech (MongoDB Atlas)

Ejecuta mongodump para exportar las colecciones clientes, productos,
pedidos y usuarios a una carpeta timestamped dentro de backups/.

Uso:
    python respaldo_backup.py

Requisito: mongodump debe estar instalado y disponible en el PATH.
           (Incluido en MongoDB Database Tools:
            https://www.mongodb.com/try/download/database-tools)

Comando equivalente de restauración (mongorestore):
    mongorestore --uri="mongodb+srv://<usuario>:<password>@<cluster-url>/" ^
        --nsInclude="comerciotech.*" ^
        --dir="backups/backup_<fecha_hora>"
"""

import os
import subprocess
import sys
from datetime import datetime

from dotenv import load_dotenv

# ── Cargar MONGO_URI desde ComercioTech/.env ─────────────────────────
DOTENV_PATH = os.path.join(os.path.dirname(__file__), "ComercioTech", ".env")
load_dotenv(DOTENV_PATH)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ ERROR: No se encontró MONGO_URI en ComercioTech/.env")
    sys.exit(1)

# ── Configuración ────────────────────────────────────────────────────
DB_NAME = "comerciotech"
COLECCIONES = ["clientes", "productos", "pedidos", "usuarios"]
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups", f"backup_{TIMESTAMP}")

# ── Ejecutar mongodump por cada colección ────────────────────────────
print(f"🔄 Iniciando respaldo de '{DB_NAME}' → {BACKUP_DIR}\n")
exitos = []
errores = []

for col in COLECCIONES:
    cmd = [
        "mongodump",
        f"--uri={MONGO_URI}",
        f"--db={DB_NAME}",
        f"--collection={col}",
        f"--out={BACKUP_DIR}",
    ]
    print(f"  ▸ Respaldando colección: {col} ... ", end="", flush=True)
    try:
        resultado = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if resultado.returncode == 0:
            print("✅")
            exitos.append(col)
        else:
            print("❌")
            errores.append((col, resultado.stderr.strip()))
    except FileNotFoundError:
        print("❌ (mongodump no encontrado en PATH)")
        errores.append((col, "mongodump no está instalado o no está en el PATH"))
    except subprocess.TimeoutExpired:
        print("❌ (timeout)")
        errores.append((col, "El comando excedió el tiempo límite de 120 s"))

# ── Resumen ──────────────────────────────────────────────────────────
print("\n" + "=" * 55)
print("📋 RESUMEN DEL RESPALDO")
print("=" * 55)
print(f"  Base de datos : {DB_NAME}")
print(f"  Fecha/hora    : {TIMESTAMP}")
print(f"  Ruta destino  : {BACKUP_DIR}")
print(f"  Colecciones OK: {len(exitos)}/{len(COLECCIONES)}")
if exitos:
    for c in exitos:
        print(f"      ✅ {c}")
if errores:
    print(f"  Errores       : {len(errores)}")
    for c, msg in errores:
        print(f"      ❌ {c}: {msg}")
print("=" * 55)

# ── Recordatorio de restauración ─────────────────────────────────────
print(
    "\n💡 Para restaurar este respaldo, ejecuta:\n"
    f'   mongorestore --uri="<MONGO_URI>" '
    f'--nsInclude="{DB_NAME}.*" '
    f'--dir="{BACKUP_DIR}"\n'
)
