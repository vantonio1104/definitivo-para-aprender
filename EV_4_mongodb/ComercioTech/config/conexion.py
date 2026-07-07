"""Módulo de conexión a MongoDB para ComercioTech."""

import os
import time
import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError, OperationFailure
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

# Cargar variables de entorno del archivo .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

_client: Optional[MongoClient] = None

def get_client(max_reintentos: int = 3, espera_seg: float = 2.0) -> MongoClient:
    """Obtiene o inicializa el cliente singleton de MongoDB."""
    global _client
    if _client is not None:
        return _client

    uri = os.getenv("MONGO_URI")
    if not uri:
        raise ConfigurationError("Falta la variable MONGO_URI en el archivo .env")

    max_pool = int(os.getenv("MONGO_MAX_POOL_SIZE", "10"))
    min_pool = int(os.getenv("MONGO_MIN_POOL_SIZE", "2"))
    connect_timeout = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "3000"))
    server_timeout = int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "10000"))

    for intento in range(1, max_reintentos + 1):
        try:
            logger.info("Conectando a MongoDB (intento %d/%d)...", intento, max_reintentos)
            cliente = MongoClient(
                uri,
                maxPoolSize=max_pool,
                minPoolSize=min_pool,
                connectTimeoutMS=connect_timeout,
                serverSelectionTimeoutMS=server_timeout,
            )
            cliente.admin.command("ping")
            _client = cliente
            logger.info("[OK] Conexión establecida correctamente.")
            return _client
        except ServerSelectionTimeoutError:
            logger.warning("MongoDB no responde. Reintentando...")
            if intento < max_reintentos:
                time.sleep(espera_seg * intento)
        except OperationFailure as e:
            logger.error("[ERROR] Error de autenticación: %s", e)
            raise

    raise ConnectionFailure(f"No se pudo conectar a MongoDB tras {max_reintentos} intentos.")

def get_db() -> Database:
    """Retorna la base de datos de ComercioTech."""
    return get_client()[os.getenv("MONGO_DB", "comerciotech")]

def cerrar_conexion() -> None:
    """Cierra la conexión activa con MongoDB."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("Conexión a MongoDB cerrada.")
