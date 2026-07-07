"""
Módulo de conexión a MongoDB Atlas.

JUSTIFICACIÓN (4.1.6.G.21):
Se utiliza Python con el driver oficial `pymongo` debido a:
1. Compatibilidad total con MongoDB Atlas.
2. Soporte nativo para conexiones SRV (`mongodb+srv://`) y encriptación TLS en tránsito obligatoria.
3. Rendimiento optimizado y soporte para connection pooling.
4. Alta mantenibilidad y ecosistema rico para operaciones de bases de datos NoSQL.
"""

import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

def get_database():
    """
    Establece y retorna la conexión a la base de datos 'comerciotech' en MongoDB Atlas.
    
    (4.1.6.G.22): La conexión se realiza utilizando la URI proporcionada
    vía variables de entorno (MONGO_URI), lo que evita credenciales hardcodeadas,
    soporta reintentos de conexión, pool de conexiones automático y es portátil.
    
    Returns:
        Database: Instancia de la base de datos 'comerciotech' conectada.
        
    Raises:
        SystemExit: Termina la ejecución si no se define la variable o la conexión falla.
        
    Ejemplo de uso:
        db = get_database()
        clientes = db.clientes.find()
    """
    mongo_uri = os.getenv("MONGO_URI")
    
    if not mongo_uri:
        print("ERROR: La variable de entorno MONGO_URI no está definida. Revise su archivo .env")
        sys.exit(1)
        
    try:
        # Se establece la conexión con la URI segura
        # El connection pool es manejado automáticamente por pymongo
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Validar la conexión (ping)
        client.admin.command('ping')
        
        return client.comerciotech
    except ConnectionFailure as e:
        print(f"Error de conexión a MongoDB Atlas: {e}")
        sys.exit(1)
    except ConfigurationError as e:
        print(f"Error de configuración (posible error en formato SRV): {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error inesperado al conectar: {e}")
        sys.exit(1)
