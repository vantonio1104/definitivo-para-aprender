# Sistema de menús de consola para ComercioTech
from __future__ import annotations
import os
from typing import Optional
from bson import ObjectId

from crud.crud_clientes import (
    insertar_cliente, listar_clientes, buscar_por_correo,
    buscar_por_nombre, actualizar_cliente, desactivar_cliente, eliminar_cliente,
)
from crud.crud_productos import (
    insertar_producto, listar_productos, buscar_texto,
    actualizar_producto, actualizar_precio_por_categoria,
    desactivar_producto, eliminar_producto,
)
from crud.crud_pedidos import (
    insertar_pedido, buscar_pedido_por_id, listar_pedidos_por_cliente,
    listar_pedidos_por_estado, top_productos_vendidos,
    cambiar_estado, cancelar_pedido,
)
from utils.validaciones import CATEGORIAS_VALIDAS, ESTADOS_PEDIDO_VALIDOS

# ─── UTILIDADES DE INTERFAZ ───────────────────────────────────────────────────

def _limpiar_pantalla() -> None:
    # Limpia la pantalla de la consola
    os.system("cls" if os.name == "nt" else "clear")

def _separador(titulo: str = "") -> None:
    # Imprime un separador visual con título opcional
    if titulo:
        print(f"\n---- {titulo} " + "-" * (45 - len(titulo)))
    else:
        print("-" * 50)

def _pausar() -> None:
    # Espera a que el usuario presione Enter antes de continuar
    input("\n  Presione Enter para continuar...")

def _pedir(etiqueta: str, opcional: bool = False) -> str:
    # Solicita un valor al usuario por consola
    sufijo = " (opcional)" if opcional else ""
    return input(f"  {etiqueta}{sufijo}: ").strip()

def _formatear_doc(doc: dict, campos: list[str]) -> str:
    # Formatea campos específicos de un documento para mostrar en pantalla
    lineas = []
    for c in campos:
        val = doc.get(c, "-")
        if hasattr(val, "generation_time"):
            val = str(val)
        lineas.append(f"  {c:20s}: {val}")
    return "\n".join(lineas)

# ─── MENÚ CLIENTES ────────────────────────────────────────────────────────────

def _menu_clientes() -> None:
    # Submenú de gestión de clientes
    while True:
        _limpiar_pantalla()
        print("\n  GESTION DE CLIENTES")
        _separador()
        print("  1. Listar clientes")
        print("  2. Buscar por nombre o apellido")
        print("  3. Buscar por correo")
        print("  4. Agregar cliente")
        print("  5. Actualizar cliente")
        print("  6. Desactivar cliente")
        print("  7. Eliminar cliente (permanente)")
        print("  0. Volver al menú principal")
        _separador()

        opcion = _pedir("Opcion")

        if opcion == "1":
            _limpiar_pantalla()
            _separador("LISTADO DE CLIENTES ACTIVOS")
            docs = listar_clientes(solo_activos=True, limite=20)
            if not docs:
                print("  Sin resultados.")
            for d in docs:
                print(f"\n  ID: {d['_id']}")
                print(_formatear_doc(d, ["nombre", "apellido", "correo", "telefono"]))
            _pausar()

        elif opcion == "2":
            texto = _pedir("Nombre o apellido a buscar")
            docs = buscar_por_nombre(texto)
            if not docs:
                print("  Sin resultados.")
            for d in docs:
                print(f"\n  ID: {d['_id']}")
                print(_formatear_doc(d, ["nombre", "apellido", "correo"]))
            _pausar()

        elif opcion == "3":
            correo = _pedir("Correo electronico")
            doc = buscar_por_correo(correo)
            if doc:
                print(f"\n  ID: {doc['_id']}")
                print(_formatear_doc(doc, ["nombre", "apellido", "correo", "telefono", "activo"]))
            else:
                print(f"\n  [!] No se encontro cliente con correo '{correo}'.")
            _pausar()

        elif opcion == "4":
            _separador("AGREGAR CLIENTE")
            datos = {
                "nombre":   _pedir("Nombre"),
                "apellido": _pedir("Apellido"),
                "correo":   _pedir("Correo electronico"),
                "telefono": _pedir("Telefono", opcional=True),
            }
            id_nuevo = insertar_cliente(datos)
            if id_nuevo:
                print(f"\n  [OK] Cliente creado con ID: {id_nuevo}")
            _pausar()

        elif opcion == "5":
            id_c = _pedir("ID del cliente a actualizar")
            _separador("Dejar vacio para no modificar el campo")
            campos: dict = {}
            for campo in ("nombre", "apellido", "correo", "telefono"):
                val = _pedir(campo, opcional=True)
                if val:
                    campos[campo] = val
            if campos:
                ok = actualizar_cliente(id_c, campos)
                print("\n  [OK] Actualizado." if ok else "\n  [ERROR] No se pudo actualizar.")
            else:
                print("\n  Sin cambios.")
            _pausar()

        elif opcion == "6":
            id_c = _pedir("ID del cliente a desactivar")
            ok = desactivar_cliente(id_c)
            print("\n  [OK] Cliente desactivado." if ok else "\n  [ERROR] No se pudo desactivar.")
            _pausar()

        elif opcion == "7":
            id_c = _pedir("ID del cliente a eliminar")
            confirm = _pedir("Escribir 'CONFIRMAR' para eliminar permanentemente")
            if confirm == "CONFIRMAR":
                ok = eliminar_cliente(id_c, confirmar=True)
                print("\n  [OK] Eliminado." if ok else "\n  [ERROR] No se pudo eliminar.")
            else:
                print("\n  Operacion cancelada.")
            _pausar()

        elif opcion == "0":
            break

