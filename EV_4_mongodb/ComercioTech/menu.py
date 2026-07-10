"""
Módulo de interfaz de línea de comandos.
Implementa control de acceso basado en roles (RBAC):
  - admin:    Acceso completo (Clientes, Productos, Pedidos, Reportes)
  - vendedor: Clientes y Pedidos
  - bodega:   Productos (inventario)
  - reportes: Solo consultas analíticas (lectura)
"""
import sys
import os
import time
import getpass
from login import autenticar_usuario
from crud.crud_clientes import leer_clientes, crear_cliente, actualizar_cliente, eliminar_cliente, buscar_cliente_por_codigo
from crud.crud_productos import leer_productos, crear_producto, actualizar_producto, eliminar_producto, buscar_producto_por_codigo
from crud.crud_pedidos import leer_pedidos, crear_pedido, actualizar_estado_pedido, eliminar_pedido, buscar_pedido_por_codigo
from utils.validaciones import validar_correo, validar_precio, validar_cantidad, validar_telefono, validar_estado_pedido
from services.consultas_agregacion import total_vendido_por_cliente, producto_mas_vendido, promedio_gasto_por_pedido

# ─── Funciones de entrada segura ───────────────────────────
def pedir_precio(mensaje: str) -> float:
    while True:
        val = input(mensaje).strip()
        if not val:
            print("❌ ERROR: El precio es obligatorio.")
            continue
        try:
            num = float(val)
            if validar_precio(num):
                return num
            print("❌ ERROR: El precio no puede ser negativo.")
        except ValueError:
            print("❌ ERROR: Debe ingresar un número válido.")

def pedir_cantidad(mensaje: str) -> int:
    while True:
        val = input(mensaje).strip()
        if not val:
            print("❌ ERROR: La cantidad es obligatoria.")
            continue
        try:
            num = int(val)
            if validar_cantidad(num):
                return num
            print("❌ ERROR: La cantidad debe ser mayor a cero.")
        except ValueError:
            print("❌ ERROR: Debe ingresar un número entero válido.")

def pedir_texto_obligatorio(mensaje: str, min_length: int = 1) -> str:
    while True:
        val = input(mensaje).strip()
        if not val:
            print("❌ ERROR: Este campo no puede estar en blanco.")
            continue
        if len(val) < min_length:
            print(f"❌ ERROR: Debe tener al menos {min_length} caracteres.")
            continue
        return val

def pedir_telefono() -> str:
    while True:
        val = input("Teléfono: ").strip()
        if not val:
            print("❌ ERROR: El teléfono es obligatorio.")
            continue
        if not validar_telefono(val):
            print("❌ ERROR: Formato de teléfono inválido (7-20 dígitos, puede incluir + o -).")
            continue
        return val

def pedir_correo() -> str:
    while True:
        val = input("Correo: ").strip()
        if not val:
            print("❌ ERROR: El correo es obligatorio.")
            continue
        if not validar_correo(val):
            print("❌ ERROR: El formato del correo es inválido.")
            continue
        return val

def pedir_codigo(mensaje: str) -> str:
    while True:
        val = input(mensaje).strip()
        if not val:
            print("❌ ERROR: El código es obligatorio.")
            continue
        if not val.isdigit():
            print("❌ ERROR: El código debe ser numérico.")
            continue
        return val

def pedir_categoria(opcional: bool = False) -> str:
    categorias = ['Electrónica', 'Ropa y Calzado', 'Hogar y Jardín', 'Deportes', 'Alimentos', 'Libros y Educación', 'Herramientas', 'Juguetes', 'Salud y Belleza', 'Otros']
    print("\nCategorías disponibles:")
    for i, cat in enumerate(categorias, 1):
        print(f"  {i}. {cat}")
    
    while True:
        msg = "Seleccione el número de la categoría (Enter para omitir): " if opcional else "Seleccione el número de la categoría: "
        val = input(msg).strip()
        if opcional and not val:
            return ""
        if not val.isdigit():
            print("❌ ERROR: Debe ingresar un número válido.")
            continue
        idx = int(val)
        if 1 <= idx <= len(categorias):
            return categorias[idx - 1]
        print("❌ ERROR: Selección fuera de rango.")

# ─── Permisos por rol ────────────────────────────────────────
PERMISOS = {
    "admin":    {"clientes", "productos", "pedidos", "reportes"},
    "vendedor": {"clientes", "pedidos"},
    "bodega":   {"productos"},
    "reportes": {"reportes"},
}

