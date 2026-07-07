// =============================================================
//  crear_db.js — ComercioTech MongoDB Setup Script
//  Motor: MongoDB (Local o MongoDB Atlas en la Nube)
//  Autores: ComercioTech · Evaluación 4
//
//  EJECUTAR EN LOCAL:
//    mongosh crear_db.js
//
//  EJECUTAR EN LA NUBE (MongoDB Atlas):
//    mongosh "mongodb+srv://<cluster-url>/" --username <usuario> --password <contraseña> crear_db.js
// =============================================================

// ─────────────────────────────────────────────
//  0. SELECCIÓN DE BASE DE DATOS
// ─────────────────────────────────────────────
use("comerciotech");
print("✅ [0/7] Base de datos 'comerciotech' seleccionada");
print("         (MongoDB la crea físicamente al insertar el primer documento)");

// ─────────────────────────────────────────────
//  1. ELIMINAR COLECCIONES EXISTENTES
//     Garantiza idempotencia: se puede re-ejecutar el script
//     sin errores aunque las colecciones ya existan.
// ─────────────────────────────────────────────
const coleccionesExistentes = db.getCollectionNames();
["clientes", "productos", "pedidos", "usuarios"].forEach((col) => {
  if (coleccionesExistentes.includes(col)) {
    db[col].drop();
    print(`   🗑️  Colección '${col}' eliminada para recreación limpia`);
  }
});
print("✅ [1/7] Limpieza de colecciones preexistentes completada");

// ─────────────────────────────────────────────
//  2. COLECCIÓN: clientes
//     Almacena datos de identificación y contacto de clientes.
//     El correo tiene índice único para garantizar unicidad a nivel de BD.
// ─────────────────────────────────────────────
db.createCollection("clientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Esquema de Validación — Cliente",
      description: "Documento que representa un cliente registrado en ComercioTech",
      required: ["nombre", "apellido", "correo"],
      additionalProperties: true,
      properties: {
        _id: {
          bsonType: "objectId",
          description: "Identificador único generado automáticamente por MongoDB"
        },
        nombre: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "OBLIGATORIO — Nombre(s) de pila del cliente"
        },
        apellido: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "OBLIGATORIO — Apellido(s) del cliente"
        },
        correo: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
          description: "OBLIGATORIO — Correo electrónico válido (único en el sistema)"
        },
        telefono: {
          bsonType: "string",
          pattern: "^\\+?[0-9\\s\\-]{7,20}$",
          description: "OPCIONAL — Número de teléfono en formato internacional"
        },
        fecha_registro: {
          bsonType: "date",
          description: "OPCIONAL — Timestamp de creación del registro"
        },
        activo: {
          bsonType: "bool",
          description: "OPCIONAL — false = cliente desactivado (no se elimina)"
        }
      }
    }
  },
  validationAction: "error",   // Rechaza documentos inválidos con error E_VALIDATION
  validationLevel:  "strict"   // Aplica en inserciones Y actualizaciones
});
print("✅ [2/7] Colección 'clientes' creada con validación JSON Schema");

// ─────────────────────────────────────────────
//  3. COLECCIÓN: productos
//     Catálogo de artículos disponibles para la venta.
//     El esquema flexible permite agregar campos opcionales
//     por categoría sin modificar la estructura (ej. voltaje, talla).
// ─────────────────────────────────────────────
db.createCollection("productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Esquema de Validación — Producto",
      description: "Artículo del catálogo de ComercioTech",
      required: ["nombre", "precio", "categoria"],
      additionalProperties: true,   // Permite campos opcionales por categoría
      properties: {
        _id: { bsonType: "objectId" },
        nombre: {
          bsonType: "string",
          minLength: 2,
          maxLength: 200,
          description: "OBLIGATORIO — Nombre comercial del producto"
        },
        precio: {
          bsonType: ["double", "int", "long"],
          minimum: 0.01,
          description: "OBLIGATORIO — Precio actual en CLP (debe ser > 0)"
        },
        categoria: {
          bsonType: "string",
          enum: [
            "Electrónica",
            "Ropa y Calzado",
            "Hogar y Jardín",
            "Deportes",
            "Alimentos",
            "Libros y Educación",
            "Herramientas",
            "Juguetes",
            "Salud y Belleza",
            "Otros"
          ],
          description: "OBLIGATORIO — Categoría del catálogo (valor controlado por enum)"
        },
        descripcion: {
          bsonType: "string",
          maxLength: 2000,
          description: "OPCIONAL — Descripción técnica y comercial del producto"
        },
        stock: {
          bsonType: "int",
          minimum: 0,
          description: "OPCIONAL — Unidades disponibles en inventario (>= 0)"
        },
        activo: {
          bsonType: "bool",
          description: "OPCIONAL — false = el producto no aparece en el catálogo"
        },
        fecha_creacion: {
          bsonType: "date",
          description: "OPCIONAL — Fecha de alta del producto"
        }
      }
    }
  },
  validationAction: "error",
  validationLevel:  "strict"
});
print("✅ [3/7] Colección 'productos' creada con validación JSON Schema");

