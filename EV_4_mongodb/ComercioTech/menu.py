"""
Módulo de interfaz de línea de comandos.
"""
import sys
from login import autenticar_usuario
from crud.crud_clientes import leer_clientes, crear_cliente, eliminar_cliente
from crud.crud_productos import leer_productos, crear_producto, eliminar_producto
from crud.crud_pedidos import leer_pedidos, crear_pedido, actualizar_estado_pedido, eliminar_pedido
from services.consultas_agregacion import total_vendido_por_cliente, producto_mas_vendido, promedio_gasto_por_pedido

def mostrar_agregaciones():
    print("\n--- REPORTES ANALÍTICOS (Fase 4) ---")
    print("1. Total vendido por cliente")
    print("2. Productos más vendidos")
    print("3. Ticket promedio por estado")
    opc = input("Seleccione: ")
    if opc == '1':
        for res in total_vendido_por_cliente(): print(res)
    elif opc == '2':
        for res in producto_mas_vendido(): print(res)
    elif opc == '3':
        for res in promedio_gasto_por_pedido(): print(res)

def menu_principal():
    """Maneja el bucle principal de la CLI."""
    while True:
        print("\n=== MENÚ COMERCIOTECH ===")
        print("1. Clientes (CRUD)")
        print("2. Productos (CRUD)")
        print("3. Pedidos (CRUD)")
        print("4. Reportes (Agregaciones)")
        print("5. Salir")
        
        opc = input("Selección: ")
        
        if opc == '1':
            print("1. Ver | 2. Crear | 3. Eliminar")
            s = input("Opción: ")
            if s == '1':
                for c in leer_clientes(): print(c)
            elif s == '2':
                n = input("Nombre: ")
                a = input("Apellido: ")
                c = input("Correo: ")
                t = input("Teléfono: ")
                crear_cliente(n, a, c, t)
            elif s == '3':
                id_c = input("ID Cliente a eliminar: ")
                eliminar_cliente(id_c)
        elif opc == '2':
            print("1. Ver | 2. Crear | 3. Eliminar")
            s = input("Opción: ")
            if s == '1':
                for p in leer_productos(): print(p)
            elif s == '2':
                n = input("Nombre: ")
                pr = float(input("Precio: "))
                c = input("Categoria: ")
                d = input("Descripcion: ")
                crear_producto(n, pr, c, d)
            elif s == '3':
                id_p = input("ID Producto a eliminar: ")
                eliminar_producto(id_p)
        elif opc == '3':
            print("1. Ver | 2. Crear | 3. Cambiar Estado | 4. Eliminar")
            s = input("Opción: ")
            if s == '1':
                for p in leer_pedidos(): print(p)
            elif s == '2':
                id_c = input("ID Cliente: ")
                id_p = input("ID Producto: ")
                cant = int(input("Cantidad: "))
                crear_pedido(id_c, [(id_p, cant)])
            elif s == '3':
                id_ped = input("ID Pedido: ")
                est = input("Nuevo estado: ")
                actualizar_estado_pedido(id_ped, est)
            elif s == '4':
                id_ped = input("ID Pedido a eliminar: ")
                eliminar_pedido(id_ped)
        elif opc == '4':
            mostrar_agregaciones()
        elif opc == '5':
            sys.exit(0)

def inicio():
    """Entrada al programa que valida login."""
    print("Bienvenido al Sistema ComercioTech")
    intentos = 0
    while intentos < 3:
        u = input("Usuario: ")
        p = input("Contraseña: ")
        # Para evitar bloquearte probando, puedes bypasear el login retornando True temporalmente
        if autenticar_usuario(u, p):
            print("Login exitoso.")
            menu_principal()
            break
        else:
            print("Credenciales incorrectas.")
            intentos += 1
    if intentos == 3: print("Sistema bloqueado.")

if __name__ == "__main__":
    inicio()
