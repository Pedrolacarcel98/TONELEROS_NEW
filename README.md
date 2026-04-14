# Toneleros App - MVP v1.0

Plataforma modular de gestión de eventos para grupo musical. Backend Python (FastAPI) + Frontend React.

**🔧 Última actualización:** Corregidos errores de Docker/npm. Ver [FIXES.md](FIXES.md)

## 🚀 Despliegue Rápido con Docker

### Requisitos Previos

- Docker Desktop instalado ([descargar aquí](https://www.docker.com/products/docker-desktop))
- Git (opcional)

### Opción 1: Despliegue con Docker Compose (Recomendado)

```bash
# 1. Clona o descarga el proyecto
cd TONELEROS_APP

# 2. Construye e inicia los contenedores
docker-compose up -d --build

# 3. Espera 30-60 segundos a que todo inicie

# 4. Accede a la aplicación
# Frontend: http://localhost:3000
# Backend API Docs: http://localhost:8000/docs
```

**Para ver los logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Para detener la aplicación:**
```bash
docker-compose down
```

### Opción 2: Despliegue Manual Local

#### Backend (Python)

```bash
cd backend

# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Inicializar base de datos con usuarios de prueba
python init_db.py

# 4. Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará en: `http://localhost:8000`

#### Frontend (React)

En otra terminal:

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará en: `http://localhost:3000`

---

## 📝 Credenciales de Acceso

| Email | Contraseña |
|-------|-----------|
| pedro@toneleros.com | Pedro123? |
| admin@toneleros.com | Admin123? |

---

## 📋 Funcionalidades MVP

### ✅ Implementadas

- Autenticación con JWT
- Login con email/contraseña
- Dashboard de bienvenida
- Gestión de sesiones
- Interfaz responsiva

### ⏳ Próximamente

- Gestión de eventos/agenda
- Control de finanzas
- Gestión de documentos
- Galería de fotos y videos
- Reportes y estadísticas

---

## 🔗 URLs Principales

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Docs Swagger | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## 📂 Estructura del Proyecto

```
TONELEROS_APP/
├── backend/              # API Python (FastAPI)
│   ├── app/
│   │   ├── core/         # Config, seguridad
│   │   ├── models/       # Modelos BD
│   │   ├── schemas/      # Validación
│   │   ├── routes/       # Endpoints
│   │   └── db/           # Base de datos
│   ├── requirements.txt
│   ├── init_db.py        # Script init BD
│   ├── Dockerfile
│   ├── .env
│   └── .env.example
│
├── frontend/             # App React (Vite)
│   ├── src/
│   │   ├── components/   # Componentes
│   │   ├── pages/        # Páginas
│   │   ├── services/     # APIs
│   │   ├── context/      # Estado global
│   │   └── hooks/        # Custom hooks
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile         # Producción
│   ├── Dockerfile.dev     # Desarrollo 
│   ├── Dockerfile.prod    # Producción alternativo
│   ├── .env
│   └── .env.example
│
├── docker-compose.yml
├── README.md             # Este archivo
├── QUICK_START.md
├── FIXES.md              # Cambios recientes
├── TROUBLESHOOTING.md    # Solución de problemas
├── RESUMEN_MVP.md
└── .gitignore
```

---

## 🔒 Seguridad (Importante para Producción)

Antes de desplegar a producción:

1. Cambiar `SECRET_KEY` en `backend/.env`
2. Cambiar contraseñas de prueba
3. Setear `DEBUG=False`
4. Usar HTTPS/SSL
5. Usar base de datos production-ready (PostgreSQL)
6. Configurar CORS adecuadamente
7. Agregr validación y sanitización adicional

---

## 🔧 Configuración

### Variables de Entorno (Backend)

Archivo: `backend/.env`

```env
DATABASE_URL=sqlite:///./toneleros.db
SECRET_KEY=tu-clave-secreta-muy-larga
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://frontend:3000"]
```

### Variables de Entorno (Frontend)

Archivo: `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📚 Documentación Adicional

- [QUICK_START.md](QUICK_START.md) - Inicio rápido 3 pasos
- [FIXES.md](FIXES.md) - Cambios y correcciones recientes
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solución de problemas
- [ARQUITECTURA.md](ARQUITECTURA.md) - Diagramas técnicos
- [MVP_STATUS.md](MVP_STATUS.md) - Checklist completo

---

## ⚠️ Solución de Problemas

### La documentación completa está en [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

#### Problema: `npm ci` error
**Solución:** Ya está arreglado. El código usa `npm install` ahora. Ver [FIXES.md](FIXES.md)

#### Problema: Puerto en uso
**Solución:** Cambiar puertos en `docker-compose.yml`

#### Problema: BD corrupta
**Solución:** `rm backend/toneleros.db && docker-compose up --build`

---

## 📞 Soporte

Para reportar problemas o sugerencias, ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📄 Licencia

Este proyecto es privado. Uso interno únicamente.

---

**Última actualización:** Abril 13, 2026 - MVP v1.0 con correcciones
