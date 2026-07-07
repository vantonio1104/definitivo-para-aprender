# INFORME TÉCNICO COMPLETO
## Evaluación 4 - ComercioTech (MongoDB Atlas)

### 1. PORTADA
* **Asignatura:** Bases de Datos No Estructuradas
* **Docente:** [Diego Patricio Egaña Moya]
* **Estudiantes:** [Vicente Letelier, Jorge  Ortega y Ignacio Cabello]
* **Fecha:** [08/07/2026]
* **Proyecto:** ComercioTech en MongoDB Atlas

---

## 🚀 GUÍA RÁPIDA DE INICIO (Backend Python y Atlas)

Si deseas ejecutar y validar el sistema **ComercioTech** directamente contra la base de datos en la nube (MongoDB Atlas), sigue estos breves pasos en tu consola:

### 1. Configurar Credenciales
El archivo `.env` ya viene incluido y preconfigurado con la URI del clúster en la carpeta `ComercioTech/`:
```env
MONGO_URI=mongodb+srv://administrador:Holitas123@cluster0.ugfzrsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=comerciotech
```

### 2. Instalar Librerías
Abre una terminal en la carpeta `ComercioTech/` y ejecuta:
```powershell
pip install -r requirements.txt
```

### 3. Cargar Usuario Semilla
Carga el administrador de prueba (`admin_ct` / `Holitas123`) ejecutando:
```powershell
python semilla_usuarios.py
```

### 4. Lanzar el Sistema
Inicia la consola interactiva de ComercioTech:
```powershell
python main.py
```

---

### ÍNDICE
1. Portada, Índice
2. Introducción, Objetivos
3. Análisis del negocio
4. Requisitos técnicos y entorno Atlas
5. Arquitectura y modelo NoSQL
6. Base de datos: creación de clúster, script, validaciones y seguridad
7. Aplicación Python: arquitectura, login y CRUD
8. Framework de agregación
9. Buenas prácticas, aspectos éticos y normativos
10. Conclusiones
11. Bibliografía APA 7

---

### 2. INTRODUCCIÓN Y OBJETIVOS

**Introducción**
El presente informe detalla la estrategia, diseño e implementación técnica para la modernización de la arquitectura de datos de la empresa *ComercioTech*. Frente a su inminente expansión y altos volúmenes de transacciones e-commerce, se ha diseñado una transición desde bases de datos relacionales tradicionales hacia un modelo documental NoSQL utilizando **MongoDB Atlas**, operando como Database-as-a-Service (DBaaS) en la nube. 

**Objetivos Generales**
1. Diseñar e implementar una base de datos documental altamente escalable y disponible que soporte los procesos operativos de ComercioTech.
2. Desarrollar una capa de aplicación en Python (`pymongo`) estructurada de forma segura y modular para operar sobre la base de datos cloud.

**Objetivos Específicos**
* Desplegar un clúster en MongoDB Atlas aplicando configuraciones de seguridad (IP Whitelisting, RBAC, TLS).
* Definir un modelo de datos mixto (referenciado y embebido) con validación estricta vía `$jsonSchema`.
* Desarrollar operaciones CRUD completas y *pipelines* de agregación orientados al análisis de negocio.

---

### 3. ANÁLISIS DEL NEGOCIO

#### 3.1 Necesidades y Procesos Operativos
*   **Ventas (E-commerce):** El esquema flexible de MongoDB permite agilizar el proceso de carrito y *checkout*. Al guardar el detalle embebido en el pedido, se eliminan los lentos cruces de tablas (`JOIN`).
*   **Atención al Cliente:** Se requiere una vista 360 del usuario. Con búsquedas indexadas sobre el correo, los agentes pueden encontrar todo el historial transaccional de manera atómica.
*   **Inventario:** El catálogo documental acepta flexibilidad (agregar imágenes, variaciones de color/talla) sin necesidad de modificar el esquema (esquema dinámico).

#### 3.2 Volumen de Datos Actual y Proyectado
*   **Actual:** 50.000 clientes, 2.000 productos y 10.000 pedidos/mes.
*   **Proyección Conservadora a 5 años:** 200.000 clientes y 50.000 pedidos/mes. (Carga aprox ~10-15 GB).
*   **Proyección Optimista a 5 años:** Expansión internacional, 1.000.000 de clientes, y 300.000 pedidos/mes. (Carga aprox ~50-80 GB).

#### 3.3 Requisitos de Rendimiento y Disponibilidad
Los picos de carga (ej. Cyber Monday) multiplican el tráfico por 10x. Se requiere respuesta en lectura < 50ms. Se aprovecha el *Replica Set* de 3 nodos (Alta Disponibilidad, 99.995% uptime) y escalado automático de MongoDB Atlas.

#### 3.4 Seguridad y Normativas
Bajo la **Ley 19.628 (Chile)** sobre privacidad de datos, es mandatorio proteger datos como correo y teléfono. La ubicación del datacenter debe cumplir estándares internacionales (ISO 27001), por lo que se exige encriptación TLS y at Rest.

