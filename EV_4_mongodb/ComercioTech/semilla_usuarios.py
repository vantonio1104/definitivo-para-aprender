import bcrypt
from config.conexion import get_database

def crear_usuarios_semilla():
    db = get_database()
    col = db.usuarios
    
    # Limpiar usuarios anteriores (opcional, para ambiente de pruebas)
    col.delete_many({})
    
    # Crear hash de la contraseña 'Holitas123' o la que indique el usuario
    password_texto = "Holitas123"
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_texto.encode('utf-8'), salt)
    
    usuario_admin = {
        "usuario": "admin_ct",
        "password_hash": hashed.decode('utf-8'),
        "rol": "admin",
        "activo": True
    }
    
    col.insert_one(usuario_admin)
    print("Usuario administrador creado exitosamente. (admin_ct / Holitas123)")

if __name__ == "__main__":
    crear_usuarios_semilla()
