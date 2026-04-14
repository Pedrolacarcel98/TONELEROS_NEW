# Toneleros App - Backend API

API Python desarrollada con FastAPI. Proporciona endpoints REST para autenticación, gestión de eventos, finanzas y documentos.

## Estructura

```
backend/
├── app/
│   ├── core/          # Configuración, seguridad, constantes
│   ├── models/        # Modelos SQLAlchemy
│   ├── schemas/       # Schemas Pydantic (validación)
│   ├── routes/        # Endpoints API
│   ├── db/            # Configuración de base de datos
│   └── main.py        # Punto de entrada
├── requirements.txt   # Dependencias Python
├── Dockerfile
└── init_db.py         # Script para inicializar BD y usuarios de prueba
```

## Características MVP

- ✓ Autenticación con JWT
- ✓ Usuarios de prueba precargados
- ✓ Base de datos SQLite
- ✓ CORS habilitado para frontend local
- ✓ Documentación automática en `/docs`

## Endpoints API

### Autenticación
- `POST /api/auth/login` - Login con email/contraseña
- `GET /api/auth/me` - Obtener usuario actual
- `GET /api/health` - Health check

## Usuarios de Prueba

- Email: `pedro@toneleros.com` | Contraseña: `Pedro123?`
- Email: `admin@toneleros.com` | Contraseña: `Admin123?`
