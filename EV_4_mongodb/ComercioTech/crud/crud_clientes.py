# Operaciones CRUD para la colección 'clientes'
import logging
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError, PyMongoError
from config.conexion import get_db
from models.cliente import nuevo_cliente
from utils.validaciones import validar_cliente

logger = logging.getLogger(__name__)

def insertar_cliente(datos: dict) -> Optional[str]:
    # Valida y guarda un cliente en la base de datos
    try:
        campos = validar_cliente(datos)
        doc = nuevo_cliente(**campos)
        resultado = get_db().clientes.insert_one(doc)
        id_str = str(resultado.inserted_id)
        logger.info("Cliente insertado: %s (%s)", campos["correo"], id_str)
        return id_str
    except ValueError as e:
        print(f"\n  [!] Datos invalidos:\n{e}")
        return None
    except DuplicateKeyError:
        print(f"\n  [!] El correo '{datos.get('correo')}' ya esta registrado.")
        return None
    except PyMongoError as e:
        logger.error("Error al insertar cliente: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return None

def buscar_por_id(id_cliente: str) -> Optional[dict]:
    # Busca cliente por su ObjectId
    try:
        return get_db().clientes.find_one({"_id": ObjectId(id_cliente)})
    except InvalidId:
        print(f"\n  [!] ID invalido: '{id_cliente}'.")
        return None
    except PyMongoError as e:
        logger.error("Error al buscar cliente por ID: %s", e)
        return None

def buscar_por_correo(correo: str) -> Optional[dict]:
    # Busca cliente por dirección de correo
    try:
        return get_db().clientes.find_one({"correo": correo.strip().lower()})
    except PyMongoError as e:
        logger.error("Error al buscar cliente por correo: %s", e)
        return None

def listar_clientes(solo_activos: bool = True, limite: int = 20) -> list[dict]:
    # Lista clientes ordenados por apellido
    try:
        filtro = {"activo": True} if solo_activos else {}
        cursor = get_db().clientes.find(filtro).sort([("apellido", 1), ("nombre", 1)]).limit(limite)
        return list(cursor)
    except PyMongoError as e:
        logger.error("Error al listar clientes: %s", e)
        return []

def buscar_por_nombre(texto: str) -> list[dict]:
    # Busca clientes coincidiendo con nombre o apellido
    if not texto or not texto.strip():
        return []
    try:
        patron = {"$regex": texto.strip(), "$options": "i"}
        filtro = {"$or": [{"nombre": patron}, {"apellido": patron}]}
        return list(get_db().clientes.find(filtro).sort("apellido", 1).limit(20))
    except PyMongoError as e:
        logger.error("Error en búsqueda por nombre: %s", e)
        return []

def actualizar_cliente(id_cliente: str, campos_nuevos: dict) -> bool:
    # Actualiza los campos especificados de un cliente
    try:
        oid = ObjectId(id_cliente)
    except InvalidId:
        print(f"\n  [!] ID invalido: '{id_cliente}'.")
        return False

    datos_validados = {}
    errores = []
    from utils.validaciones import validar_nombre, validar_correo, validar_telefono

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
        print("  [!] Errores de validacion:\n  - " + "\n  - ".join(errores))
        return False

    if not datos_validados:
        print("  [!] No hay campos validos para actualizar.")
        return False

    try:
        resultado = get_db().clientes.update_one({"_id": oid}, {"$set": datos_validados})
        if resultado.matched_count == 0:
            print(f"\n  [!] No se encontro ningun cliente con ID '{id_cliente}'.")
            return False
        logger.info("Cliente actualizado: %s → %s", id_cliente, list(datos_validados.keys()))
        return True
    except DuplicateKeyError:
        print(f"\n  [!] El correo '{campos_nuevos.get('correo')}' ya esta en uso.")
        return False
    except PyMongoError as e:
        logger.error("Error al actualizar cliente: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return False

def desactivar_cliente(id_cliente: str) -> bool:
    # Desactiva un cliente mediante eliminación lógica
    return actualizar_cliente(id_cliente, {"activo": False})

def eliminar_cliente(id_cliente: str, confirmar: bool = False) -> bool:
    # Elimina permanentemente el documento del cliente
    if not confirmar:
        print("\n  [!] Confirmar=True requerido para eliminacion fisica.")
        return False
    try:
        resultado = get_db().clientes.delete_one({"_id": ObjectId(id_cliente)})
        if resultado.deleted_count == 0:
            print(f"\n  [!] No se encontro cliente con ID '{id_cliente}'.")
            return False
        logger.info("Cliente eliminado permanentemente: %s", id_cliente)
        return True
    except InvalidId:
        print(f"\n  [!] ID invalido: '{id_cliente}'.")
        return False
    except PyMongoError as e:
        logger.error("Error al eliminar cliente: %s", e)
        print(f"\n  [ERROR] Error de base de datos: {e}")
        return False