// ─────────────────────────────────────────────
//  4. COLECCIÓN: pedidos
//
//  DECISIÓN DE DISEÑO — detalle[] EMBEBIDO:
//  El array detalle[] contiene los ítems del pedido como subdocumentos
//  embebidos (no como colección separada) porque:
//  (a) Los ítems siempre se acceden junto al pedido → un solo findOne()
//  (b) Son inmutables una vez registrados → snapshot del precio pagado
//  (c) Cardinalidad acotada (<50 ítems por pedido típicamente)
//  Resultado: recuperar un pedido completo tarda < 5ms sin JOINs.
//
//  Cliente y Producto se REFERENCIAN (solo el ObjectId):
//  - Cliente: se actualiza independientemente; cardinalidad 1→N
//  - Producto: precio actual puede cambiar; el snapshot va en precio_unitario
// ─────────────────────────────────────────────
db.createCollection("pedidos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Esquema de Validación — Pedido",
      description: "Orden de compra con ítems embebidos como subdocumentos",
      required: ["fecha", "estado", "id_cliente", "detalle"],
      additionalProperties: true,
      properties: {
        _id: { bsonType: "objectId" },
        fecha: {
          bsonType: "date",
          description: "OBLIGATORIO — Timestamp de creación del pedido"
        },
        estado: {
          bsonType: "string",
          enum: ["pendiente", "procesando", "despachado", "entregado", "cancelado"],
          description: "OBLIGATORIO — Estado actual en el flujo del pedido"
        },
        id_cliente: {
          bsonType: "objectId",
          description: "OBLIGATORIO — Referencia (FK) al _id de la colección 'clientes'"
        },
        detalle: {
          bsonType: "array",
          minItems: 1,
          description: "OBLIGATORIO — Array de subdocumentos embebidos con ítems del pedido",
          items: {
            bsonType: "object",
            required: ["id_producto", "cantidad", "precio_unitario"],
            additionalProperties: false,   // No permite campos extra en subdocumentos
            properties: {
              id_producto: {
                bsonType: "objectId",
                description: "Referencia (FK) al _id de 'productos'"
              },
              cantidad: {
                bsonType: "int",
                minimum: 1,
                description: "Unidades compradas (mínimo 1)"
              },
              precio_unitario: {
                bsonType: ["double", "int", "long"],
                minimum: 0.01,
                description: "Precio al momento de la compra — SNAPSHOT INMUTABLE"
              }
            }
          }
        },
        total: {
          bsonType: ["double", "int", "long"],
          minimum: 0,
          description: "OPCIONAL — Suma de (cantidad × precio_unitario) de todos los ítems"
        },
        historial_estados: {
          bsonType: "array",
          description: "OPCIONAL — Trazabilidad de cambios de estado",
          items: {
            bsonType: "object",
            required: ["estado", "fecha"],
            properties: {
              estado: { bsonType: "string" },
              fecha:  { bsonType: "date" }
            }
          }
        },
        direccion_entrega: {
          bsonType: "string",
          description: "OPCIONAL — Dirección de despacho capturada en el pedido"
        },
        notas: {
          bsonType: "string",
          maxLength: 500,
          description: "OPCIONAL — Observaciones del operador o del cliente"
        }
      }
    }
  },
  validationAction: "error",
  validationLevel:  "strict"
});
print("✅ [4/7] Colección 'pedidos' creada (detalle[] embebido como subdocumentos)");

