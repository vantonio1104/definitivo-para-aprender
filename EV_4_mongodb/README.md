# EV_4_mongodb — ComercioTech · Evaluación 4
## Sistema de Gestión de BD NoSQL con MongoDB (en la nube)

**Base de datos:** MongoDB Atlas (Nube)
**Driver Python:** PyMongo 4.x

---

## Estructura Completa del Proyecto

```
EV_4_mongodb/
│
├── README.md                        ← Este archivo — guía de uso
├── INFORME_FINAL_MONGODB.md         ← Informe final del proyecto
├── crear_db.js                      ← Script de base de datos para mongosh
│
└── ComercioTech/                    ← Aplicación Python
    ├── config/
    │   └── conexion.py              ← Conexión singleton a MongoDB Atlas
    ├── models/
    │   ├── cliente.py               ← Modelos de datos en formato diccionario
    │   ├── producto.py
    │   └── pedido.py
    ├── crud/
    │   ├── crud_clientes.py         ← Operaciones de base de datos
    │   ├── crud_productos.py
    │   └── crud_pedidos.py
    ├── utils/
    │   └── validaciones.py          ← Reglas de negocio y formatos
    ├── login.py                     ← Autenticación segura (bcrypt)
    ├── main.py                      ← Entrada principal de la aplicación
    ├── menu.py                      ← Menús interactivos de consola
    ├── .env                         ← Variables de entorno (con MONGO_URI en la nube)
    └── requirements.txt             ← Dependencias (pymongo, python-dotenv, bcrypt, dnspython)
```

---

## Instrucciones de Inicio Rápido

### 1. Configurar Variables de Entorno
El archivo `.env` ya viene incluido y preconfigurado con la URI del clúster en la carpeta `ComercioTech/`:
```env
MONGO_URI=mongodb+srv://administrador:Holitas123@cluster0.ugfzrsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=comerciotech
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2
MONGO_CONNECT_TIMEOUT_MS=3000
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
```

### 2. Instalar Dependencias
Desde la carpeta `ComercioTech/` ejecuta:
```powershell
pip install -r requirements.txt
```

### 3. Poblar la Base de Datos en la Nube
Para inicializar colecciones, índices y datos iniciales en MongoDB Atlas, ejecuta el script JS usando `mongosh`:
```powershell
mongosh "mongodb+srv://<tu_cluster_url>/" --username <usuario> --password <password> crear_db.js
```


### 4. Ejecutar la Aplicación
Inicia la consola de administración ejecutando:
```powershell
python main.py
```

---

## Cuentas de Acceso (Pruebas)

| Usuario | Contraseña | Rol en el sistema |
| :--- | :--- | :--- |
| `admin_ct` | `Admin2024!` | **Administrador** (Acceso total) |
| `vendedor1` | `Vendedor#1` | **Vendedor** (Clientes y pedidos) |
| `bodega_ct` | `Bodega@2024` | **Bodega** (Inventario y productos) |
| `reporter_ct` | `Reports01!` | **Reportes** (Métricas y listados) |

---

## Respaldo de la Base de Datos

El script `respaldo_backup.py` (en la raíz del proyecto) permite generar un respaldo completo de las colecciones `clientes`, `productos`, `pedidos` y `usuarios` usando `mongodump`.

**Prerrequisito:** Tener [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) instalado y `mongodump` disponible en el PATH del sistema.

**Ejecución:**
```powershell
python respaldo_backup.py
```

El script:
1. Lee la `MONGO_URI` desde `ComercioTech/.env`
2. Exporta cada colección a una carpeta con marca de tiempo: `backups/backup_YYYYMMDD_HHMMSS/`
3. Imprime un resumen del resultado y el comando equivalente de `mongorestore` para restaurar el respaldo