def mostrar_agregaciones():
    """Submenú de reportes analíticos (Aggregation Framework)."""
    print("\n--- REPORTES ANALÍTICOS ---")
    print("1. Total vendido por cliente")
    print("2. Productos más vendidos")
    print("3. Ticket promedio por estado")
    opc = input("Seleccione: ")
    if opc == '1':
        print("\n🏆 TOTAL VENDIDO POR CLIENTE 🏆")
        for res in total_vendido_por_cliente(): 
            print(f"   [{res.get('_id')}] {res.get('nombre')} {res.get('apellido')} - 💰 Total Gastado: ${res.get('total_gastado', 0):.2f}")
    elif opc == '2':
        print("\n🔥 PRODUCTOS MÁS VENDIDOS 🔥")
        for res in producto_mas_vendido(): 
            print(f"   [{res.get('_id')}] {res.get('nombre_producto')} - 📦 Unidades Vendidas: {res.get('cantidad_total')}")
    elif opc == '3':
        print("\n📈 TICKET PROMEDIO POR ESTADO 📈")
        for res in promedio_gasto_por_pedido(): 
            print(f"   📦 {str(res.get('_id')).upper()}: 💳 Promedio ${res.get('promedio_ticket', 0):.2f}")
    print("-" * 30)
    input("\nPresione Enter para continuar...")

def menu_clientes():
    """Submenú CRUD completo de Clientes."""
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("\n--- CLIENTES ---")
        print("1. Ver | 2. Crear | 3. Actualizar | 4. Eliminar | 5. Volver")
        s = input("Opción: ")
        if s == '5':
            break
        elif s == '1':
            print("\n--- LISTA DE CLIENTES ---")
            for c in leer_clientes(): 
                print(f"[{c.get('_id')}] {c.get('nombre')} {c.get('apellido')} | 📧 {c.get('correo')} | 📞 {c.get('telefono', 'N/A')}")
            print("-" * 30)
            input("\nPresione Enter para continuar...")
        elif s == '2':
            print("\n--- ✨ CREAR NUEVO CLIENTE ---")
            n = pedir_texto_obligatorio("Nombre: ", min_length=2)
            a = pedir_texto_obligatorio("Apellido: ", min_length=2)
            c = pedir_correo()
            t = pedir_telefono()
            
            nuevo_id = crear_cliente(n, a, c, t)
            if nuevo_id:
                cliente = buscar_cliente_por_codigo(nuevo_id)
                if cliente:
                    print("\n✅ CLIENTE CREADO EXITOSAMENTE:")
                    print(f"   [{cliente.get('_id')}] {cliente.get('nombre')} {cliente.get('apellido')} | 📧 {cliente.get('correo')} | 📞 {cliente.get('telefono', 'N/A')}")
            input("\nPresione Enter para continuar...")
        elif s == '3':
            print("\n--- ✏️ ACTUALIZAR CLIENTE ---")
            print("Clientes disponibles:")
            for c in leer_clientes():
                print(f"  [{c.get('_id')}] {c.get('nombre')} {c.get('apellido')}")
            id_c = pedir_codigo("Código del Cliente a actualizar: ")
            
            campos = {}
            n = input("Nuevo nombre (Enter para omitir): ").strip()
            if n: campos["nombre"] = n
            a = input("Nuevo apellido (Enter para omitir): ").strip()
            if a: campos["apellido"] = a
            
            while True:
                c = input("Nuevo correo (Enter para omitir): ").strip()
                if not c:
                    break
                if not validar_correo(c):
                    print("❌ ERROR: El formato del correo es inválido.")
                    continue
                campos["correo"] = c
                break
                
            t = input("Nuevo teléfono (Enter para omitir): ").strip()
            if t: campos["telefono"] = t
            
            if campos:
                actualizar_cliente(id_c, campos)
            else:
                print("No se ingresaron cambios.")
            input("\nPresione Enter para continuar...")
        elif s == '4':
            print("\n--- 🗑️ ELIMINAR CLIENTE ---")
            print("Clientes disponibles:")
            for c in leer_clientes():
                print(f"  [{c.get('_id')}] {c.get('nombre')} {c.get('apellido')}")
            id_c = pedir_codigo("Código del Cliente a eliminar: ")
            eliminar_cliente(id_c)
            input("\nPresione Enter para continuar...")