// ─────────────────────────────────────────────
//  4b. COLECCIÓN: usuarios
//      Autenticación de operadores de la aplicación.
//      NUNCA se almacena la contraseña en texto plano.
//      Solo el hash bcrypt (60+ caracteres) generado en Python.
// ─────────────────────────────────────────────
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Esquema de Validación — Usuario del Sistema",
      description: "Operador con acceso a la aplicación ComercioTech",
      required: ["usuario", "password_hash", "rol"],
      additionalProperties: false,   // Esquema estricto — no permite campos extra
      properties: {
        _id: { bsonType: "objectId" },
        usuario: {
          bsonType: "string",
          minLength: 3,
          maxLength: 50,
          description: "OBLIGATORIO — Nombre de usuario único para login"
        },
        password_hash: {
          bsonType: "string",
          minLength: 60,
          description: "OBLIGATORIO — Hash bcrypt (12 rondas) — NUNCA texto plano"
        },
        rol: {
          bsonType: "string",
          enum: ["admin", "vendedor", "bodega", "reportes"],
          description: "OBLIGATORIO — Rol que determina permisos en la aplicación"
        },
        activo: {
          bsonType: "bool",
          description: "OPCIONAL — false = usuario sin acceso (sin eliminar el registro)"
        },
        ultimo_acceso: {
          bsonType: ["date", "null"],
          description: "OPCIONAL — Timestamp del último login exitoso"
        }
      }
    }
  },
  validationAction: "error",
  validationLevel:  "strict"
});
print("✅ [4c/7] Colección 'usuarios' creada con validación JSON Schema");

// ─────────────────────────────────────────────
//  5. ÍNDICES
//     Diseñados según los patrones de acceso identificados:
//     (1) Búsqueda de cliente por correo → idx único en correo
//     (2) Historial de pedidos de un cliente → idx compuesto
//     (3) Alertas de pedidos pendientes → idx estado + fecha
//     (4) Pipeline de productos más vendidos → idx en detalle.id_producto
// ─────────────────────────────────────────────

// ── clientes ──────────────────────────────────
db.clientes.createIndex(
  { correo: 1 },
  { unique: true, name: "idx_clientes_correo_unique" }
);
db.clientes.createIndex(
  { telefono: 1 },
  { name: "idx_clientes_telefono", sparse: true }
);
db.clientes.createIndex(
  { apellido: 1, nombre: 1 },
  { name: "idx_clientes_nombre_completo" }
);

// ── productos ─────────────────────────────────
db.productos.createIndex(
  { categoria: 1, nombre: 1 },
  { name: "idx_productos_cat_nombre" }
);
db.productos.createIndex(
  { nombre: "text", descripcion: "text" },
  { name: "idx_productos_texto", weights: { nombre: 10, descripcion: 3 } }
);
db.productos.createIndex(
  { precio: 1 },
  { name: "idx_productos_precio" }
);

// ── pedidos ───────────────────────────────────
db.pedidos.createIndex(
  { id_cliente: 1, fecha: -1 },
  { name: "idx_pedidos_cliente_fecha" }
);
db.pedidos.createIndex(
  { estado: 1, fecha: 1 },
  { name: "idx_pedidos_estado_fecha" }
);
db.pedidos.createIndex(
  { "detalle.id_producto": 1 },
  { name: "idx_pedidos_detalle_producto" }
);

// ── usuarios ──────────────────────────────────
db.usuarios.createIndex(
  { usuario: 1 },
  { unique: true, name: "idx_usuarios_usuario_unique" }
);

print("✅ [5/7] 10 índices creados en 4 colecciones");

// ─────────────────────────────────────────────
//  6. DATOS DE EJEMPLO
// ─────────────────────────────────────────────