#### 3.5 Casos de Uso e Historias de Usuario
*(Se ha desarrollado la traza de 12 casos de uso para las entidades Cliente, Producto y Pedido. A continuación, historias de usuario destacadas)*:
1. **HU01:** Como cliente, quiero registrarme con mi información base para hacer compras.
2. **HU02:** Como cliente, quiero ver el catálogo completo para elegir mis artículos.
3. **HU03:** Como administrador, quiero crear/editar productos para mantener la oferta actualizada.
4. **HU04:** Como sistema, quiero guardar una copia del precio en el detalle de pedido para congelar su valor histórico y evitar inconsistencias financieras futuras.
*(Referirse a la documentación inicial completa para el resto de las HUs).*

---

### 4. REQUISITOS TÉCNICOS Y ENTORNO ATLAS

#### 4.1 Requisitos del Clúster
*   **Desarrollo/Pruebas:** Tier **M0 Sandbox** (Gratuito), que ofrece 512 MB de almacenamiento y recursos de CPU/RAM compartidos. Perfecto para el prototipado del CRUD en Python.
*   **Producción a futuro:** Tier **M10 Dedicated** inicialmente, escalando según la demanda de IOPs para absorber el volumen optimista de pedidos.

#### 4.2 Selección de Proveedor Cloud
*   Se evalúa AWS, GCP y Azure.
*   **Decisión:** **AWS (sa-east-1, São Paulo)** por soporte transversal en todos los tiers de Atlas, incluyendo el capa gratuita M0, garantizando una latencia óptima (~50ms a Chile) e interoperabilidad.

---

### 5. ARQUITECTURA Y MODELO NoSQL

#### 5.1 Diseño: Referenciar vs Embeber
*   **Entidades Independientes (Referenciadas):** `Clientes` y `Productos`. Tienen ciclos de vida separados y son consultados individualmente (ej. un producto forma parte de cientos de pedidos, no debe duplicarse).
*   **Detalle de Compra (Embebido):** La colección `Pedidos` posee un arreglo `detalle[]`. Esto sigue el patrón de **Subdocumento**.
    *   **Justificación:** Un pedido y su detalle se acceden juntos el 100% de las veces. Embeber el detalle garantiza que, en una sola lectura atómica a la BD, se obtengan todos los ítems comprados, reduciendo la latencia de I/O.

#### 5.2 Estructura Documental Implementada
| Colección | Campo(s) Destacado(s) | Validaciones / Índices | Justificación |
| :--- | :--- | :--- | :--- |
| **clientes** | `correo`, `telefono` | Regex email, Índice Único | Evita cuentas duplicadas por correo. |
| **productos** | `precio` | `minimum: 0` | Mantiene coherencia contable. |
| **pedidos** | `estado`, `id_cliente` | `enum`, Referencia `ObjectId` | Mantiene el workflow logístico controlado. |
| **(embebido)** | `detalle.[].precio_unitario`| `minimum: 0` | Inmutabilidad del precio histórico. |
| **usuarios** | `usuario`, `password` | Índice Único, Bcrypt Hash | Seguridad de acceso al backend. |

---

### 6. BASE DE DATOS: CREACIÓN, SCRIPT Y SEGURIDAD

#### 6.1 Procedimiento de Creación en Atlas
El despliegue en MongoDB Atlas consiste en la configuración lógica del Tenant y la seguridad de red.
> **[Insertar aquí captura del clúster Atlas activo (Dashboard principal)]**

1.  **Network Access:** Se implementó una **IP Access List**. En desarrollo, se limitó a las IPs de los desarrolladores. En Producción se debe restringir a las IPs de la VPC del backend.
    > **[Insertar aquí captura de Network Access con la IP configurada]**
2.  **Database Access:** Se creó un usuario dedicado `app_comerciotech` con el rol limitado `readWrite` únicamente sobre la base de datos operativa, aplicando el principio de mínimo privilegio.
    > **[Insertar aquí captura del Database Access / Usuario creado]**

#### 6.2 Script de Base de Datos y Validaciones (`crear_db.js`)
Se ha documentado e incluido el script `crear_db.js` que se ejecuta en la terminal local usando `mongosh`. Este script garantiza la consistencia del esquema (`$jsonSchema`) evitando que datos basura entren al modelo NoSQL, definiendo los Data Types correctos y valores mínimos.
> **[Insertar aquí captura de la ejecución exitosa de crear_db.js en la terminal / mongosh]**

#### 6.3 Seguridad (Cifrado)
Todas las conexiones a Atlas requieren la URL `mongodb+srv://`, forzando el cifrado del canal de transmisión de datos bajo protocolo TLS 1.2+, cumpliendo las normativas de protección del usuario final.

---

### 7. APLICACIÓN PYTHON: ARQUITECTURA, LOGIN Y CRUD

#### 7.1 Justificación Tecnológica y Arquitectura
La capa backend se implementó en Python empleando el driver oficial `pymongo`. Python ofrece soporte nativo para TLS/SRV y un óptimo manejo del *Connection Pooling* necesario para aplicaciones en la nube.
La estructura modular del proyecto (`ComercioTech/`) separa claramente las responsabilidades:
*   `config/`: Inicialización segura (`conexion.py`).
*   `models/`: Abstracciones de datos orientadas a objetos (`cliente.py`, `producto.py`, `pedido.py`).
*   `crud/`: Funciones para inyectar y consultar documentos BSON.
*   `services/`: Pipelines de reporting avanzados.

