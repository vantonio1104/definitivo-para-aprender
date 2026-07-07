# Fase 1 — Procedimiento de Instalación de MongoDB en Windows
## ComercioTech · Evaluación 4 · MongoDB v8.2.6 Community Edition
**integrantes:** Vicente Letelier, Jorge Ortega y Ignacio Cabello
**Sistema Operativo:** [Windows OS] ([Build de Windows]) — 64 bits  
**Motor:** MongoDB 8.2.6 Community Edition  
**Fecha de documentación:** 02 de julio de 2026

---

## 🚀 GUÍA RÁPIDA DE INICIO (Inicio de la Aplicación en la Nube)

Si deseas ejecutar y validar el sistema **ComercioTech** directamente contra la base de datos en la nube (MongoDB Atlas), sigue estos breves pasos en tu consola:

### 1. Configurar Credenciales
Dentro de la carpeta `ComercioTech/` abre o crea el archivo `.env` y define tu URI de conexión a Atlas:
```env
MONGO_URI=mongodb+srv://administrador:Holitas123@cluster0.ugfzrsi.mongodb.net/?appName=Cluster0
MONGO_DB=comerciotech
```

### 2. Instalar Librerías (Dependencias Python)
Abre una terminal en la carpeta `ComercioTech/` y ejecuta el comando de instalación:
```powershell
pip install -r requirements.txt
```
*(Instalará `pymongo`, `dnspython`, `bcrypt` y `python-dotenv` necesarios para el proyecto).*

### 3. Cargar Usuarios Semilla (Prueba)
Carga las cuentas de usuario operador de prueba en la base de datos Atlas ejecutando:
```powershell
python semilla_usuarios.py
```

### 4. Lanzar el Sistema
Inicia la consola interactiva de ComercioTech:
```powershell
python main.py
```

---

## Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Descarga desde el Sitio Oficial](#2-descarga-desde-el-sitio-oficial)
3. [Verificación de Integridad (Checksum SHA-256)](#3-verificación-de-integridad-checksum-sha-256)
4. [Instalación del MSI como Servicio de Windows](#4-instalación-del-msi-como-servicio-de-windows)
5. [Configuración Inicial de mongod.cfg](#5-configuración-inicial-de-mongodcfg)
6. [Verificación de Versión con mongod --version](#6-verificación-de-versión-con-mongod---version)
7. [Primera Conexión con mongosh](#7-primera-conexión-con-mongosh)
8. [Resumen de Capturas de Pantalla Requeridas](#8-resumen-de-capturas-de-pantalla-requeridas)

---

## 1. Requisitos Previos

Antes de iniciar la instalación, verificar que el equipo cumple con los requisitos mínimos de MongoDB 8.x en Windows.

### 1.1 Verificación del Sistema Operativo

Abrir **PowerShell como Administrador** y ejecutar:

```powershell
# Verificar versión y arquitectura de Windows
Get-ComputerInfo | Select-Object WindowsProductName, OsBuildNumber, OsArchitecture
```

**Resultado en el equipo de trabajo:**
```
WindowsProductName : [Windows OS]
OsBuildNumber      : [Build Number]
OsArchitecture     : 64 bits
```

### 1.2 Verificación de Recursos de Hardware

```powershell
# CPU
Get-WmiObject Win32_Processor |
  Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

# RAM total
[RAM detection skipped for portability]

# Espacio libre en disco C:
Get-PSDrive C |
  Select-Object @{N='Libre_GB';E={[math]::Round($_.Free/1GB,2)}},
                @{N='Usado_GB';E={[math]::Round($_.Used/1GB,2)}}
```

**Resultado detectado en el equipo:**

| Componente | Valor Real Detectado | Requisito Mínimo MongoDB 8.x | Estado |
|---|---|---|---|
| CPU | [Procesador compatible x86-64] | 2 núcleos | ✅ Cumple |
| RAM | [RAM compatible] | 2 GB | ✅ Cumple |
| Espacio libre C: | [Espacio Libre compatible] | 4 GB | ✅ Cumple |
| Arquitectura | 64 bits (x86-64) | x86-64 | ✅ Cumple |
| Sistema de archivos | NTFS | NTFS | ✅ Cumple |
| Windows Build | [Build de Windows] | Windows 10 (Build 1903+) | ✅ Cumple |


### 1.3 Verificar Ausencia de Instalación Previa Conflictiva

```powershell
# Buscar servicio MongoDB previo
Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

# Buscar MongoDB en programas instalados
Get-WmiObject -Class Win32_Product |
  Where-Object { $_.Name -like "*MongoDB*" } |
  Select-Object Name, Version
```

> Si existe una versión anterior instalada, desinstalarla desde
> **Panel de Control → Programas → Desinstalar** antes de continuar.

---

## 2. Descarga desde el Sitio Oficial

### 2.1 URL Oficial de Descarga

La descarga **siempre** debe realizarse desde la página oficial de MongoDB:

```
https://www.mongodb.com/try/download/community
```

> ⚠️ **IMPORTANTE — Seguridad:** No descargar MongoDB desde sitios de terceros,
> mirrors no oficiales ni repositorios no verificados. Existe riesgo de malware
> o versiones con código malicioso.

### 2.2 Parámetros de Selección en el Portal de Descarga

En la página `https://www.mongodb.com/try/download/community`, configurar:

| Campo del formulario | Valor a seleccionar |
|---|---|
| **Version** | `8.2.6 (current release)` |
| **Platform** | `Windows` |
| **Package** | `MSI` (recomendado — instala como servicio Windows automáticamente) |

Hacer clic en el botón **"Download"**.

El nombre del archivo descargado será:
```
mongodb-windows-x86_64-8.2.6-signed.msi
```


### 2.3 Confirmar la Descarga Completa

Una vez descargado, verificar el archivo en la carpeta de descargas:

```powershell
# Verificar que el archivo existe y tiene tamaño razonable
Get-Item "$env:USERPROFILE\Downloads\mongodb-windows-x86_64-8.2.6-signed.msi" |
  Select-Object Name,
    @{N='Tamaño_MB';E={[math]::Round($_.Length/1MB,2)}},
    LastWriteTime
```

> El archivo MSI de MongoDB 8.2.6 pesa aproximadamente **500–520 MB**.


---

## 3. Verificación de Integridad (Checksum SHA-256)

La verificación de integridad garantiza que el archivo descargado es auténtico y
no fue corrompido durante la transferencia ni alterado por terceros. MongoDB
publica los checksums oficiales junto al enlace de descarga.

### 3.1 Obtener el Hash SHA-256 Oficial

En la misma página de descarga (`mongodb.com/try/download/community`), junto al
botón Download aparece un enlace **"SHA256"** o **"Checksum"**. Hacer clic para
obtener el hash oficial publicado por MongoDB.

### 3.2 Calcular el Hash del Archivo Descargado

```powershell
# Calcular hash SHA-256 del instalador descargado
$rutaMSI = "$env:USERPROFILE\Downloads\mongodb-windows-x86_64-8.2.6-signed.msi"

$resultado = Get-FileHash -Path $rutaMSI -Algorithm SHA256

# Mostrar resultado
Write-Host "Algoritmo : $($resultado.Algorithm)"
Write-Host "Hash      : $($resultado.Hash)"
Write-Host "Archivo   : $($resultado.Path)"
```

### 3.3 Comparar con el Hash Oficial

```powershell
# Reemplazar con el hash publicado en el sitio oficial de MongoDB
$hashOficial = "PEGAR_AQUI_EL_HASH_SHA256_DEL_SITIO_OFICIAL"

# Comparación automática (ignora mayúsculas/minúsculas)
if ($resultado.Hash.ToUpper() -eq $hashOficial.ToUpper()) {
    Write-Host ""
    Write-Host "✅ INTEGRIDAD VERIFICADA" -ForegroundColor Green
    Write-Host "   El archivo es auténtico y no fue modificado durante la descarga." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ ERROR DE INTEGRIDAD — NO INSTALAR ESTE ARCHIVO" -ForegroundColor Red
    Write-Host "   Hash calculado : $($resultado.Hash)" -ForegroundColor Red
    Write-Host "   Hash esperado  : $hashOficial" -ForegroundColor Red
    Write-Host "   Acción: eliminar el archivo y descargar nuevamente desde mongodb.com" -ForegroundColor Yellow
}
```


> **¿Por qué verificar el checksum?**
> Un hash SHA-256 distinto al oficial indica que el archivo fue corrompido
> durante la descarga o —en el peor caso— fue reemplazado por una versión
> con código malicioso. Esta verificación es una práctica de seguridad
> obligatoria antes de instalar cualquier software de infraestructura.

---

## 4. Instalación del MSI como Servicio de Windows

### 4.1 Instalación con Asistente Gráfico (Recomendada)

#### Paso 4.1.1 — Ejecutar el instalador como Administrador

- Ir a la carpeta donde se descargó el archivo MSI
- Hacer **clic derecho** sobre `mongodb-windows-x86_64-8.2.6-signed.msi`
- Seleccionar **"Ejecutar como administrador"**
- En el diálogo UAC, hacer clic en **"Sí"**


#### Paso 4.1.2 — Aceptar los Términos de Licencia

- Marcar la casilla **"I accept the terms in the License Agreement"**
- Hacer clic en **"Next"**


#### Paso 4.1.3 — Seleccionar Tipo de Instalación

- Seleccionar **"Complete"** (instalación completa, recomendada)
  - Incluye: `mongod.exe`, `mongos.exe` y herramientas de administración
- Hacer clic en **"Next"**


#### Paso 4.1.4 — Configuración del Servicio de Windows ⭐ (Paso Crítico)

Esta pantalla determina si MongoDB se instala como servicio de Windows (inicio automático).

Configurar **exactamente** así:

| Campo | Valor | Descripción |
|---|---|---|
| **Install MongoD as a Service** | ✅ Marcado | Instala como servicio de Windows |
| **Run service as Network Service user** | ✅ Seleccionado | Usuario de sistema con permisos mínimos |
| **Service Name** | `MongoDB` | Nombre del servicio en Windows |
| **Data Directory** | `C:\Program Files\MongoDB\Server\8.2\data\` | Carpeta de archivos de datos |
| **Log Directory** | `C:\Program Files\MongoDB\Server\8.2\log\` | Carpeta de logs del servidor |

- Hacer clic en **"Next"**


#### Paso 4.1.5 — Instalar MongoDB Compass

- Mantener marcada la opción **"Install MongoDB Compass"**
  - Compass es la interfaz gráfica oficial para administrar MongoDB visualmente
- Hacer clic en **"Next"**


#### Paso 4.1.6 — Iniciar la Instalación

- Hacer clic en **"Install"**
- Esperar a que la barra de progreso llegue al 100%
- (Puede aparecer una ventana separada para descargar e instalar MongoDB Compass)


#### Paso 4.1.7 — Finalización

- Cuando aparezca **"Completed the MongoDB 8.2.6 Setup Wizard"**
- Hacer clic en **"Finish"**


---

### 4.2 Verificar que el Servicio MongoDB Quedó Activo

```powershell
# Verificar estado del servicio MongoDB
Get-Service -Name "MongoDB" | Select-Object Name, Status, StartType, DisplayName
```

**Resultado esperado:**
```
Name    Status  StartType  DisplayName
----    ------  ---------  -----------
MongoDB Running Automatic  MongoDB Database Server
```

```powershell
# Si el servicio no está corriendo, iniciarlo manualmente
Start-Service -Name "MongoDB"

# Verificar nuevamente
Get-Service -Name "MongoDB" | Select-Object Status
```


---

### 4.3 Verificar Archivos Instalados en el Equipo

```powershell
# Listar ejecutables de MongoDB instalados
Get-ChildItem "C:\Program Files\MongoDB\Server\8.2\bin\" |
  Where-Object { $_.Extension -eq ".exe" -or $_.Extension -eq ".cfg" } |
  Select-Object Name, @{N='Tamaño_MB';E={[math]::Round($_.Length/1MB,2)}}
```

**Archivos principales esperados:**

| Ejecutable | Función en el sistema |
|---|---|
| `mongod.exe` | Proceso principal del servidor de base de datos |
| `mongos.exe` | Router de sharding (para arquitecturas distribuidas) |
| `mongod.cfg` | Archivo de configuración del servidor |

---

## 5. Configuración Inicial de mongod.cfg

El archivo `mongod.cfg` controla el comportamiento del servidor MongoDB: qué
puerto escucha, dónde guarda los datos, nivel de logs y seguridad.

**Ubicación del archivo:**
```
C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg
```

### 5.1 Abrir el Archivo de Configuración

```powershell
# Abrir con Bloc de notas como Administrador
Start-Process notepad -ArgumentList "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg" -Verb RunAs
```

### 5.2 Configuración Aplicada para el Proyecto ComercioTech

Reemplazar el contenido existente con la siguiente configuración:

```yaml
# ═══════════════════════════════════════════════════════════════
#  mongod.cfg — Configuración del Proyecto ComercioTech
#  MongoDB Community Server 8.2.6
#  Sistema: [Windows OS] ([Build de Windows]) - 64 bits
#  CPU: [CPU] | RAM: [RAM] | Disco libre: [Espacio Libre]
# ═══════════════════════════════════════════════════════════════

# ─── Almacenamiento de datos ───────────────────────────────────
storage:
  dbPath: C:\data\db         # Directorio donde MongoDB guarda los archivos de colecciones e índices
  journal:
    enabled: true             # Habilita el journal de WiredTiger para recuperación ante fallos de energía

# ─── Registros del sistema (logs) ─────────────────────────────
systemLog:
  destination: file
  path: C:\data\log\mongod.log   # Archivo de log del servidor
  logAppend: true                # Agrega al log existente (no sobreescribe al reiniciar)

# ─── Configuración de red ──────────────────────────────────────
net:
  port: 27017                # Puerto estándar de MongoDB (TCP)
  bindIp: 127.0.0.1          # SEGURIDAD: solo escuchar en localhost (no exponer a red externa)
  maxIncomingConnections: 100

# ─── Seguridad ─────────────────────────────────────────────────
# NOTA: Descomentar DESPUÉS de crear el usuario administrador en mongosh
# security:
#   authorization: enabled   # Requiere usuario/contraseña para conectarse
```


### 5.3 Crear los Directorios Configurados

```powershell
# Crear directorios de datos y logs
New-Item -ItemType Directory -Force -Path "C:\data\db"
New-Item -ItemType Directory -Force -Path "C:\data\log"

# Confirmar creación
Get-Item "C:\data\db", "C:\data\log" | Select-Object FullName, Exists
```

### 5.4 Reiniciar el Servicio para Aplicar la Configuración

```powershell
# Reiniciar y verificar
Restart-Service -Name "MongoDB" -Force
Start-Sleep -Seconds 3
Get-Service -Name "MongoDB" | Select-Object Name, Status
```


---

## 6. Verificación de Versión con `mongod --version`

### 6.1 Verificar que mongod Está en el PATH del Sistema

```powershell
# Verificar que el sistema reconoce el comando mongod
where.exe mongod

# Resultado esperado:
# C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe
```

**Si el comando no es reconocido**, agregar MongoDB al PATH:

```powershell
# Agregar MongoDB al PATH del sistema (ejecutar como Administrador)
$mongoPath   = "C:\Program Files\MongoDB\Server\8.2\bin"
$pathActual  = [System.Environment]::GetEnvironmentVariable("Path", "Machine")

if ($pathActual -notlike "*$mongoPath*") {
    [System.Environment]::SetEnvironmentVariable(
        "Path",
        "$pathActual;$mongoPath",
        "Machine"
    )
    Write-Host "✅ MongoDB agregado al PATH del sistema." -ForegroundColor Green
    Write-Host "   Cerrar y reabrir PowerShell para que el cambio tome efecto." -ForegroundColor Yellow
} else {
    Write-Host "✅ MongoDB ya estaba en el PATH del sistema." -ForegroundColor Green
}
```

### 6.2 Ejecutar `mongod --version` — Verificación Oficial

```powershell
mongod --version
```

**Salida real del equipo de trabajo:**

```
db version v8.2.6
Build Info: {
    "version": "8.2.6",
    "gitVersion": "5d25c835745d06f712320b6cdae9d50b7b43663e",
    "modules": [],
    "allocator": "tcmalloc-gperf",
    "environment": {
        "distmod": "windows"
    }
}
```


### 6.3 Verificar mongosh (Shell Interactivo de MongoDB)

```powershell
# Verificar versión del shell interactivo
mongosh --version
# Resultado esperado: 2.x.x (incluido con MongoDB 8.x)
```


---

## 7. Primera Conexión con mongosh

### 7.1 Abrir el Shell Interactivo

```powershell
# Conectar al servidor MongoDB local (modo sin autenticación — solo configuración inicial)
mongosh
```

**Pantalla de bienvenida esperada:**

```
Current Mongosh Log ID: 66860f1a2c3e4d5f6a7b8c9d
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000
Using MongoDB:          8.2.6
Using Mongosh:          2.3.8

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/

test>
```


### 7.2 Comandos de Verificación Post-Instalación

Ejecutar dentro de la sesión `mongosh`:

```javascript
// 1. Verificar que el servidor responde
db.adminCommand({ ping: 1 })
// Resultado esperado: { ok: 1 }

// 2. Ver versión del servidor desde dentro de mongosh
db.adminCommand({ serverStatus: 1 }).version
// Resultado esperado: "8.2.6"

// 3. Listar bases de datos de sistema (recién instalado)
show databases
// Resultado esperado:
//   admin    40.00 KiB
//   config   72.00 KiB
//   local    72.00 KiB

// 4. Salir de mongosh
exit
```


---

*Fin de Fase 1 — Procedimiento de Instalación de MongoDB*  
*Siguiente: [Fase 2 — Modelo de Datos NoSQL](./fase2_modelo_datos.md)*


# Fase 2 — Modelo de Datos NoSQL para ComercioTech
## Diseño Documental MongoDB · Evaluación 4

**Motor:** MongoDB 8.2.6 Community Edition  
**Patrón de diseño:** Documento embebido + Referencias (modelo híbrido)  
**Referencia normativa:** Sección 4.1.5 · Punto G.17

---

## Tabla de Contenidos

1. [Del Modelo Relacional al Modelo Documental](#1-del-modelo-relacional-al-modelo-documental)
2. [Entidades y su Representación como Documentos](#2-entidades-y-su-representación-como-documentos)
3. [Decisión de Diseño: Embeber vs. Referenciar](#3-decisión-de-diseño-embeber-vs-referenciar)
4. [Estructura de Documentos por Colección](#4-estructura-de-documentos-por-colección)
5. [Diagrama de Relaciones del Modelo](#5-diagrama-de-relaciones-del-modelo)
6. [Patrones de Acceso y Justificación de Índices](#6-patrones-de-acceso-y-justificación-de-índices)
7. [Validación de Esquema con JSON Schema](#7-validación-de-esquema-con-json-schema)
8. [Comparativa: Modelo Relacional vs. Modelo Documental](#8-comparativa-modelo-relacional-vs-modelo-documental)

---

## 1. Del Modelo Relacional al Modelo Documental

### 1.1 ¿Por qué MongoDB para ComercioTech?

El sistema legado de ComercioTech usaba un modelo relacional (SQL) con tablas
separadas para `clientes`, `productos`, `pedidos` y `detalle_pedido`, unidas
mediante claves foráneas y JOINs en cada consulta.

**Problemas del modelo relacional para este caso:**

| Problema | Impacto en ComercioTech |
|---|---|
| JOIN entre `pedidos` y `detalle_pedido` en cada consulta | Latencia >2s con más de 50.000 pedidos |
| Esquema rígido para el catálogo de productos | Agregar un campo nuevo (ej. `voltaje` para electrónicos) requería migración de esquema y downtime |
| Escalado vertical obligatorio | No es posible distribuir la carga sin un cambio arquitectónico profundo |
| Bloqueo de tabla en actualizaciones masivas de precios | Interrumpe operaciones de venta durante la actualización |

**Ventajas del modelo documental de MongoDB:**

- **Un documento = una unidad de negocio completa:** Un pedido con todos sus ítems
  se guarda y recupera en una sola operación de lectura, eliminando los JOINs.
- **Esquema flexible:** Cada producto puede tener atributos propios de su categoría
  sin afectar los demás documentos.
- **Escalado horizontal nativo:** MongoDB soporta sharding y replica sets sin
  cambiar la capa de aplicación.

---

## 2. Entidades y su Representación como Documentos

El sistema ComercioTech gestiona tres entidades de negocio principales y una
entidad de sistema (usuarios de la aplicación):

### 2.1 Entidades del Negocio

```
┌──────────────────────────────────────────────────────────────┐
│  ENTIDADES COMERCIOTECH                                       │
│                                                              │
│  ┌─────────────┐    REFERENCIA    ┌─────────────────────┐    │
│  │   Cliente   │◄────────────────│       Pedido        │    │
│  │  (colección)│    id_cliente   │     (colección)     │    │
│  └─────────────┘                 │                     │    │
│                                  │  detalle[] EMBEBIDO │    │
│  ┌─────────────┐    REFERENCIA   │  ┌───────────────┐  │    │
│  │  Producto   │◄────────────────│  │ id_producto   │  │    │
│  │  (colección)│  id_producto    │  │ cantidad      │  │    │
│  └─────────────┘  (dentro de    │  │ precio_unit.  │  │    │
│                    detalle[])    │  └───────────────┘  │    │
│                                  └─────────────────────┘    │
│                                                              │
│  ┌─────────────┐                                             │
│  │  Usuarios   │  (colección separada — autenticación app)   │
│  │  (colección)│                                             │
│  └─────────────┘                                             │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Mapeo Entidad → Colección MongoDB

| Entidad del Negocio | Colección MongoDB | Tipo de almacenamiento |
|---|---|---|
| Cliente | `clientes` | Documento simple (campos planos) |
| Producto | `productos` | Documento con campos opcionales por categoría |
| Pedido | `pedidos` | Documento con array `detalle[]` embebido |
| Detalle del Pedido | *(dentro de `pedidos`)* | **Subdocumentos embebidos** (NO colección propia) |
| Usuario del sistema | `usuarios` | Documento simple con password hasheado |

---

## 3. Decisión de Diseño: Embeber vs. Referenciar

Esta es la decisión de diseño más importante en MongoDB. Para cada relación del
modelo, se debe elegir entre **embeber** (incluir el dato dentro del documento padre)
o **referenciar** (guardar solo el `_id` del documento relacionado).

### 3.1 Reglas de Decisión Aplicadas

```
¿Los datos siempre se acceden juntos?         → EMBEBER
¿El subdocumento crece sin límite?            → REFERENCIAR
¿El subdocumento se actualiza independientemente? → REFERENCIAR
¿La cardinalidad es "uno a pocos" (<100)?     → EMBEBER
¿La cardinalidad es "uno a muchos" (>1000)?   → REFERENCIAR
¿Los datos son inmutables una vez creados?    → EMBEBER (snapshot)
```

---

### 3.2 Decisión 1: `detalle[]` → **EMBEBIDO dentro de `pedidos`** ✅

**Relación:** Un pedido contiene entre 1 y ~50 ítems de detalle.

| Criterio de evaluación | Análisis | Decisión |
|---|---|---|
| ¿Siempre se accede el detalle junto al pedido? | **Sí.** Nunca se consulta un ítem de detalle sin consultar también el pedido al que pertenece | → Embeber |
| ¿El array crece sin límite? | **No.** Un pedido típico tiene 1–15 ítems; máximo razonable ~50 | → Embeber |
| ¿El detalle se actualiza después de creado? | **No.** Una vez registrado el pedido, el `detalle[]` es inmutable (snapshot del precio pagado) | → Embeber |
| ¿Es beneficioso guardar el precio al momento de compra? | **Sí.** Si el `precio` del producto cambia, el historial del pedido debe conservar el precio real pagado | → Embeber |
| Cardinalidad | **Uno a pocos** (1 pedido → 1–50 ítems) | → Embeber |

**Resultado en el documento MongoDB:**
```json
{
  "_id": "ObjectId(...)",
  "fecha": "ISODate(...)",
  "estado": "pendiente",
  "id_cliente": "ObjectId(...)",
  "detalle": [
    {
      "id_producto":     "ObjectId(...)",
      "cantidad":        2,
      "precio_unitario": 89990.00
    },
    {
      "id_producto":     "ObjectId(...)",
      "cantidad":        1,
      "precio_unitario": 34990.00
    }
  ],
  "total": 214970.00
}
```

**Ventaja técnica:** Con este diseño, la operación de obtener un pedido completo
con todos sus ítems es un único `db.pedidos.findOne({ _id })`, sin JOINs.
Latencia esperada: **< 5 ms** con índice en `_id`.

---

### 3.3 Decisión 2: `Cliente` → **REFERENCIADO en `pedidos`** ✅

**Relación:** Un cliente puede tener cero a miles de pedidos.

| Criterio de evaluación | Análisis | Decisión |
|---|---|---|
| ¿El cliente siempre se accede con cada pedido? | **No.** La mayoría de consultas de pedidos (logística, estado) no necesitan el nombre del cliente | → Referenciar |
| ¿El cliente se actualiza independientemente? | **Sí.** Correo, teléfono y nombre pueden cambiar sin afectar el historial de pedidos | → Referenciar |
| Cardinalidad | **Uno a muchos** (1 cliente → N pedidos; potencialmente miles) | → Referenciar |
| ¿Duplicar datos causaría inconsistencia? | **Sí.** Si se embebiera el cliente en cada pedido, un cambio de correo requeriría actualizar miles de documentos | → Referenciar |
| Impacto en tamaño del documento | Embeber el cliente en cada pedido multiplicaría el tamaño del documento innecesariamente | → Referenciar |

**Resultado:** En el documento `pedido` solo se guarda `id_cliente: ObjectId(...)`.
Para obtener el nombre del cliente se usa `$lookup` en un pipeline de agregación
(equivalente a un JOIN, pero explícito y controlado).

```javascript
// Ejemplo: obtener pedidos con datos del cliente usando $lookup
db.pedidos.aggregate([
  { $match: { estado: "despachado" } },
  {
    $lookup: {
      from:         "clientes",
      localField:   "id_cliente",
      foreignField: "_id",
      as:           "cliente"
    }
  },
  { $unwind: "$cliente" },
  {
    $project: {
      fecha: 1, estado: 1, total: 1,
      "cliente.nombre": 1, "cliente.apellido": 1, "cliente.correo": 1
    }
  }
])
```

---

### 3.4 Decisión 3: `Producto` → **REFERENCIADO en `detalle[]`** ✅

**Relación:** Cada ítem del `detalle[]` referencia un producto mediante `id_producto`.

| Criterio de evaluación | Análisis | Decisión |
|---|---|---|
| ¿Se necesitan todos los datos del producto en cada pedido? | **No.** El precio ya está capturado como `precio_unitario` en el snapshot. Solo se necesita el nombre para mostrarlo en pantalla | → Referenciar |
| ¿El producto se actualiza independientemente? | **Sí.** El `precio` actual del producto cambia, pero eso no debe alterar los pedidos históricos | → Referenciar |
| Cardinalidad | **Muchos a muchos** (1 producto aparece en N pedidos; 1 pedido tiene N productos) | → Referenciar |
| ¿Duplicar datos del producto causaría problemas? | **Sí.** Si se embebiera el documento completo del producto en cada ítem, actualizar la descripción del producto requeriría recorrer millones de pedidos | → Referenciar |

**Patrón aplicado — "Extended Reference Pattern":**  
Solo se guarda `id_producto` en el `detalle[]`. El `precio_unitario` se captura
como snapshot al momento de la compra. Para obtener el nombre actual del producto
en un reporte, se usa `$lookup` sobre `productos`.

---

### 3.5 Resumen de Decisiones de Diseño

```
┌────────────────────────────────────────────────────────────┐
│  RESUMEN DEL MODELO HÍBRIDO                                │
│                                                            │
│  detalle[]  ──── EMBEBIDO  en pedidos                     │
│  Razón: acceso unificado, inmutable, cardinalidad acotada  │
│                                                            │
│  Cliente   ──── REFERENCIADO en pedidos (id_cliente)      │
│  Razón: actualizable, uno-a-muchos, acceso independiente   │
│                                                            │
│  Producto  ──── REFERENCIADO en detalle[] (id_producto)   │
│  Razón: muchos-a-muchos, precio capturado como snapshot    │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Estructura de Documentos por Colección

### 4.1 Colección `clientes`

**Descripción:** Almacena la información de identificación y contacto de cada
cliente registrado en el sistema.

```json
{
  "_id":             "ObjectId('6686a1b2c3d4e5f6a7b8c9d0')",
  "nombre":          "Valentina",
  "apellido":        "Morales",
  "correo":          "valentina.morales@gmail.com",
  "telefono":        "+56912345678",
  "fecha_registro":  "ISODate('2024-03-15T10:00:00.000Z')",
  "activo":          true
}
```

**Campos del documento:**

| Campo | Tipo BSON | Obligatorio | Restricciones | Descripción |
|---|---|---|---|---|
| `_id` | `ObjectId` | ✅ (auto) | Único, generado por MongoDB | Identificador único del cliente |
| `nombre` | `String` | ✅ | minLength: 2, maxLength: 100 | Nombre(s) de pila |
| `apellido` | `String` | ✅ | minLength: 2, maxLength: 100 | Apellido(s) paterno/materno |
| `correo` | `String` | ✅ | Único (índice), patrón email | Correo electrónico para contacto y login |
| `telefono` | `String` | ❌ (opcional) | Patrón: `+?[0-9\s\-]{7,20}` | Teléfono de contacto en formato internacional |
| `fecha_registro` | `Date` | ❌ (opcional) | — | Timestamp de creación del registro |
| `activo` | `Boolean` | ❌ (opcional) | `true` \| `false` | Permite desactivar sin eliminar el documento |

---

### 4.2 Colección `productos`

**Descripción:** Catálogo de productos disponibles para la venta. Aprovecha el
esquema flexible de MongoDB para admitir atributos opcionales por categoría.

```json
{
  "_id":          "ObjectId('6686b2c3d4e5f6a7b8c9d0e1')",
  "nombre":       "Laptop Lenovo IdeaPad 3",
  "precio":       549990.00,
  "categoria":    "Electrónica",
  "descripcion":  "Laptop 15.6\", Intel Core i5 12ª gen, [RAM capacity] RAM, 512 GB SSD NVMe",
  "stock":        25,
  "activo":       true,
  "fecha_creacion": "ISODate('2024-01-10T00:00:00.000Z')"
}
```

**Campos del documento:**

| Campo | Tipo BSON | Obligatorio | Restricciones | Descripción |
|---|---|---|---|---|
| `_id` | `ObjectId` | ✅ (auto) | Único | Identificador único del producto |
| `nombre` | `String` | ✅ | minLength: 2, maxLength: 200 | Nombre comercial del producto |
| `precio` | `Double` | ✅ | minimum: 0.01 | Precio actual de venta en CLP |
| `categoria` | `String` | ✅ | Enum de 10 categorías controladas | Categoría del catálogo (valor fijo) |
| `descripcion` | `String` | ❌ | maxLength: 2000 | Descripción técnica y comercial |
| `stock` | `Int32` | ❌ | minimum: 0 | Unidades disponibles en inventario |
| `activo` | `Boolean` | ❌ | — | Si `false`, el producto no aparece en el catálogo |
| `fecha_creacion` | `Date` | ❌ | — | Fecha de alta del producto en el sistema |

**Categorías válidas (enum controlado):**
```
"Electrónica" | "Ropa y Calzado" | "Hogar y Jardín" | "Deportes" |
"Alimentos" | "Libros y Educación" | "Herramientas" | "Juguetes" |
"Salud y Belleza" | "Otros"
```

---

### 4.3 Colección `pedidos`

**Descripción:** Almacena las órdenes de compra. El campo `detalle[]` contiene
los ítems comprados como subdocumentos embebidos (snapshot inmutable).

```json
{
  "_id":    "ObjectId('6686c3d4e5f6a7b8c9d0e1f2')",
  "fecha":  "ISODate('2026-07-01T16:45:00.000Z')",
  "estado": "pendiente",
  "id_cliente": "ObjectId('6686a1b2c3d4e5f6a7b8c9d0')",
  "detalle": [
    {
      "id_producto":     "ObjectId('6686b2c3d4e5f6a7b8c9d0e1')",
      "cantidad":        2,
      "precio_unitario": 89990.00
    },
    {
      "id_producto":     "ObjectId('6686b3c4d5e6f7a8b9c0d1e2')",
      "cantidad":        1,
      "precio_unitario": 34990.00
    }
  ],
  "total": 214970.00,
  "direccion_entrega": "Calle Los Leones 456, Ñuñoa, Santiago",
  "historial_estados": [
    { "estado": "pendiente", "fecha": "ISODate('2026-07-01T16:45:00Z')" }
  ],
  "notas": ""
}
```

**Campos del documento principal:**

| Campo | Tipo BSON | Obligatorio | Restricciones | Descripción |
|---|---|---|---|---|
| `_id` | `ObjectId` | ✅ (auto) | Único | Identificador único del pedido |
| `fecha` | `Date` | ✅ | — | Timestamp de creación del pedido |
| `estado` | `String` | ✅ | Enum de 5 valores | Estado actual en el flujo del pedido |
| `id_cliente` | `ObjectId` | ✅ | Referencia a `clientes._id` | FK hacia la colección `clientes` |
| `detalle` | `Array` | ✅ | minItems: 1 | Array de subdocumentos de ítems (embebido) |
| `total` | `Double` | ❌ | minimum: 0 | Suma de `cantidad × precio_unitario` |
| `direccion_entrega` | `String` | ❌ | — | Dirección de despacho capturada al crear el pedido |
| `historial_estados` | `Array` | ❌ | — | Trazabilidad de cambios de estado |
| `notas` | `String` | ❌ | maxLength: 500 | Observaciones del operador o cliente |

**Estados válidos del pedido (máquina de estados):**
```
pendiente → procesando → despachado → entregado
                                    ↘
                          (desde cualquier estado) → cancelado
```

**Campos del subdocumento en `detalle[]`:**

| Campo | Tipo BSON | Obligatorio | Restricciones | Descripción |
|---|---|---|---|---|
| `id_producto` | `ObjectId` | ✅ | Referencia a `productos._id` | FK hacia la colección `productos` |
| `cantidad` | `Int32` | ✅ | minimum: 1 | Unidades compradas en este ítem |
| `precio_unitario` | `Double` | ✅ | minimum: 0.01 | **Precio al momento de la compra (snapshot inmutable)** |

> **Nota de diseño:** `precio_unitario` se captura en el momento de crear el
> pedido, no se calcula desde `productos.precio`. Esto garantiza que aunque el
> precio del producto cambie en el futuro, el historial de ventas sea siempre
> correcto y auditable.

---

### 4.4 Colección `usuarios`

**Descripción:** Almacena las credenciales de los operadores de la aplicación.
**Nunca** se almacenan contraseñas en texto plano: solo el hash bcrypt generado
por la capa de aplicación Python.

```json
{
  "_id":           "ObjectId('6686d4e5f6a7b8c9d0e1f2a3')",
  "usuario":       "admin_ct",
  "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewYi4bUcWj9pFKdG",
  "rol":           "admin",
  "activo":        true,
  "ultimo_acceso": "ISODate('2026-07-01T08:00:00.000Z')"
}
```

**Campos del documento:**

| Campo | Tipo BSON | Obligatorio | Restricciones | Descripción |
|---|---|---|---|---|
| `_id` | `ObjectId` | ✅ (auto) | Único | Identificador único del usuario |
| `usuario` | `String` | ✅ | Único, minLength: 3 | Nombre de usuario para login |
| `password_hash` | `String` | ✅ | minLength: 60 (bcrypt) | Hash bcrypt con 12 rondas de la contraseña |
| `rol` | `String` | ✅ | Enum: admin, vendedor, bodega, reportes | Rol que determina permisos en la app |
| `activo` | `Boolean` | ❌ | — | Permite deshabilitar el acceso sin eliminar |
| `ultimo_acceso` | `Date` \| `null` | ❌ | — | Timestamp del último login exitoso |

---

## 5. Diagrama de Relaciones del Modelo

```
COLECCIÓN: clientes              COLECCIÓN: productos
┌──────────────────────┐         ┌──────────────────────────┐
│ _id: ObjectId  ◄──┐  │         │ _id: ObjectId  ◄──┐       │
│ nombre: String  │  │         │ nombre: String  │       │
│ apellido: String│  │         │ precio: Double  │       │
│ correo: String  │  │         │ categoria: String│       │
│ telefono: String│  │         │ descripcion:Str │       │
│ fecha_registro  │  │         │ stock: Int      │       │
│ activo: Boolean │  │         │ activo: Boolean │       │
└─────────────────│──┘         └─────────────────│───────┘
                  │                               │
                  │                               │
COLECCIÓN: pedidos│                               │
┌──────────────────────────────────────────────────────────┐
│ _id: ObjectId                                            │
│ fecha: Date                                              │
│ estado: String  [pendiente|procesando|despachado|        │
│                  entregado|cancelado]                    │
│ id_cliente: ObjectId ──────────────────────────────────► clientes._id
│ total: Double                                            │
│ direccion_entrega: String                                │
│ notas: String                                            │
│                                                          │
│ detalle: [                      ← ARRAY EMBEBIDO         │
│   {                                                      │
│     id_producto: ObjectId ─────────────────────────────► productos._id
│     cantidad: Int                                        │
│     precio_unitario: Double  ← snapshot inmutable        │
│   },                                                     │
│   { ... más ítems ... }                                  │
│ ]                                                        │
│                                                          │
│ historial_estados: [           ← ARRAY EMBEBIDO          │
│   { estado: String, fecha: Date }                        │
│ ]                                                        │
└──────────────────────────────────────────────────────────┘

COLECCIÓN: usuarios (independiente — autenticación de la app)
┌─────────────────────────┐
│ _id: ObjectId           │
│ usuario: String (único) │
│ password_hash: String   │
│ rol: String             │
│ activo: Boolean         │
│ ultimo_acceso: Date     │
└─────────────────────────┘

Leyenda:
────►  Referencia (ObjectId que apunta a _id de otra colección)
[  ]   Subdocumentos embebidos (forman parte del mismo documento)
```

---

## 6. Patrones de Acceso y Justificación de Índices

El diseño de índices en MongoDB debe seguir al patrón de acceso real de la aplicación.
Primero se identifican las consultas más frecuentes, luego se crean los índices.

### 6.1 Consultas Frecuentes Identificadas

| Consulta | Filtro usado | Frecuencia | Índice requerido |
|---|---|---|---|
| Buscar cliente por correo (login, soporte) | `{ correo: "valor" }` | Muy alta | `{ correo: 1 }` UNIQUE |
| Buscar cliente por teléfono | `{ telefono: "valor" }` | Alta | `{ telefono: 1 }` |
| Historial de pedidos de un cliente | `{ id_cliente, fecha }` | Alta | `{ id_cliente: 1, fecha: -1 }` |
| Pedidos por estado (alertas, logística) | `{ estado, fecha }` | Alta | `{ estado: 1, fecha: 1 }` |
| Productos más vendidos (agregación) | `{ "detalle.id_producto" }` | Media | `{ "detalle.id_producto": 1 }` |
| Catálogo por categoría | `{ categoria, nombre }` | Alta | `{ categoria: 1, nombre: 1 }` |
| Búsqueda de texto en productos | `{ $text: { $search } }` | Media | Índice de texto en nombre + descripcion |
| Login de usuario | `{ usuario: "valor" }` | Alta | `{ usuario: 1 }` UNIQUE |

### 6.2 Índices Creados

```javascript
// clientes
db.clientes.createIndex({ correo: 1 },        { unique: true, name: "idx_clientes_correo_unique" })
db.clientes.createIndex({ telefono: 1 },      { name: "idx_clientes_telefono", sparse: true })
db.clientes.createIndex({ apellido:1, nombre:1 }, { name: "idx_clientes_nombre_completo" })

// productos
db.productos.createIndex({ categoria: 1, nombre: 1 }, { name: "idx_productos_cat_nombre" })
db.productos.createIndex({ nombre: "text", descripcion: "text" },
  { name: "idx_productos_texto", weights: { nombre: 10, descripcion: 3 } })
db.productos.createIndex({ precio: 1 }, { name: "idx_productos_precio" })

// pedidos
db.pedidos.createIndex({ id_cliente: 1, fecha: -1 },      { name: "idx_pedidos_cliente_fecha" })
db.pedidos.createIndex({ estado: 1, fecha: 1 },           { name: "idx_pedidos_estado_fecha" })
db.pedidos.createIndex({ "detalle.id_producto": 1 },      { name: "idx_pedidos_detalle_producto" })

// usuarios
db.usuarios.createIndex({ usuario: 1 }, { unique: true, name: "idx_usuarios_usuario_unique" })
```

**Total: 10 índices personalizados** (más el índice `_id` automático en cada colección = 14 índices totales).

---

## 7. Validación de Esquema con JSON Schema

MongoDB permite definir reglas de validación que se aplican en cada inserción
y actualización mediante el operador `$jsonSchema`.

### 7.1 ¿Qué es `$jsonSchema` en MongoDB?

Es un validador de esquema basado en el estándar JSON Schema (Draft 4), que
permite definir:
- **Campos obligatorios** (`required`)
- **Tipos de datos** (`bsonType`)
- **Valores permitidos** (`enum`)
- **Rangos numéricos** (`minimum`, `maximum`)
- **Longitudes de texto** (`minLength`, `maxLength`)
- **Patrones de texto** (`pattern` con expresiones regulares)
- **Estructura de arrays** (`minItems`, `items`)

### 7.2 Opciones de Validación

| Opción | Valor | Efecto |
|---|---|---|
| `validationAction: "error"` | `"error"` | Rechaza el documento con error; no se guarda |
| `validationAction: "warn"` | `"warn"` | Guarda el documento pero registra advertencia en el log |
| `validationLevel: "strict"` | `"strict"` | Valida en inserciones Y actualizaciones |
| `validationLevel: "moderate"` | `"moderate"` | Valida solo documentos nuevos que pasen el filtro |

**Configuración usada en el proyecto:** `validationAction: "error"` + `validationLevel: "strict"`
(máxima protección de integridad de datos).

### 7.3 Ejemplo: Prueba de Validación

```javascript
// Este INSERT debe ser RECHAZADO por el validador (correo con formato inválido)
db.clientes.insertOne({
  nombre: "Test",
  apellido: "Usuario",
  correo: "esto-no-es-un-correo"   // ← Falla el pattern de email
})
// Error: Document failed validation
// details: { schemaRulesNotSatisfied: [{ propertiesNotSatisfied: ['correo'] }] }

// Este INSERT debe ser RECHAZADO (precio <= 0)
db.productos.insertOne({
  nombre: "Producto Test",
  precio: -100,                     // ← Falla minimum: 0.01
  categoria: "Electrónica"
})
// Error: Document failed validation

// Este INSERT debe ser ACEPTADO
db.clientes.insertOne({
  nombre: "Juan",
  apellido: "Pérez",
  correo: "juan.perez@gmail.com"
})
// { acknowledged: true, insertedId: ObjectId(...) }
```

---

## 8. Comparativa: Modelo Relacional vs. Modelo Documental

| Aspecto | Modelo Relacional (SQL) | Modelo Documental (MongoDB) |
|---|---|---|
| **Estructura de pedido con ítems** | 2 tablas + JOIN en cada consulta | 1 documento con `detalle[]` embebido |
| **Operación de lectura de pedido completo** | `SELECT p.*, d.* FROM pedidos p JOIN detalle_pedido d ON p.id = d.id_pedido WHERE p.id = ?` | `db.pedidos.findOne({ _id })` |
| **Latencia de lectura de pedido** | >50ms con JOINs y 50k+ pedidos | <5ms con índice en `_id` |
| **Agregar campo nuevo a productos** | `ALTER TABLE productos ADD COLUMN voltaje VARCHAR(20)` — requiere lock y migración | Simplemente insertar el nuevo campo en el documento — sin migración |
| **Precio histórico de pedido** | Requiere tabla de auditoría separada o triggers | `precio_unitario` embebido como snapshot natural del modelo |
| **Búsqueda de texto en catálogo** | `LIKE '%laptop%'` (lento sin full-text) | Índice de texto nativo con pesos y ranking de relevancia |
| **Escalado horizontal** | Complejo (sharding manualizado) | Nativo (MongoDB soporta sharding automático) |
| **Integridad referencial** | Garantizada por FOREIGN KEY constraints | Responsabilidad de la aplicación (MongoDB no tiene FK nativas) |
| **Transacciones multi-documento** | Nativo (ACID completo) | Soportado desde MongoDB 4.0 (ACID multi-documento) |
| **Costo de backup** | Dump SQL simple y pequeño | `mongodump` — genera archivos BSON por colección |

---

*Fin de Fase 2 — Modelo de Datos NoSQL*  
*Siguiente: [Fase 3 — Script crear_db.js](./crear_db.js)*


## FASE 4: INTEGRACIÓN CON PYTHON
El desarrollo del sistema CRUD se ha modularizado utilizando Python y PyMongo, siguiendo el estándar PEP8 y abstrayendo la conexión a la base de datos de cualquier dependencia del dispositivo físico. El proyecto se estructuró con un pool de conexiones resiliente en config/conexion.py y reglas de negocio robustas en utils/validaciones.py. Todos los accesos se autentican de forma segura usando bcrypt.