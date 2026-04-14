import sys
import os

# Añadir el directorio actual al path para encontrar la carpeta 'app'
sys.path.insert(0, os.path.dirname(__file__))

# Importar tu aplicación FastAPI desde app.main
from app.main import app
from a2wsgi import ASGIMiddleware
from app.db.database import init_db

# Inicializar la base de datos automáticamente al arrancar
# Esto sustituye al comando 'python init_db.py' si no hay terminal
try:
    init_db()
    print("Base de datos inicializada correctamente")
except Exception as e:
    print(f"Error al inicializar base de datos: {e}")

# Convertir ASGI a WSGI para Passenger de Hostinger
application = ASGIMiddleware(app)