#### 7.2 Manejo de la Conexión y `.env`
Para evitar credenciales estáticas (hardcode), se implementó `python-dotenv`. Esto asegura que el código pueda rotar entre equipos de trabajo sin exponer la clave del clúster de Atlas.
> **[Insertar aquí captura del archivo .env configurado en el IDE]**

#### 7.3 Seguridad de Contraseñas (Login)
Se desarrolló un módulo `login.py` que consulta la colección `usuarios`. Las validaciones se hacen cruzando la contraseña en texto plano de entrada con el hash criptográfico almacenado en la base de datos, utilizando **bcrypt** (`bcrypt.checkpw`). De esta manera, ni siquiera el DBA conoce las contraseñas reales.

#### 7.4 Desarrollo del CRUD
Se desarrollaron módulos funcionales CRUD. El flujo técnico más destacado es la inyección de `Pedidos` en `crud_pedidos.py`. El backend valida algorítmicamente (con la ayuda de `utils/validaciones.py`) que la cantidad sea correcta, lee el catálogo de productos y **embebe programáticamente el detalle**, "congelando" el `precio_unitario` actual al construir la transacción final.
> **[Insertar aquí capturas del menú Python ejecutando creaciones y listados de pedidos/clientes en la consola]**

---

### 8. FRAMEWORK DE AGREGACIÓN

El motor de MongoDB no solo es de almacenamiento operativo (OLTP), sino que procesa análisis en tiempo real (HTAP). A través de `services/consultas_agregacion.py`, se desarrollaron las siguientes pipelines estratégicas:

1.  **Total Vendido por Cliente:** 
    *Usa: `$lookup` + `$unwind` + `$group`.* 
    Cruza los pedidos con el perfil del cliente, sumando `cantidad * precio_unitario`. Resuelve la necesidad de marketing de hallar a los clientes VIP o de mayor facturación.
2.  **Producto más Vendido:**
    *Usa: `$unwind` + `$group` + `$sort` + `$lookup`.*
    Extrae del subdocumento los productos, los agrupa sumando su cantidad, ordena los resultados e inyecta su descripción desde el catálogo. Ayuda a controlar la rotación de stock.
3.  **Promedio de Gasto por Estado de Pedido (Ticket Promedio):**
    *Usa: Múltiples `$group` + `$avg`.*
    KPI vital para la gerencia general que mide cuánto dinero ingresa al comercio en promedio por cada transacción efectuada.
> **[Insertar aquí captura de pantalla de la salida en consola del reporte de agregaciones ejecutándose]**

---

### 9. BUENAS PRÁCTICAS, ASPECTOS ÉTICOS Y NORMATIVOS

*   **Ética y Normativa de Datos:** Se asegura, mediante TLS y Encryption at Rest de Atlas, que los datos sensibles de ciudadanos no puedan ser interceptados en tránsito, respetando la **Ley 19.628**.
*   **Código Limpio (PEP-8):** Toda la solución Python está validada, estructurada en directorios, posee _type hints_ (tipado estático) y amplios *docstrings* explicativos que garantizan su mantenibilidad a largo plazo.
*   **Robusteza Operacional:** Uso de *Timeouts* en la URI de Atlas y control de excepciones genéricas (`PyMongoError`) para no revelar el _stacktrace_ ni colapsar la aplicación ante cortes de red momentáneos.
*   **Mínimo Privilegio:** Nunca se usan cuentas *root* de Atlas a nivel de aplicación (`app_comerciotech`).

---

### 10. CONCLUSIONES
La migración de la plataforma ComercioTech hacia MongoDB Atlas dota al sistema de la agilidad y escalabilidad horizontal inherentes a las arquitecturas nativas de la nube. 
La decisión arquitectónica de separar el catálogo y los clientes, implementando los detalles de las compras de forma "embebida", optimiza drásticamente la carga de lecturas (I/O) en la red. 
Paralelamente, la capa de desarrollo en Python evidencia un control riguroso de validaciones, protección criptográfica (bcrypt) e integración analítica mediante el *Aggregation Framework*, consolidando un producto técnico completo, seguro y alineado con los requerimientos de la evaluación.

---

### 11. BIBLIOGRAFÍA
*   Chodorow, K. (2013). *MongoDB: The Definitive Guide*. O'Reilly Media.
*   MongoDB, Inc. (2024). *MongoDB Atlas Security Controls*. Recuperado de https://www.mongodb.com/docs/atlas/security/
*   MongoDB, Inc. (2024). *Aggregation Pipeline Quick Reference*. Recuperado de https://www.mongodb.com/docs/manual/meta/aggregation-quick-reference/
*   Van Rossum, G., Drake, F. L., & Python Software Foundation. (2024). *Python Tutorial*. Recuperado de https://docs.python.org/3/
