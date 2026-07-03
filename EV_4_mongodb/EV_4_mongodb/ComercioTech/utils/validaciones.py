"""
utils/validaciones.py — Funciones de validación de datos
=========================================================
Centraliza todas las reglas de negocio y validaciones de formato
para garantizar que solo se persistan documentos válidos en MongoDB.

Las validaciones se aplican ANTES de cualquier operación CRUD,
reduciendo errores de validación del JSON Schema de MongoDB y
proporcionando mensajes de error amigables al usuario final.

Referencia normativa: Sección 4.1.6 · Punto G.23
"""

import re
from typing import Any


# ─── CONSTANTES ──────────────────────────────────────────────────────────────
CATEGORIAS_VALIDAS: set[str] = {
    "Electrónica",
    "Ropa y Calzado",
    "Hogar y Jardín",
    "Deportes",
    "Alimentos",
    "Libros y Educación",
    "Herramientas",
    "Juguetes",
    "Salud y Belleza",
    "Otros",
}

ESTADOS_PEDIDO_VALIDOS: set[str] = {
    "pendiente",
    "procesando",
    "despachado",
    "entregado",
    "cancelado",
}

# Transiciones válidas de estado (máquina de estados)
TRANSICIONES_ESTADO: dict[str, set[str]] = {
    "pendiente":   {"procesando", "cancelado"},
    "procesando":  {"despachado", "cancelado"},
    "despachado":  {"entregado", "cancelado"},
    "entregado":   set(),       # Estado terminal — no hay transición posible
    "cancelado":   set(),       # Estado terminal
}

_PATRON_CORREO = re.compile(
    r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
)
_PATRON_TELEFONO = re.compile(r"^\+?[0-9\s\-]{7,20}$")


# ─── VALIDADORES DE CLIENTE ───────────────────────────────────────────────────

def validar_nombre(nombre: Any, campo: str = "nombre") -> str:
    """Valida y limpia un campo de nombre o apellido.

    Args:
        nombre: Valor a validar.
        campo: Nombre del campo para el mensaje de error.

    Returns:
        str: Nombre limpio (sin espacios sobrantes).

    Raises:
        ValueError: Si el nombre es inválido (vacío, tipo incorrecto o muy corto/largo).
    """
    if not isinstance(nombre, str):
        raise ValueError(f"El campo '{campo}' debe ser texto.")
    nombre = nombre.strip()
    if len(nombre) < 2:
        raise ValueError(f"El campo '{campo}' debe tener al menos 2 caracteres.")
    if len(nombre) > 100:
        raise ValueError(f"El campo '{campo}' no puede superar 100 caracteres.")
    return nombre


def validar_correo(correo: Any) -> str:
    """Valida que un correo electrónico tenga formato válido.

    Args:
        correo: Valor a validar.

    Returns:
        str: Correo en minúsculas y sin espacios.

    Raises:
        ValueError: Si el correo no tiene formato válido.
    """
    if not isinstance(correo, str):
        raise ValueError("El correo debe ser texto.")
    correo = correo.strip().lower()
    if not _PATRON_CORREO.match(correo):
        raise ValueError(
            f"El correo '{correo}' no tiene un formato válido.\n"
            "Ejemplo válido: usuario@dominio.cl"
        )
    return correo


def validar_telefono(telefono: Any) -> str:
    """Valida el formato de un número de teléfono.

    Args:
        telefono: Valor a validar (puede ser None para campo opcional).

    Returns:
        str: Teléfono limpio.

    Raises:
        ValueError: Si el teléfono tiene formato inválido.
    """
    if telefono is None or telefono == "":
        return ""
    if not isinstance(telefono, str):
        raise ValueError("El teléfono debe ser texto.")
    telefono = telefono.strip()
    if not _PATRON_TELEFONO.match(telefono):
        raise ValueError(
            f"El teléfono '{telefono}' no tiene formato válido.\n"
            "Formatos aceptados: +56912345678, 912345678, +1 800 555 0100"
        )
    return telefono


def validar_cliente(datos: dict) -> dict:
    """Valida un diccionario completo de datos de cliente.

    Aplica todas las validaciones de campo y retorna un diccionario
    limpio y normalizado listo para insertar/actualizar en MongoDB.

    Args:
        datos: Diccionario con campos del cliente.
                Campos obligatorios: nombre, apellido, correo.
                Campos opcionales: telefono.

    Returns:
        dict: Datos del cliente validados y normalizados.

    Raises:
        ValueError: Si algún campo requerido falta o es inválido.
    """
    errores = []

    resultado = {}
    for campo in ("nombre", "apellido"):
        try:
            resultado[campo] = validar_nombre(datos.get(campo), campo)
        except ValueError as e:
            errores.append(str(e))

    try:
        resultado["correo"] = validar_correo(datos.get("correo"))
    except ValueError as e:
        errores.append(str(e))

    try:
        tel = validar_telefono(datos.get("telefono", ""))
        if tel:
            resultado["telefono"] = tel
    except ValueError as e:
        errores.append(str(e))

    if errores:
        raise ValueError("Errores de validación:\n  · " + "\n  · ".join(errores))

    return resultado


# ─── VALIDADORES DE PRODUCTO ──────────────────────────────────────────────────

def validar_precio(precio: Any) -> float:
    """Valida que el precio sea un número positivo.

    Args:
        precio: Valor a validar.

    Returns:
        float: Precio validado.

    Raises:
        ValueError: Si el precio es inválido o no positivo.
    """
    try:
        precio_f = float(precio)
    except (TypeError, ValueError):
        raise ValueError("El precio debe ser un número (ej. 34990.0).")
    if precio_f <= 0:
        raise ValueError(f"El precio debe ser mayor a 0 (recibido: {precio_f}).")
    return round(precio_f, 2)


