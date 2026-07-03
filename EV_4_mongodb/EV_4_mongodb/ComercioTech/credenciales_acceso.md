# 🔐 Credenciales de Acceso - ComercioTech

Este archivo contiene los usuarios de prueba que fueron creados en la base de datos para iniciar sesión en el sistema (`python main.py`).

| Usuario | Contraseña | Rol en el sistema | Permisos / Descripción |
| :--- | :--- | :--- | :--- |
| `admin_ct` | `Admin2024!` | **Administrador** | Acceso total al sistema. |
| `vendedor1` | `Vendedor#1` | **Vendedor** | Gestión de clientes y pedidos. |
| `bodega_ct` | `Bodega@2024` | **Bodega** | Gestión de inventario y productos. |
| `reporter_ct` | `Reports01!` | **Reportes** | Solo lectura de métricas y listados. |

> **Nota:** Las contraseñas en la base de datos de MongoDB están encriptadas usando `bcrypt`. Nunca se almacena este texto plano. Estas credenciales son solo para propósitos de prueba en el entorno de desarrollo local.