# ─── MENÚ PRODUCTOS ───────────────────────────────────────────────────────────

def _menu_productos() -> None:
    # Submenú de gestión de productos
    while True:
        _limpiar_pantalla()
        print("\n  GESTION DE PRODUCTOS")
        _separador()
        print("  1. Listar catalogo")
        print("  2. Filtrar por categoria")
        print("  3. Busqueda de texto")
        print("  4. Agregar producto")
        print("  5. Actualizar producto")
        print("  6. Ajustar precios por categoria")
        print("  7. Desactivar producto")
        print("  8. Eliminar producto (permanente)")
        print("  0. Volver al menú principal")
        _separador()

        opcion = _pedir("Opcion")

        if opcion == "1":
            docs = listar_productos(solo_activos=True, limite=20)
            if not docs:
                print("  Sin resultados.")
            for d in docs:
                print(f"\n  ID: {d['_id']}")
                print(_formatear_doc(d, ["nombre", "categoria", "precio", "stock"]))
            _pausar()

        elif opcion == "2":
            print("\n  Categorias: " + " | ".join(sorted(CATEGORIAS_VALIDAS)))
            cat = _pedir("Categoria")
            docs = listar_productos(categoria=cat, solo_activos=True)
            if not docs:
                print("  Sin resultados.")
            for d in docs:
                print(f"\n  ID: {d['_id']}")
                print(_formatear_doc(d, ["nombre", "precio", "stock"]))
            _pausar()

        elif opcion == "3":
            texto = _pedir("Palabras clave a buscar")
            docs = buscar_texto(texto)
            if not docs:
                print("  Sin resultados.")
            for d in docs:
                print(f"\n  {d.get('nombre')} -- ${d.get('precio'):,.0f} [{d.get('categoria')}]")
            _pausar()

        elif opcion == "4":
            _separador("AGREGAR PRODUCTO")
            print("  Categorias: " + " | ".join(sorted(CATEGORIAS_VALIDAS)))
            datos = {
                "nombre":      _pedir("Nombre del producto"),
                "precio":      _pedir("Precio"),
                "categoria":   _pedir("Categoria"),
                "descripcion": _pedir("Descripcion", opcional=True),
                "stock":       _pedir("Stock inicial (0 si no aplica)", opcional=True) or "0",
            }
            id_nuevo = insertar_producto(datos)
            if id_nuevo:
                print(f"\n  [OK] Producto creado con ID: {id_nuevo}")
            _pausar()

        elif opcion == "5":
            id_p = _pedir("ID del producto a actualizar")
            _separador("Dejar vacio para no modificar")
            campos: dict = {}
            for campo in ("nombre", "descripcion"):
                val = _pedir(campo, opcional=True)
                if val:
                    campos[campo] = val
            precio = _pedir("Nuevo precio", opcional=True)
            if precio:
                campos["precio"] = precio
            cat = _pedir("Nueva categoria", opcional=True)
            if cat:
                campos["categoria"] = cat
            stock = _pedir("Nuevo stock", opcional=True)
            if stock:
                campos["stock"] = stock
            if campos:
                ok = actualizar_producto(id_p, campos)
                print("\n  [OK] Actualizado." if ok else "\n  [ERROR] No se pudo actualizar.")
            else:
                print("\n  Sin cambios.")
            _pausar()

        elif opcion == "6":
            print("\n  Categorias: " + " | ".join(sorted(CATEGORIAS_VALIDAS)))
            cat    = _pedir("Categoria a ajustar")
            factor = _pedir("Factor (ej. 1.10 = +10%, 0.90 = -10%)")
            try:
                n = actualizar_precio_por_categoria(cat, float(factor))
                print(f"\n  [OK] {n} productos actualizados en '{cat}'.")
            except ValueError:
                print("\n  [!] Factor invalido.")
            _pausar()

        elif opcion == "7":
            id_p = _pedir("ID del producto a desactivar")
            ok = desactivar_producto(id_p)
            print("\n  [OK] Producto desactivado." if ok else "\n  [ERROR] Error.")
            _pausar()

        elif opcion == "8":
            id_p = _pedir("ID del producto a eliminar")
            confirm = _pedir("Escribir 'CONFIRMAR' para eliminar permanentemente")
            if confirm == "CONFIRMAR":
                ok = eliminar_producto(id_p, confirmar=True)
                print("\n  [OK] Eliminado." if ok else "\n  [ERROR] Error.")
            else:
                print("\n  Operacion cancelada.")
            _pausar()

        elif opcion == "0":
            break