def validar_categoria(categoria: Any) -> str:
    """Valida que la categoría sea una de las permitidas.

    Args:
        categoria: Valor a validar.

    Returns:
        str: Categoría validada.

    Raises:
        ValueError: Si la categoría no está en la lista de permitidas.
    """
    if not isinstance(categoria, str) or not categoria.strip():
        raise ValueError("La categoría no puede estar vacía.")
    categoria = categoria.strip()
    if categoria not in CATEGORIAS_VALIDAS:
        cats = "\n  · ".join(sorted(CATEGORIAS_VALIDAS))
        raise ValueError(
            f"Categoría '{categoria}' no válida.\nCategorías disponibles:\n  · {cats}"
        )
    return categoria


def validar_stock(stock: Any) -> int:
    """Valida que el stock sea un entero no negativo.

    Args:
        stock: Valor a validar.

    Returns:
        int: Stock validado.

    Raises:
        ValueError: Si el stock es inválido.
    """
    try:
        stock_i = int(stock)
    except (TypeError, ValueError):
        raise ValueError("El stock debe ser un número entero (ej. 25).")
    if stock_i < 0:
        raise ValueError(f"El stock no puede ser negativo (recibido: {stock_i}).")
    return stock_i


def validar_producto(datos: dict) -> dict:
    """Valida un diccionario completo de datos de producto.

    Args:
        datos: Diccionario con campos del producto.
                Campos obligatorios: nombre, precio, categoria.
                Campos opcionales: descripcion, stock.

    Returns:
        dict: Datos del producto validados y normalizados.

    Raises:
        ValueError: Si algún campo requerido falta o es inválido.
    """
    errores = []
    resultado = {}

    nombre = datos.get("nombre", "").strip()
    if len(nombre) < 2:
        errores.append("El nombre del producto debe tener al menos 2 caracteres.")
    else:
        resultado["nombre"] = nombre

    try:
        resultado["precio"] = validar_precio(datos.get("precio"))
    except ValueError as e:
        errores.append(str(e))

    try:
        resultado["categoria"] = validar_categoria(datos.get("categoria"))
    except ValueError as e:
        errores.append(str(e))

    desc = datos.get("descripcion", "").strip()
    if desc:
        if len(desc) > 2000:
            errores.append("La descripción no puede superar 2000 caracteres.")
        else:
            resultado["descripcion"] = desc

    stock = datos.get("stock")
    if stock is not None and stock != "":
        try:
            resultado["stock"] = validar_stock(stock)
        except ValueError as e:
            errores.append(str(e))

    if errores:
        raise ValueError("Errores de validación:\n  · " + "\n  · ".join(errores))

    return resultado


# ─── VALIDADORES DE PEDIDO ────────────────────────────────────────────────────

def validar_cantidad(cantidad: Any) -> int:
    """Valida que la cantidad de un ítem de pedido sea un entero positivo.

    Args:
        cantidad: Valor a validar.

    Returns:
        int: Cantidad validada.

    Raises:
        ValueError: Si la cantidad es inválida.
    """
    try:
        cantidad_i = int(cantidad)
    except (TypeError, ValueError):
        raise ValueError("La cantidad debe ser un número entero (ej. 2).")
    if cantidad_i < 1:
        raise ValueError(f"La cantidad debe ser al menos 1 (recibido: {cantidad_i}).")
    return cantidad_i


def validar_detalle_item(item: dict) -> dict:
    """Valida un ítem individual del array detalle[] de un pedido.

    Args:
        item: Diccionario con id_producto, cantidad y precio_unitario.

    Returns:
        dict: Ítem validado y normalizado.

    Raises:
        ValueError: Si el ítem tiene campos inválidos.
    """
    errores = []
    resultado = {}

    id_prod = item.get("id_producto")
    if not id_prod:
        errores.append("Cada ítem de detalle debe tener 'id_producto'.")
    else:
        resultado["id_producto"] = id_prod

    try:
        resultado["cantidad"] = validar_cantidad(item.get("cantidad"))
    except ValueError as e:
        errores.append(str(e))

    try:
        resultado["precio_unitario"] = validar_precio(item.get("precio_unitario"))
    except ValueError as e:
        errores.append(str(e))

    if errores:
        raise ValueError("\n  · ".join(errores))

    return resultado


def validar_transicion_estado(estado_actual: str, nuevo_estado: str) -> None:
    """Valida que una transición de estado de pedido sea permitida.

    Aplica la máquina de estados definida en TRANSICIONES_ESTADO.

    Args:
        estado_actual: Estado actual del pedido.
        nuevo_estado: Estado al que se quiere cambiar.

    Raises:
        ValueError: Si la transición no es válida según las reglas de negocio.
    """
    if nuevo_estado not in ESTADOS_PEDIDO_VALIDOS:
        raise ValueError(
            f"Estado '{nuevo_estado}' no válido.\n"
            f"Estados permitidos: {', '.join(sorted(ESTADOS_PEDIDO_VALIDOS))}"
        )
    transiciones_posibles = TRANSICIONES_ESTADO.get(estado_actual, set())
    if not transiciones_posibles:
        raise ValueError(
            f"El pedido ya está en estado terminal '{estado_actual}'.\n"
            "No se permiten más cambios de estado."
        )
    if nuevo_estado not in transiciones_posibles:
        raise ValueError(
            f"No se puede cambiar de '{estado_actual}' a '{nuevo_estado}'.\n"
            f"Transiciones válidas desde '{estado_actual}': "
            f"{', '.join(sorted(transiciones_posibles))}"
        )