def menu_productos():
    """Submenú CRUD completo de Productos."""
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("\n--- PRODUCTOS ---")
        print("1. Ver | 2. Crear | 3. Actualizar | 4. Eliminar | 5. Volver")
        s = input("Opción: ")
        
        if s == '5':
            break
        elif s == '1':
            productos = leer_productos()
            categorias = {}
            for p in productos:
                cat = p.get("categoria", "Otros")
                if cat not in categorias:
                    categorias[cat] = []
                categorias[cat].append(p)
            
            print("\n=== CATÁLOGO DE PRODUCTOS ===")
            for cat, prods in categorias.items():
                print(f"\n📁 {cat.upper()}")
                for p in prods:
                    print(f"   [{p.get('_id')}] {p.get('nombre')} - ${p.get('precio')} (Stock: {p.get('stock', 0)})")
            print("=" * 30)
            input("\nPresione Enter para continuar...")
        elif s == '2':
            print("\n--- ✨ CREAR NUEVO PRODUCTO ---")
            n = pedir_texto_obligatorio("Nombre: ")
            pr = pedir_precio("Precio: ")
            c = pedir_categoria()
            d = input("Descripción: ").strip()
            
            nuevo_id = crear_producto(n, pr, c, d)
            if nuevo_id:
                p = buscar_producto_por_codigo(nuevo_id)
                if p:
                    print("\n✅ PRODUCTO CREADO EXITOSAMENTE:")
                    print(f"   [{p.get('_id')}] {p.get('nombre')} - ${p.get('precio')} (Stock: {p.get('stock', 0)})")
            input("\nPresione Enter para continuar...")
        elif s == '3':
            print("\n--- ✏️ ACTUALIZAR PRODUCTO ---")
            print("Productos disponibles:")
            for p in leer_productos():
                print(f"  [{p.get('_id')}] {p.get('nombre')} - ${p.get('precio')}")
            id_p = pedir_codigo("Código del Producto a actualizar: ")
            
            campos = {}
            n = input("Nuevo nombre (Enter para omitir): ").strip()
            if n: campos["nombre"] = n
            
            print("--- Presione Enter para omitir precio ---")
            while True:
                pr_str = input("Nuevo precio: ").strip()
                if not pr_str:
                    break
                try:
                    pr = float(pr_str)
                    if not validar_precio(pr):
                        print("❌ ERROR: El precio no puede ser negativo.")
                        continue
                    campos["precio"] = pr
                    break
                except ValueError:
                    print("❌ ERROR: El precio debe ser numérico.")
                    
            c = pedir_categoria(opcional=True)
            if c: campos["categoria"] = c
            
            d = input("Nueva descripción (Enter para omitir): ").strip()
            if d: campos["descripcion"] = d
            
            if campos:
                actualizar_producto(id_p, campos)
            else:
                print("No se ingresaron cambios.")
            input("\nPresione Enter para continuar...")
        elif s == '4':
            print("\n--- 🗑️ ELIMINAR PRODUCTO ---")
            print("Productos disponibles:")
            for p in leer_productos():
                print(f"  [{p.get('_id')}] {p.get('nombre')} - ${p.get('precio')}")
            id_p = pedir_codigo("Código del Producto a eliminar: ")
            eliminar_producto(id_p)
            input("\nPresione Enter para continuar...")