# ─── MENÚ PEDIDOS ─────────────────────────────────────────────────────────────

def _menu_pedidos() -> None:
    # Submenú de gestión de pedidos
    while True:
        _limpiar_pantalla()
        print("\n  GESTION DE PEDIDOS")
        _separador()
        print("  1. Buscar pedido por ID")
        print("  2. Historial de pedidos de un cliente")
        print("  3. Listar pedidos por estado")
        print("  4. Top productos más vendidos")
        print("  5. Crear pedido")
        print("  6. Cambiar estado de pedido")
        print("  7. Cancelar pedido")
        print("  0. Volver al menú principal")
        _separador()

        opcion = _pedir("Opcion")

        if opcion == "1":
            id_p = _pedir("ID del pedido")
            doc = buscar_pedido_por_id(id_p)
            if doc:
                print(f"\n  ID:     {doc['_id']}")
                print(f"  Fecha:  {doc.get('fecha')}")
                print(f"  Estado: {doc.get('estado').upper()}")
                print(f"  Total:  ${doc.get('total', 0):,.2f}")
                print(f"  Items:  {len(doc.get('detalle', []))}")
                for item in doc.get("detalle", []):
                    print(f"    . Producto {item['id_producto']} x {item['cantidad']} "
                          f"@ ${item['precio_unitario']:,.2f}")
            else:
                print("\n  Pedido no encontrado.")
            _pausar()

        elif opcion == "2":
            id_c = _pedir("ID del cliente")
            docs = listar_pedidos_por_cliente(id_c)
            if not docs:
                print("  Sin pedidos.")
            for d in docs:
                print(f"\n  [{d.get('estado').upper():12s}] {d['_id']}  "
                      f"{d.get('fecha').strftime('%d/%m/%Y')}  "
                      f"${d.get('total', 0):,.0f}")
            _pausar()

        elif opcion == "3":
            print("  Estados: " + " | ".join(sorted(ESTADOS_PEDIDO_VALIDOS)))
            estado = _pedir("Estado")
            docs = listar_pedidos_por_estado(estado)
            if not docs:
                print("  Sin pedidos con ese estado.")
            for d in docs:
                print(f"  {d['_id']}  {d.get('fecha').strftime('%d/%m/%Y %H:%M')}"
                      f"  Cliente: {d.get('id_cliente')}")
            _pausar()

        elif opcion == "4":
            resultados = top_productos_vendidos(limite=10)
            if not resultados:
                print("  Sin datos.")
            _separador("TOP PRODUCTOS MAS VENDIDOS")
            for i, r in enumerate(resultados, 1):
                print(f"  {i:2d}. {r.get('nombre'):<35s} "
                      f"{r.get('total_vendido'):4d} uds  "
                      f"${r.get('ingresos', 0):>12,.2f}")
            _pausar()

        elif opcion == "5":
            _separador("CREAR PEDIDO")
            id_c  = _pedir("ID del cliente")
            items = []
            print("  Ingrese los items del pedido (deje id_producto vacio para terminar):")
            while True:
                id_prod = _pedir("  ID del producto", opcional=True)
                if not id_prod:
                    break
                cant    = _pedir("  Cantidad")
                precio  = _pedir("  Precio unitario")
                items.append({
                    "id_producto":     id_prod,
                    "cantidad":        cant,
                    "precio_unitario": precio,
                })
            if not items:
                print("\n  [!] El pedido necesita al menos un item.")
            else:
                dir_e = _pedir("Direccion de entrega", opcional=True)
                notas = _pedir("Notas", opcional=True)
                id_nuevo = insertar_pedido(id_c, items, dir_e, notas)
                if id_nuevo:
                    print(f"\n  [OK] Pedido creado con ID: {id_nuevo}")
            _pausar()

        elif opcion == "6":
            id_p = _pedir("ID del pedido")
            print("  Estados destino: " + " | ".join(sorted(ESTADOS_PEDIDO_VALIDOS)))
            nuevo_estado = _pedir("Nuevo estado")
            ok = cambiar_estado(id_p, nuevo_estado)
            print("\n  [OK] Estado actualizado." if ok else "\n  [ERROR] No se pudo actualizar.")
            _pausar()

        elif opcion == "7":
            id_p = _pedir("ID del pedido a cancelar")
            ok = cancelar_pedido(id_p)
            print("\n  [OK] Pedido cancelado." if ok else "\n  [ERROR] No se pudo cancelar.")
            _pausar()

        elif opcion == "0":
            break

# ─── MENÚ PRINCIPAL ───────────────────────────────────────────────────────────

def menu_principal(usuario: dict) -> None:
    # Menú principal del sistema, disponible tras el login exitoso
    nombre_usuario = f"{usuario.get('usuario', 'Operador')} [{usuario.get('rol', '').upper()}]"

    while True:
        _limpiar_pantalla()
        print(f"\n  COMERCIOTECH -- Sistema de Gestion")
        print(f"  Usuario: {nombre_usuario}")
        _separador()
        print("  1. Gestion de Clientes")
        print("  2. Gestion de Productos")
        print("  3. Gestion de Pedidos")
        _separador()
        print("  0. Cerrar sesion")
        _separador()

        opcion = _pedir("Opcion")

        if opcion == "1":
            _menu_clientes()
        elif opcion == "2":
            _menu_productos()
        elif opcion == "3":
            _menu_pedidos()
        elif opcion == "0":
            print(f"\n  Sesion cerrada. ¡Hasta pronto, {usuario.get('usuario')}!")
            break
        else:
            print("\n  [!] Opcion no valida.")
            _pausar()