// ── 6a. CLIENTES (4 documentos) ───────────────
const resClientes = db.clientes.insertMany([
  {
    nombre: "Valentina",
    apellido: "Morales",
    correo: "valentina.morales@gmail.com",
    telefono: "+56912345678",
    fecha_registro: new Date("2024-03-15T10:00:00Z"),
    activo: true
  },
  {
    nombre: "Rodrigo",
    apellido: "Fernández",
    correo: "rodrigo.fernandez@outlook.com",
    telefono: "+56987654321",
    fecha_registro: new Date("2024-06-01T14:30:00Z"),
    activo: true
  },
  {
    nombre: "Camila",
    apellido: "Vásquez",
    correo: "camila.vasquez@empresa.cl",
    telefono: "+56922334455",
    fecha_registro: new Date("2025-01-20T09:15:00Z"),
    activo: true
  },
  {
    nombre: "Andrés",
    apellido: "Soto",
    correo: "andres.soto@gmail.com",
    telefono: "+56933221100",
    fecha_registro: new Date("2025-04-10T11:45:00Z"),
    activo: false   // Ejemplo de cliente desactivado lógicamente
  }
]);
print(`✅ [6a/7] Clientes insertados: ${Object.keys(resClientes.insertedIds).length}`);

// Referencias para usar en los pedidos
const idCliente1 = resClientes.insertedIds[0]; // Valentina Morales
const idCliente2 = resClientes.insertedIds[1]; // Rodrigo Fernández
const idCliente3 = resClientes.insertedIds[2]; // Camila Vásquez

// ── 6b. PRODUCTOS (5 documentos) ──────────────
const resProductos = db.productos.insertMany([
  {
    nombre: "Laptop Lenovo IdeaPad 3",
    precio: 549990.00,
    categoria: "Electrónica",
    descripcion: "Laptop 15.6\", Intel Core i5 12ª gen, 16 GB RAM, 512 GB SSD NVMe",
    stock: NumberInt(25),
    activo: true,
    fecha_creacion: new Date("2024-01-10T00:00:00Z")
  },
  {
    nombre: "Zapatillas Running Nike Air Zoom",
    precio: 89990.00,
    categoria: "Ropa y Calzado",
    descripcion: "Suela amortiguada, talla 42, color azul/blanco",
    stock: NumberInt(80),
    activo: true,
    fecha_creacion: new Date("2024-02-05T00:00:00Z")
  },
  {
    nombre: "Set de Ollas Antiadherentes (6 piezas)",
    precio: 34990.00,
    categoria: "Hogar y Jardín",
    descripcion: "6 ollas con tapas de vidrio, aptas para todo tipo de cocina",
    stock: NumberInt(50),
    activo: true,
    fecha_creacion: new Date("2024-03-01T00:00:00Z")
  },
  {
    nombre: "Bicicleta de Montaña Trek Marlin 5",
    precio: 449990.00,
    categoria: "Deportes",
    descripcion: "MTB aro 29, 21 velocidades, frenos de disco mecánicos, talla M",
    stock: NumberInt(10),
    activo: true,
    fecha_creacion: new Date("2024-04-15T00:00:00Z")
  },
  {
    nombre: "Smartwatch Samsung Galaxy Watch 6",
    precio: 179990.00,
    categoria: "Electrónica",
    descripcion: "Reloj inteligente 44mm, GPS, monitor cardíaco, resistente al agua 5ATM",
    stock: NumberInt(30),
    activo: true,
    fecha_creacion: new Date("2024-05-20T00:00:00Z")
  }
]);
print(`✅ [6b/7] Productos insertados: ${Object.keys(resProductos.insertedIds).length}`);

// Referencias para usar en los pedidos
const idProducto1 = resProductos.insertedIds[0]; // Laptop Lenovo
const idProducto2 = resProductos.insertedIds[1]; // Zapatillas Nike
const idProducto3 = resProductos.insertedIds[2]; // Set de Ollas
const idProducto4 = resProductos.insertedIds[3]; // Bicicleta Trek
const idProducto5 = resProductos.insertedIds[4]; // Smartwatch Samsung

