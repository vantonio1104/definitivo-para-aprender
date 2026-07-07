# Proyecto ComercioTech - MongoDB Atlas

Este proyecto es la implementación en Python del backend para ComercioTech utilizando MongoDB Atlas.

## Requisitos Previos
- Python 3.8+

## Instalación
1. Clonar este repositorio.
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Configurar conexión a Atlas:
   - El archivo `.env` ya está incluido en el directorio y configurado con el Connection String SRV de MongoDB Atlas.

## Estructura
- `main.py`: Punto de entrada.
- `menu.py`: Interfaz de consola.
- `login.py`: Autenticación con bcrypt.
- `config/`: Conexión segura a Atlas.
- `models/`: Clases de datos.
- `crud/`: Operaciones CRUD.
- `services/`: Pipelines de agregación (Fase 4).
- `utils/`: Validaciones estandarizadas.

## Ejecución
```bash
python main.py
```
