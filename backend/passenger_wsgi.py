import sys
import os

# Añadir el directorio actual al path para encontrar la carpeta 'app'
sys.path.insert(0, os.path.dirname(__file__))

# Importar tu aplicación FastAPI desde app.main
from app.main import app
from a2wsgi import ASGIMiddleware

# Convertir ASGI a WSGI para Passenger de Hostinger
application = ASGIMiddleware(app)