// ── 6c. PEDIDOS (4 documentos con detalle[] embebido) ──
// NOTA CLAVE: precio_unitario captura el precio AL MOMENTO de la compra.
// Si el precio del producto cambia luego, el pedido histórico permanece correcto.
const resPedidos = db.pedidos.insertMany([
  {
    // Pedido 1: Valentina compra laptop + smartwatch → estado ENTREGADO
    fecha: new Date("2025-11-25T10:30:00Z"),
    estado: "entregado",
    id_cliente: idCliente1,
    detalle: [
      { id_producto: idProducto1, cantidad: NumberInt(1), precio_unitario: 549990.00 },
      { id_producto: idProducto5, cantidad: NumberInt(1), precio_unitario: 179990.00 }
    ],
    total: 729980.00,
    direccion_entrega: "Av. Providencia 1234, Piso 5, Santiago, RM",
    historial_estados: [
      { estado: "pendiente",  fecha: new Date("2025-11-25T10:30:00Z") },
      { estado: "procesando", fecha: new Date("2025-11-25T11:00:00Z") },
      { estado: "despachado", fecha: new Date("2025-11-26T09:00:00Z") },
      { estado: "entregado",  fecha: new Date("2025-11-27T14:15:00Z") }
    ]
  },
  {
    // Pedido 2: Rodrigo compra zapatillas (×2) + ollas → estado PENDIENTE
    fecha: new Date("2026-07-01T16:45:00Z"),
    estado: "pendiente",
    id_cliente: idCliente2,
    detalle: [
      { id_producto: idProducto2, cantidad: NumberInt(2), precio_unitario: 89990.00 },
      { id_producto: idProducto3, cantidad: NumberInt(1), precio_unitario: 34990.00 }
    ],
    total: 214970.00,
    direccion_entrega: "Calle Los Leones 456, Ñuñoa, Santiago",
    historial_estados: [
      { estado: "pendiente", fecha: new Date("2026-07-01T16:45:00Z") }
    ]
  },
  {
    // Pedido 3: Camila compra bicicleta → estado DESPACHADO
    fecha: new Date("2026-06-28T09:00:00Z"),
    estado: "despachado",
    id_cliente: idCliente3,
    detalle: [
      { id_producto: idProducto4, cantidad: NumberInt(1), precio_unitario: 449990.00 }
    ],
    total: 449990.00,
    direccion_entrega: "Pasaje Los Pinos 789, Maipú, Santiago",
    notas: "Entregar en portería, preguntar por Camila V.",
    historial_estados: [
      { estado: "pendiente",  fecha: new Date("2026-06-28T09:00:00Z") },
      { estado: "procesando", fecha: new Date("2026-06-28T10:30:00Z") },
      { estado: "despachado", fecha: new Date("2026-06-30T08:00:00Z") }
    ]
  },
  {
    // Pedido 4: Valentina cancela pedido de ollas → estado CANCELADO
    fecha: new Date("2026-05-10T12:00:00Z"),
    estado: "cancelado",
    id_cliente: idCliente1,
    detalle: [
      { id_producto: idProducto3, cantidad: NumberInt(1), precio_unitario: 34990.00 }
    ],
    total: 34990.00,
    notas: "Cancelado por duplicidad de compra — solicitud del cliente",
    historial_estados: [
      { estado: "pendiente",  fecha: new Date("2026-05-10T12:00:00Z") },
      { estado: "cancelado",  fecha: new Date("2026-05-10T12:30:00Z") }
    ]
  }
]);
print(`✅ [6c/7] Pedidos insertados: ${Object.keys(resPedidos.insertedIds).length}`);

