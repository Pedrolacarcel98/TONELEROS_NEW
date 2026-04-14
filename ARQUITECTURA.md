# 🏗️ ARQUITECTURA MVP TONELEROS

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    NAVEGADOR DEL USUARIO                        │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP/WebSocket (Puerto 3000)
                     ▼
        ┌────────────────────────────┐
        │   FRONTEND - REACT + VITE   │
        │   (node:18-alpine)          │
        ├────────────────────────────┤
        │ src/                        │
        │ ├── pages/                  │
        │ │   ├── LoginPage          │
        │ │   └── Dashboard          │
        │ ├── components/             │
        │ │   ├── LoginForm          │
        │ │   └── Header             │
        │ ├── context/AuthContext    │
        │ ├── services/              │
        │ │   ├── apiClient.js       │
        │ │   └── authService.js     │
        │ └── hooks/useAuth.js       │
        └────────────────────────────┘
                     │
                     │ API REST (JSON) - Puerto 8000
                     │ • POST /api/auth/login
                     │ • GET /api/auth/me
                     │ • GET /api/health
                     ▼
        ┌────────────────────────────┐
        │   BACKEND - FastAPI         │
        │   (python:3.11-slim)        │
        ├────────────────────────────┤
        │ app/                        │
        │ ├── main.py                │
        │ ├── core/                   │
        │ │   ├── config.py          │
        │ │   ├── security.py (JWT)  │
        │ │   └── constants.py       │
        │ ├── models/                 │
        │ │   ├── user.py            │
        │ │   └── event.py           │
        │ ├── schemas/                │
        │ │   ├── user_schema.py     │
        │ │   └── event_schema.py    │
        │ ├── routes/                 │
        │ │   └── auth.py            │
        │ └── db/                     │
        │     └── database.py (ORM)  │
        └────────────────────────────┘
                     │
                     │ SQLAlchemy ORM
                     ▼
        ┌────────────────────────────┐
        │      BASE DE DATOS          │
        │    SQLite (toneleros.db)    │
        ├────────────────────────────┤
        │ Tablas:                     │
        │ ├── usuarios (id, email)   │
        │ └── agenda (eventos)       │
        └────────────────────────────┘
```

## Flujo de Autenticación

```
╔════════════════════════════════════════════════════════════════╗
║                    FLUJO DE LOGIN                              ║
╚════════════════════════════════════════════════════════════════╝

1. Usuario escribe credenciales en LoginForm
   └─> email: pedro@toneleros.com
   └─> password: Pedro123?

2. Frontend envía POST /api/auth/login (JSON)
   └─> Request: { email, password }

3. Backend valida credenciales
   ├─> Busca usuario en BD (usuarios table)
   ├─> Verifica: password vs hash almacenado (bcrypt)
   └─> Si OK: genera JWT token

4. Backend responde con (TokenResponse)
   └─> {
         "access_token": "eyJ...",
         "token_type": "bearer",
         "user": { "id": 1, "email": "pedro@toneleros.com" }
       }

5. Frontend almacena datos en localStorage
   ├─> localStorage.setItem('access_token', token)
   └─> localStorage.setItem('user', userObject)

6. Usuario redirigido al Dashboard
   └─> Header muestra: "pedro@toneleros.com" + botón logout

7. Para futuras requests:
   ├─> Axios interceptor añade header
   └─> Authorization: Bearer <token>
```

## Componentes Principales

```
LoginForm (src/components/auth/LoginForm.jsx)
├─ Estado local: email, password
├─ Hook useAuth() para login()
├─ Formulario con validación básica
└─ Muestra errores de autenticación

Header (src/components/common/Header.jsx)
├─ Hook useAuth() para user data
├─ Muestra email del usuario
└─ Botón logout

Dashboard (src/pages/Dashboard.jsx)
├─ Renderiza Header
├─ Grid de tarjetas (Events, Finances, Docs, Media)
└─ Info del MVP y estado funcionalidades

AuthContext (src/context/AuthContext.jsx)
├─ Estado global: user, isAuthenticated, loading, error
├─ Métodos: login(), logout()
└─ Provee contexto a toda la app

useAuth Hook (src/hooks/useAuth.js)
└─ Acceso simplificado al AuthContext
```

## Stack Tecnológico

```
┌─ FRONTEND
│  ├─ React 18.2.0
│  ├─ Vite 5.0+
│  ├─ Axios 1.6+
│  └─ CSS Modules (0 dependencias externas)
│
├─ BACKEND
│  ├─ FastAPI 0.104+
│  ├─ Uvicorn 0.24+
│  ├─ SQLAlchemy 2.0+
│  ├─ Pydantic 2.5+
│  ├─ python-jose (JWT)
│  ├─ passlib + bcrypt (hashing)
│  └─ python-multipart
│
├─ BASE DE DATOS
│  └─ SQLite 3 (archivo único)
│
└─ INFRAESTRUCTURA
   ├─ Docker CE
   ├─ docker-compose
   └─ Node.js 18+
```

## Inicialización de la Base de Datos

```
1. docker-compose up --build
   ↓
2. Backend Dockerfile ejecuta: python init_db.py
   ├─ Crea tablas (usuarios, agenda)
   ├─ Crea usuarios prueba:
   │  ├─ pedro@toneleros.com → hash(Pedro123?)
   │  └─ admin@toneleros.com → hash(Admin123?)
   └─ Genera archivo: backend/toneleros.db
   ↓
3. API lista con JWT token support
   ↓
4. Frontend puede hacer login
```

## Flujo de Desarrollo Local

```
Cambios en código → Hot Reload automático

Frontend:
  src/* → Vite HMR → Abrir http://localhost:3000

Backend:
  app/* → Uvicorn --reload → Swagger en http://localhost:8000/docs
```

## Despliegue Diagram

```
┌────────────────────────────────────────────┐
│  docker-compose up -d --build              │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────┐  ┌────────────────┐ │
│  │ Network: bridge  │  │ Volumes:       │ │
│  │                  │  │ - BD (backend) │ │
│  │ frontend:3000    │  │ - Code (mount) │ │
│  │ backend:8000     │  │                │ │
│  └──────────────────┘  └────────────────┘ │
│                                            │
│  ✓ CORS habilitado                         │
│  ✓ Env variables por defecto              │
│  ✓ BD creada automáticamente              │
│  ✓ Usuarios prueba precargados           │
│                                            │
└────────────────────────────────────────────┘
```

## URL Endpoints Disponibles

```
Frontend:
  http://localhost:3000          → App principal
  
Backend:
  http://localhost:8000          → Root API
  http://localhost:8000/docs     → Swagger UI interactiva
  http://localhost:8000/redoc    → ReDoc
  
API Endpoints:
  POST   /api/auth/login         → Login (credenciales)
  GET    /api/auth/me            → Usuario actual
  GET    /api/health             → Health check
```

## Archivos Configuración Importante

```
docker-compose.yml
├─ services.backend:
│  ├─ image: python:3.11-slim
│  ├─ ports: 8000
│  ├─ environment: DATABASE_URL, SECRET_KEY
│  └─ volumes: ./backend:/app
│
└─ services.frontend:
   ├─ image: node:18-alpine
   ├─ ports: 3000
   ├─ depends_on: backend
   └─ volumes: ./frontend/src:/app/src

backend/.env (crear desde .env.example)
├─ DATABASE_URL=sqlite:///./toneleros.db
├─ SECRET_KEY=tu-clave-segura
└─ DEBUG=False

frontend/.env (crear desde .env.example)
└─ VITE_API_URL=http://localhost:8000/api
```

---

**Última actualización:** Abril 2026
