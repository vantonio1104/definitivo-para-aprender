# Funciones de validación de datos para ComercioTech
import re
from typing import Any

CATEGORIAS_VALIDAS: set[str] = {
    "Electrónica", "Ropa y Calzado", "Hogar y Jardín", "Deportes", "Alimentos",
    "Libros y Educación", "Herramientas", "Juguetes", "Salud y Belleza", "Otros"
}

ESTADOS_PEDIDO_VALIDOS: set[str] = {
    "pendiente", "procesando", "despachado", "entregado", "cancelado"
}

TRANSICIONES_ESTADO: dict[str, set[str]] = {
    "pendiente":   {"procesando", "cancelado"},
    "procesando":  {"despachado", "cancelado"},
    "despachado":  {"entregado", "cancelado"},
    "entregado":   set(),
    "cancelado":   set(),
}

_PATRON_CORREO = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
_PATRON_TELEFONO = re.compile(r"^\+?[0-9\s\-]{7,20}$")

def validar_nombre(nombre: Any, campo: str = "nombre") -> str:
    # Valida y limpia nombre o apellido (entre 2 y 100 caracteres)
    if not isinstance(nombre, str):
        raise ValueError(f"El campo '{campo}' debe ser texto.")
    nombre = nombre.strip()
    if len(nombre) < 2:
        raise ValueError(f"El campo '{campo}' debe tener al menos 2 caracteres.")
    if len(nombre) > 100:
        raise ValueError(f"El campo '{campo}' no puede superar 100 caracteres.")
    return nombre

def validar_correo(correo: Any) -> str:
    # Valida formato de correo electrónico
    if not isinstance(correo, str):
        raise ValueError("El correo debe ser texto.")
    correo = correo.strip().lower()
    if not _PATRON_CORREO.match(correo):
        raise ValueError(f"El correo '{correo}' no tiene un formato válido.")
    return correo

def validar_telefono(telefono: Any) -> str:
    # Valida formato de número telefónico (opcional)
    if telefono is None or telefono == "":
        return ""
    if not isinstance(telefono, str):
        raise ValueError("El teléfono debe ser texto.")
    telefono = telefono.strip()
    if not _PATRON_TELEFONO.match(telefono):
        raise ValueError(f"El teléfono '{telefono}' no tiene formato válido.")
    return telefono

def validar_cliente(datos: dict) -> dict:
    # Valida todos los datos de un cliente
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

def validar_precio(precio: Any) -> float:
    # Valida que el precio sea numérico y mayor que cero
    try:
        precio_f = float(precio)
    except (TypeError, ValueError):
        raise ValueError("El precio debe ser un número.")
    if precio_f <= 0:
        raise ValueError(f"El precio debe ser mayor a 0 (recibido: {precio_f}).")
    return round(precio_f, 2)

def validar_categoria(categoria: Any) -> str:
    # Valida que la categoría esté permitida en el catálogo
    if not isinstance(categoria, str) or not categoria.strip():
        raise ValueError("La categoría no puede estar vacía.")
    categoria = categoria.strip()
    if categoria not in CATEGORIAS_VALIDAS:
        cats = ", ".join(sorted(CATEGORIAS_VALIDAS))
        raise ValueError(f"Categoría '{categoria}' no válida. Permitidas: {cats}")
    return categoria

def validar_stock(stock: Any) -> int:
    # Valida que el stock sea un entero no negativo
    try:
        stock_i = int(stock)
    except (TypeError, ValueError):
        raise ValueError("El stock debe ser un entero.")
    if stock_i < 0:
        raise ValueError(f"El stock no puede ser negativo.")
    return stock_i

def validar_producto(datos: dict) -> dict:
    # Valida todos los datos de un producto
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

def validar_cantidad(cantidad: Any) -> int:
    # Valida que la cantidad de un ítem de pedido sea un entero positivo
    try:
        cantidad_i = int(cantidad)
    except (TypeError, ValueError):
        raise ValueError("La cantidad debe ser un número entero.")
    if cantidad_i < 1:
        raise ValueError(f"La cantidad debe ser al menos 1.")
    return cantidad_i

def validar_detalle_item(item: dict) -> dict:
    # Valida campos individuales del detalle de un pedido
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
    # Valida que la transición de estado del pedido esté permitida
    if nuevo_estado not in ESTADOS_PEDIDO_VALIDOS:
        raise ValueError(f"Estado '{nuevo_estado}' no válido.")
    transiciones_posibles = TRANSICIONES_ESTADO.get(estado_actual, set())
    if not transiciones_posibles:
        raise ValueError(f"El pedido está en estado terminal '{estado_actual}'.")
    if nuevo_estado not in transiciones_posibles:
        raise ValueError(f"No se permite cambiar de '{estado_actual}' a '{nuevo_estado}'.")