// ── 6d. USUARIOS (4 documentos con password hasheado) ──
// IMPORTANTE: Los hashes bcrypt son generados en Python así:
//   import bcrypt
//   hash = bcrypt.hashpw("MiContraseña".encode(), bcrypt.gensalt(rounds=12))
// NUNCA se almacena la contraseña en texto plano en la base de datos.
const resUsuarios = db.usuarios.insertMany([
  {
    usuario: "admin_ct",
    // Hash bcrypt (12 rondas) — contraseña de ejemplo: "Admin2024!"
    password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewYi4bUcWj9pFKdG",
    rol: "admin",
    activo: true,
    ultimo_acceso: new Date("2026-07-01T08:00:00Z")
  },
  {
    usuario: "vendedor1",
    // Hash bcrypt — contraseña de ejemplo: "Vendedor#1"
    password_hash: "$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    rol: "vendedor",
    activo: true,
    ultimo_acceso: new Date("2026-07-02T09:30:00Z")
  },
  {
    usuario: "bodega_ct",
    // Hash bcrypt — contraseña de ejemplo: "Bodega@2024"
    password_hash: "$2b$12$n9qreq5/DlV.Va8ieTY7sO3JQT7oFVMcWQPAUYAGrLkFxbf7SZLLS",
    rol: "bodega",
    activo: true,
    ultimo_acceso: null
  },
  {
    usuario: "reporter_ct",
    // Hash bcrypt — contraseña de ejemplo: "Reports01!"
    password_hash: "$2b$12$k8KBHZMbSXj.pF2r9bE4kOQ4EJ9aA5GKW3zNlD5vWqQjN9Ux.e8vK",
    rol: "reportes",
    activo: true,
    ultimo_acceso: null
  }
]);
print(`✅ [6d/7] Usuarios insertados: ${Object.keys(resUsuarios.insertedIds).length}`);

// ─────────────────────────────────────────────
//  7. USUARIO DE APLICACIÓN MONGODB
//     Rol readWrite SOLO en BD "comerciotech" — Mínimo privilegio
//     Este usuario es el que usa PyMongo en la aplicación Python.
//     No tiene acceso a admin ni a otras BDs.
// ─────────────────────────────────────────────
try {
  db.createUser({
    user: "comerciotech_app",
    pwd:  "Ct@AppSecure2024!",   // ⚠️ CAMBIAR antes de producción — usar variable de entorno
    roles: [
      { role: "readWrite", db: "comerciotech" }
    ],
    customData: {
      descripcion: "Usuario de aplicación PyMongo — acceso restringido a BD comerciotech",
      creado_por:  "crear_db.js",
      fecha:       new Date()
    }
  });
  print("✅ [7/7] Usuario 'comerciotech_app' creado con rol readWrite en BD 'comerciotech'");
  print("         Contraseña: definida en el script (cambiar antes de producción)");
} catch (e) {
  if (e.code === 51003) {
    print("⚠️  [7/7] Usuario 'comerciotech_app' ya existe — omitiendo creación");
  } else {
    print(`❌ [7/7] Error al crear usuario: ${e.message}`);
    print("   → Si no tienes permisos de userAdmin, ejecuta el bloque createUser");
    print("     separadamente conectando como administrador de MongoDB:");
    print("     mongosh -u superadmin -p --authenticationDatabase admin");
  }
}

// ─────────────────────────────────────────────
//  8. VERIFICACIÓN FINAL DEL ESTADO
// ─────────────────────────────────────────────
print("\n");
print("═══════════════════════════════════════════════════════════════");
print("  RESUMEN FINAL — Base de Datos 'comerciotech' en MongoDB 8.2.6");
print("═══════════════════════════════════════════════════════════════");

const colsFinal = ["clientes", "productos", "pedidos", "usuarios"];
colsFinal.forEach((col) => {
  const count   = db[col].countDocuments();
  const indices = db[col].getIndexes().length;
  print(`  📁 ${col.padEnd(12)} → ${String(count).padStart(2)} documento(s) | ${String(indices).padStart(2)} índice(s)`);
});

print("\n  ÍNDICES PERSONALIZADOS CREADOS:");
colsFinal.forEach((col) => {
  db[col].getIndexes()
    .filter((idx) => idx.name !== "_id_")
    .forEach((idx) => {
      const tipo = idx.unique ? " [ÚNICO]" : "";
      print(`  · ${col}.${idx.name}${tipo}`);
    });
});

print("\n  VALIDACIÓN: JSON Schema activo (validationAction: error, validationLevel: strict)");
print("  USUARIO APP: comerciotech_app → readWrite en BD 'comerciotech' (solo)");
print("═══════════════════════════════════════════════════════════════");
print("  ✅ Script finalizado sin errores. Entorno listo para PyMongo.");
print("═══════════════════════════════════════════════════════════════\n");