def menu_pedidos():
    """Submenú CRUD de Pedidos (Update = Cambiar Estado)."""
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("\n--- PEDIDOS ---")
        print("1. Ver | 2. Crear | 3. Cambiar Estado | 4. Eliminar | 5. Volver")
        s = input("Opción: ")
        if s == '5':
            break
        elif s == '1':
            pedidos = leer_pedidos()
            estados = {}
            for p in pedidos:
                est = p.get("estado", "desconocido")
                if est not in estados:
                    estados[est] = []
                estados[est].append(p)
            
            print("\n=== LISTA DE PEDIDOS ===")
            for est, peds in estados.items():
                print(f"\n📦 ESTADO: {est.upper()}")
                for p in peds:
                    fecha_str = p.get("fecha").strftime("%Y-%m-%d %H:%M") if p.get("fecha") else "N/A"
                    print(f"   [{p.get('_id')}] Cliente ID: {p.get('id_cliente')} | Total: ${p.get('total', 0)} | Fecha: {fecha_str}")
            print("=" * 30)
            input("\nPresione Enter para continuar...")
        elif s == '2':
            print("\n--- ✨ CREAR NUEVO PEDIDO ---")
            print("Clientes disponibles:")
            for c in leer_clientes():
                print(f"  [{c.get('_id')}] {c.get('nombre')} {c.get('apellido')}")
            id_c = pedir_codigo("Código del Cliente: ")
            
            print("\nProductos disponibles:")
            for p in leer_productos():
                print(f"  [{p.get('_id')}] {p.get('nombre')} - ${p.get('precio')}")
            id_p = pedir_codigo("Código del Producto: ")
            cant = pedir_cantidad("Cantidad: ")
            
            nuevo_id = crear_pedido(id_c, [(id_p, cant)])
            if nuevo_id:
                p = buscar_pedido_por_codigo(nuevo_id)
                if p:
                    fecha_str = p.get("fecha").strftime("%Y-%m-%d %H:%M") if p.get("fecha") else "N/A"
                    print("\n✅ PEDIDO CREADO EXITOSAMENTE:")
                    print(f"   [{p.get('_id')}] Cliente ID: {p.get('id_cliente')} | Total: ${p.get('total', 0)} | Fecha: {fecha_str}")
            input("\nPresione Enter para continuar...")
        elif s == '3':
            print("\n--- 🔄 CAMBIAR ESTADO DE PEDIDO ---")
            print("Pedidos disponibles:")
            for p in leer_pedidos():
                print(f"  [{p.get('_id')}] Cliente ID: {p.get('id_cliente')} - Estado: {p.get('estado')}")
            id_ped = pedir_codigo("Código del Pedido: ")
            
            while True:
                est = pedir_texto_obligatorio("Nuevo estado (pendiente/procesando/despachado/entregado/cancelado): ").lower()
                if validar_estado_pedido(est):
                    break
                print("❌ ERROR: El estado ingresado no es válido.")
            
            actualizar_estado_pedido(id_ped, est)
            input("\nPresione Enter para continuar...")
        elif s == '4':
            print("\n--- 🗑️ ELIMINAR PEDIDO ---")
            print("Pedidos disponibles:")
            for p in leer_pedidos():
                print(f"  [{p.get('_id')}] Cliente ID: {p.get('id_cliente')} - Estado: {p.get('estado')}")
            id_ped = pedir_codigo("Código del Pedido a eliminar: ")
            eliminar_pedido(id_ped)
            input("\nPresione Enter para continuar...")

def menu_principal(rol: str):
    """
    Menú principal filtrado por rol del usuario autenticado.
    Solo muestra las opciones a las que el rol tiene acceso.
    """
    permisos = PERMISOS.get(rol, set())

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"\n=== MENÚ COMERCIOTECH [{rol.upper()}] ===")

        # Construir opciones dinámicamente según permisos
        opciones = []
        if "clientes" in permisos:
            opciones.append(("Clientes", menu_clientes))
        if "productos" in permisos:
            opciones.append(("Productos", menu_productos))
        if "pedidos" in permisos:
            opciones.append(("Pedidos", menu_pedidos))
        if "reportes" in permisos:
            opciones.append(("Reportes", mostrar_agregaciones))

        for i, (texto, _) in enumerate(opciones, 1):
            print(f"{i}. {texto}")
        print(f"{len(opciones) + 1}. Salir")

        opc = input("Selección: ")

        try:
            idx = int(opc)
        except ValueError:
            print("Opción inválida.")
            continue

        if idx == len(opciones) + 1:
            print("Sesión cerrada.")
            sys.exit(0)
        elif 1 <= idx <= len(opciones):
            opciones[idx - 1][1]()
        else:
            print("Opción inválida.")

def inicio():
    """Entrada al programa que valida login y pasa el rol al menú."""
    print("Bienvenido al Sistema ComercioTech")
    intentos = 0
    while intentos < 3:
        u = input("Usuario: ")
        p = getpass.getpass("Contraseña: ")
        user_doc = autenticar_usuario(u, p)
        if user_doc:
            rol = user_doc.get("rol", "reportes")
            print(f"Login exitoso. Rol: {rol}")
            menu_principal(rol)
            break
        else:
            print("Credenciales incorrectas o usuario desactivado.")
            intentos += 1
    if intentos >= 3:
        print("Sistema bloqueado por exceso de intentos.")

if __name__ == "__main__":
    inicio()
