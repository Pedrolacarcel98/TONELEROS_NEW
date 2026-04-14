# Toneleros — Documentación para desarrolladores

Documentación técnica orientada a desarrolladores: estructura, configuración, despliegue y buenas prácticas para trabajar con el código.

## Estructura del proyecto

Raíz del repo (resumen):

- `backend/` — FastAPI app, modelos, scripts de inicialización, `requirements.txt`, `Dockerfile`.
- `frontend/` — React (Vite), componentes, `package.json`, `Dockerfile.dev` y `Dockerfile`.
- `docker-compose.yml` — Orquestación local (frontend + backend).
- `init_db.py` — Script de inicialización y seed de usuarios.

## Variables de entorno importantes

Backend (`backend/.env` o variables en `docker-compose.yml`):

- `DATABASE_URL` — Ej: `sqlite:///./toneleros.db`
- `SECRET_KEY` — Clave JWT; cambiar en producción
- `ALGORITHM` — Algoritmo JWT (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — Duración del token
- `DEBUG` — True/False
- `ALLOWED_ORIGINS` — Lista de orígenes permitidos para CORS

Frontend (`frontend/.env`):

- `VITE_API_URL` — URL base para la API. En desarrollo con Docker usar `http://localhost:8000/api` o proxy Vite.

## Desarrollo local (pasos)

Backend (sin Docker):

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python init_db.py        # crea tablas y usuarios de prueba
python run.py            # inicia uvicorn (o `uvicorn app.main:app --reload`)
```

Frontend (sin Docker):

```bash
cd frontend
npm install
npm run dev
```

Con Docker (recomendado):

```bash
docker-compose up -d --build
```

## Cómo inicializar o resetear la base de datos

1. Parar contenedores: `docker-compose down`
2. (opcional) Hacer backup: `cp backend/toneleros.db backend/toneleros.db.bak`
3. Eliminar DB: `rm backend/toneleros.db`
4. Levantar servicios: `docker-compose up -d --build` (el contenedor backend ejecuta `run.py` que llama a `init_db.create_test_users()`)

## Debugging y comprobaciones

- Health check: `GET /api/health` debe devolver JSON con status OK.
- Probar login desde Swagger: `POST /api/auth/login`.
- Revisar logs: `docker-compose logs -f backend` y `docker-compose logs -f frontend`.

## Docker / Docker Compose

- `frontend` arranca en `Dockerfile.dev` para desarrollo (Vite) y expone `3000`.
- `backend` usa `backend/Dockerfile` y expone `8000`.
- En `docker-compose.yml` la variable `VITE_API_URL` debe apuntar a `http://localhost:8000/api` para que el navegador pueda comunicarse con el backend desde el host.

## Añadir dependencias

- Backend: editar `backend/requirements.txt` y reconstruir la imagen.
- Frontend: editar `frontend/package.json` y ejecutar `npm install` o reconstruir la imagen.

## Seguridad y producción

- Cambiar `SECRET_KEY` y no almacenar secretos en el repo.
- Usar base de datos robusta (Postgres) en producción.
- Configurar HTTPS, CORS y límites de peticiones.

## Tests

Actualmente no hay suite de tests automatizados en el repo; recomendable:

- Backend: añadir `pytest` y tests de endpoints con `httpx` y `FastAPI` test client.
- Frontend: añadir tests con `vitest`/`react-testing-library`.

## Contribución y estilo

- Sigue PEP8 para Python y reglas habituales de ESLint/Prettier para frontend.
- Crear ramas feature/bugs con PRs y descripciones claras.

## Notas rápidas para desarrolladores

- El entrypoint runtime es `backend/run.py` (inicializa BD y arranca uvicorn).
- Seed de usuarios: `backend/init_db.py`.
- Configuración central en `backend/app/core/config.py`.
