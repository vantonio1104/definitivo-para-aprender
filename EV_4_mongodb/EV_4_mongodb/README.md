# EV_4_mongodb — ComercioTech · Evaluación 4
## Sistema de Gestión de BD NoSQL con MongoDB

**Motor:** MongoDB 8.2.6 Community Edition  
**Entorno:** Windows 10 Home Single Language (Build 26200) — 64 bits  
**CPU:** Intel Core i5-12450HX (8C/12T) · **RAM:** 24 GB · **Disco libre:** 70,64 GB  
**Driver Python:** PyMongo 4.x

---

## Estructura Completa del Proyecto

```
EV_4_mongodb/
│
├── README.md                        ← Este archivo — índice y guía de uso
│
│  ── DOCUMENTACIÓN ─────────────────────────────────────────────────────
├── fase1_instalacion_mongodb.md     ← Procedimiento instalación (G.13, G.16)
│                                       20 capturas de pantalla numeradas
├── fase2_modelo_datos.md            ← Diseño documental NoSQL (G.17)
│                                       Embeber vs. Referenciar, diagramas
│
│  ── SCRIPTS MongoDB (mongosh) ──────────────────────────────────────────
├── crear_db.js                      ← BD + colecciones + índices + datos (G.18, G.19)
├── crear_usuarios_mongodb.js        ← Usuarios con roles (G.14, G.15)
│
│  ── CONFIGURACIÓN ──────────────────────────────────────────────────────
├── mongod.cfg                       ← Configuración real del servidor MongoDB
│                                       (copiar a C:\Program Files\MongoDB\Server\8.2\bin\)
│
│  ── SCRIPTS PowerShell (Windows) ───────────────────────────────────────
├── setup_entorno.ps1                ← Preparación completa del entorno Windows
│                                       (directorios, permisos, firewall, servicio)
├── setup_backup.ps1                 ← Backup automático horario (Task Scheduler)
├── verificar_mongodb.ps1            ← Diagnóstico rápido del entorno
│
│  ── CONEXIÓN PYTHON (PyMongo) ──────────────────────────────────────────
└── conexion_python/
    ├── .env.ejemplo                 ← Plantilla de variables de entorno
    ├── requirements.txt             ← pymongo, python-dotenv, bcrypt
    ├── conexion.py                  ← Módulo de conexión reutilizable
    └── test_conexion.py             ← Tests de integración (8 tests CRUD + aggregation)
```

---

## Orden de Ejecución Paso a Paso

### FASE 1 — Preparar el entorno Windows

```powershell
# Ejecutar como Administrador
Set-ExecutionPolicy Bypass -Scope Process
.\setup_entorno.ps1
```
→ Crea directorios, copia `mongod.cfg`, configura firewall, reinicia el servicio.

### FASE 2 — Crear la base de datos y colecciones

```powershell
# Sin autenticación (primera vez)
mongosh crear_db.js
```
→ Crea la BD `comerciotech` con 4 colecciones, 10 índices y datos de ejemplo.

### FASE 3 — Crear usuarios MongoDB

```powershell
# Sin autenticación (primera vez)
mongosh crear_usuarios_mongodb.js
```
→ Crea superadmin, comerciotech_app, comerciotech_reporter, comerciotech_dba.

### FASE 4 — Habilitar autenticación

Editar `mongod.cfg` y descomentar:
```yaml
security:
  authorization: enabled
```
Luego reiniciar:
```powershell
Restart-Service -Name "MongoDB"
```

### FASE 5 — Configurar Python

```powershell
# Instalar dependencias
pip install -r conexion_python\requirements.txt

# Copiar y configurar .env
copy conexion_python\.env.ejemplo .env
# Editar .env con la contraseña real

# Ejecutar tests de integración
python conexion_python\test_conexion.py
```

### FASE 6 — Activar backups automáticos

```powershell
# Como Administrador
.\setup_backup.ps1
```
→ Registra tarea en Task Scheduler (backup cada 60 minutos).

---

## Verificación Rápida en Cualquier Momento

```powershell
.\verificar_mongodb.ps1
```

---

## Colecciones y Validaciones

| Colección | Docs ejemplo | Índices | Campos obligatorios |
|---|---|---|---|
| `clientes` | 4 | 3 + `_id` | `nombre`, `apellido`, `correo` |
| `productos` | 5 | 3 + `_id` | `nombre`, `precio (>0)`, `categoria (enum)` |
| `pedidos` | 4 | 3 + `_id` | `fecha`, `estado (enum)`, `id_cliente`, `detalle (minItems:1)` |
| `usuarios` | 4 | 1 + `_id` | `usuario`, `password_hash (bcrypt ≥60)`, `rol (enum)` |

## Usuarios MongoDB

| Usuario | Rol MongoDB | BD de acceso | Uso |
|---|---|---|---|
| `superadmin` | `root` | `admin` | DBA — uso restringido |
| `comerciotech_app` | `readWrite` | `comerciotech` | Aplicación PyMongo |
| `comerciotech_reporter` | `read` | `comerciotech` | Reportes/BI |
| `comerciotech_dba` | `dbAdmin + userAdmin + readWrite` | `comerciotech` | Administración de BD |

> ⚠️ **Cambiar todas las contraseñas antes de producción.**  
> Usar variables de entorno (`.env`) — nunca contraseñas en el código fuente.
