"""
crud/crud_clientes.py — Operaciones CRUD para la colección 'clientes'
======================================================================
Implementa las cuatro operaciones fundamentales de base de datos
(Create, Read, Update, Delete) para la entidad Cliente.

Todas las operaciones validan los datos de entrada usando
utils/validaciones.py antes de interactuar con MongoDB, y capturan
excepciones específicas de PyMongo para proporcionar mensajes claros.

Referencia normativa: Sección 4.1.6 · Punto G.23
"""

import logging
from typing import Optional

# pyrefly: ignore [missing-import]
from bson import ObjectId
# pyrefly: ignore [missing-import]
from bson.errors import InvalidId
# pyrefly: ignore [missing-import]
from pymongo.errors import DuplicateKeyError, PyMongoError

from config.conexion import get_db
from models.cliente import nuevo_cliente
from utils.validaciones import validar_cliente

logger = logging.getLogger(__name__)


# ─── CREATE ──────────────────────────────────────────────────────────────────

def insertar_cliente(datos: dict) -> Optional[str]:
    """Inserta un nuevo cliente en la colección 'clientes'.

    Valida los datos antes de insertar y captura errores de clave duplicada
    (correo ya registrado).

    Args:
        datos: Diccionario con los campos del cliente.
               Requeridos: nombre, apellido, correo.
               Opcionales: telefono.

    Returns:
        str | None: ID del documento insertado como string hexadecimal,
                    o None si ocurrió un error.
    """
    try:
        campos = validar_cliente(datos)
        doc = nuevo_cliente(**campos)
        resultado = get_db().clientes.insert_one(doc)
        id_str = str(resultado.inserted_id)
        logger.info("Cliente insertado: %s (%s)", campos["correo"], id_str)
        return id_str

    except ValueError as e:
        print(f"\n  ⚠️  Datos inválidos:\n{e}")
        return None

    except DuplicateKeyError:
        print(f"\n  ⚠️  El correo '{datos.get('correo')}' ya está registrado.")
        return None

    except PyMongoError as e:
        logger.error("Error al insertar cliente: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return None


# ─── READ ─────────────────────────────────────────────────────────────────────

def buscar_por_id(id_cliente: str) -> Optional[dict]:
    """Busca un cliente por su ObjectId.

    Args:
        id_cliente: ID del cliente como string hexadecimal de 24 caracteres.

    Returns:
        dict | None: Documento del cliente o None si no existe.
    """
    try:
        oid = ObjectId(id_cliente)
        doc = get_db().clientes.find_one({"_id": oid})
        return doc
    except InvalidId:
        print(f"\n  ⚠️  ID inválido: '{id_cliente}'. Debe ser un ID de 24 caracteres.")
        return None
    except PyMongoError as e:
        logger.error("Error al buscar cliente por ID: %s", e)
        return None


def buscar_por_correo(correo: str) -> Optional[dict]:
    """Busca un cliente por correo electrónico (usa el índice único).

    Args:
        correo: Correo electrónico del cliente.

    Returns:
        dict | None: Documento del cliente o None si no existe.
    """
    try:
        return get_db().clientes.find_one({"correo": correo.strip().lower()})
    except PyMongoError as e:
        logger.error("Error al buscar cliente por correo: %s", e)
        return None


def listar_clientes(solo_activos: bool = True, limite: int = 20) -> list[dict]:
    """Lista clientes ordenados por apellido.

    Args:
        solo_activos: Si True, retorna solo clientes con activo=True (default: True).
        limite:       Máximo de documentos a retornar (default: 20).

    Returns:
        list[dict]: Lista de documentos de clientes.
    """
    try:
        filtro = {"activo": True} if solo_activos else {}
        cursor = (
            get_db()
            .clientes.find(filtro)
            .sort([("apellido", 1), ("nombre", 1)])
            .limit(limite)
        )
        return list(cursor)
    except PyMongoError as e:
        logger.error("Error al listar clientes: %s", e)
        return []


def buscar_por_nombre(texto: str) -> list[dict]:
    """Busca clientes cuyo nombre o apellido contenga el texto dado.

    Usa una expresión regular insensible a mayúsculas/minúsculas.

    Args:
        texto: Texto a buscar en nombre o apellido.

    Returns:
        list[dict]: Lista de documentos que coinciden.
    """
    if not texto or not texto.strip():
        return []
    try:
        patron = {"$regex": texto.strip(), "$options": "i"}
        filtro = {"$or": [{"nombre": patron}, {"apellido": patron}]}
        return list(get_db().clientes.find(filtro).sort("apellido", 1).limit(20))
    except PyMongoError as e:
        logger.error("Error en búsqueda por nombre: %s", e)
        return []


# ─── UPDATE ───────────────────────────────────────────────────────────────────

def actualizar_cliente(id_cliente: str, campos_nuevos: dict) -> bool:
    """Actualiza campos específicos de un cliente.

    Solo actualiza los campos provistos en campos_nuevos; no sobreescribe
    el documento completo. Valida los campos antes de actualizar.

    Args:
        id_cliente:   ID del cliente a actualizar.
        campos_nuevos: Diccionario con los campos y valores a modificar.

    Returns:
        bool: True si se modificó al menos un documento, False si no.
    """
    try:
        oid = ObjectId(id_cliente)
    except InvalidId:
        print(f"\n  ⚠️  ID inválido: '{id_cliente}'.")
        return False

    # Validar solo los campos presentes
    datos_validados = {}
    errores = []

    from utils.validaciones import (
        validar_nombre, validar_correo, validar_telefono
    )

    for campo, valor in campos_nuevos.items():
        try:
            if campo in ("nombre", "apellido"):
                datos_validados[campo] = validar_nombre(valor, campo)
            elif campo == "correo":
                datos_validados[campo] = validar_correo(valor)
            elif campo == "telefono":
                tel = validar_telefono(valor)
                if tel:
                    datos_validados[campo] = tel
            elif campo == "activo" and isinstance(valor, bool):
                datos_validados[campo] = valor
        except ValueError as e:
            errores.append(str(e))

    if errores:
        print("  ⚠️  Errores de validación:\n  · " + "\n  · ".join(errores))
        return False

    if not datos_validados:
        print("  ⚠️  No hay campos válidos para actualizar.")
        return False

    try:
        resultado = get_db().clientes.update_one(
            {"_id": oid},
            {"$set": datos_validados},
        )
        if resultado.matched_count == 0:
            print(f"\n  ⚠️  No se encontró ningún cliente con ID '{id_cliente}'.")
            return False
        logger.info("Cliente actualizado: %s → %s", id_cliente, list(datos_validados.keys()))
        return True

    except DuplicateKeyError:
        print(f"\n  ⚠️  El correo '{campos_nuevos.get('correo')}' ya está en uso.")
        return False
    except PyMongoError as e:
        logger.error("Error al actualizar cliente: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return False


# ─── DELETE (eliminación lógica) ──────────────────────────────────────────────

def desactivar_cliente(id_cliente: str) -> bool:
    """Desactiva un cliente (eliminación lógica — no borra el documento).

    Establece activo=False en lugar de eliminar el documento para preservar
    el historial de pedidos y cumplir con las obligaciones de auditoría.

    Args:
        id_cliente: ID del cliente a desactivar.

    Returns:
        bool: True si el cliente fue desactivado correctamente.
    """
    return actualizar_cliente(id_cliente, {"activo": False})


def eliminar_cliente(id_cliente: str, confirmar: bool = False) -> bool:
    """Elimina permanentemente un cliente de la base de datos.

    ⚠️ ADVERTENCIA: Esta operación es irreversible. Usar solo si se requiere
    cumplimiento del 'derecho al olvido' (Ley 21.719).
    Para desactivar sin borrar, usar desactivar_cliente().

    Args:
        id_cliente: ID del cliente a eliminar.
        confirmar:  Debe ser True para ejecutar (protección contra accidentes).

    Returns:
        bool: True si el cliente fue eliminado.
    """
    if not confirmar:
        print("\n  ⚠️  Pasar confirmar=True para ejecutar la eliminación permanente.")
        return False
    try:
        oid = ObjectId(id_cliente)
        resultado = get_db().clientes.delete_one({"_id": oid})
        if resultado.deleted_count == 0:
            print(f"\n  ⚠️  No se encontró cliente con ID '{id_cliente}'.")
            return False
        logger.info("Cliente eliminado permanentemente: %s", id_cliente)
        return True
    except InvalidId:
        print(f"\n  ⚠️  ID inválido: '{id_cliente}'.")
        return False
    except PyMongoError as e:
        logger.error("Error al eliminar cliente: %s", e)
        print(f"\n  ❌ Error de base de datos: {e}")
        return False
