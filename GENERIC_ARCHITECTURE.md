# Arquitectura genérica: Frontend + Backend + BD (Login + Dashboard)

Este documento describe una arquitectura base, reutilizable para proyectos web simples que incluyen: frontend (SPA), backend (API REST), base de datos ligera, autenticación (login) y un dashboard.

1. Visión general

- Frontend: Single-Page Application (React/Vite, Vue, Svelte). Responsable de la UI, validación básica, manejo de sesión y llamadas a la API.
- Backend: API REST (FastAPI, Express, Flask). Responsable de la lógica, autenticación, autorización, validación y acceso a la base de datos.
- Base de datos: Ligera en local (SQLite) o escalable en producción (Postgres). Contiene tablas de usuarios, sesiones/tokens (opcional) y datos de la aplicación (events, etc.).

2. Componentes y responsabilidades

- UI (Frontend)
  - Login form, manejo de tokens (localStorage / cookies), protección de rutas, redirección tras login.
  - Dashboard: vistas protegidas que consumen endpoints seguros.
  - Cliente HTTP (Axios / fetch) con interceptor para añadir Authorization header.

- API (Backend)
  - Endpoints públicos: `/health`, `/docs`.
  - Endpoints de auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` (opcional).
  - Endpoints de aplicación: CRUD para recursos (ej. `/api/events`).
  - Seguridad: hashing de contraseñas (bcrypt), JWT u otra estrategia de tokens.

- DB (Persistencia)
  - Tabla `users`: id, email (único), password_hash, role, created_at.
  - Tablas de dominio: `events`, `documents`, etc., con timestamps y referencias.

3. Flujo de autenticación (simplificado)

1. Usuario envía credenciales al frontend.
2. Frontend POST `/api/auth/login` con `{email,password}`.
3. Backend verifica credenciales, devuelve `access_token` (JWT) y datos de usuario.
4. Frontend guarda token (localStorage/cookie) y añade `Authorization: Bearer <token>` a futuras solicitudes.
5. Backend valida token en endpoints protegidos.

4. Contrato mínimo de API (ejemplos)

- POST /api/auth/login
  - Request: { email, password }
  - Response: { access_token, token_type: 'bearer', user: { id, email } }

- GET /api/auth/me
  - Header: Authorization: Bearer <token>
  - Response: { id, email }

5. Despliegue local (recomendación)

- Orquestación: `docker-compose` con 2 servicios: `frontend` y `backend`.
- Exponer puertos: frontend 3000, backend 8000. En desarrollo el frontend debe apuntar a `http://localhost:8000/api` (no `http://backend:8000`, ese host solo resuelve dentro de Docker).
- Healthcheck para backend y `depends_on` con condición `service_healthy` para frontend en `docker-compose.yml`.

6. Seguridad y buenas prácticas

- No almacenar `SECRET_KEY` ni credenciales en el repo; usar variables de entorno o secretos del orquestador.
- Hashear contraseñas con `bcrypt`/`argon2`.
- Usar HTTPS en producción y configurar `SameSite` y `Secure` si se usan cookies.
- Tokens: usar expiración corta y refresh tokens si se necesita sesión prolongada.
- Validación de entrada en backend (pydantic/Joi/validators).

7. Escalado y producción (pistas)

- Sustituir SQLite por PostgreSQL o MySQL.
- Añadir CORS configurado solo para orígenes permitidos.
- Implementar logging centralizado y monitoring.
- Colocar `nginx` o un reverse-proxy para servir el frontend estático y manejar TLS.

8. CI/CD y pruebas

- Añadir pipeline que ejecute linters, tests y builds.
- Backend: pruebas unitarias y de integración con fixtures DB (pytest + sqlite in-memory o contenedor Postgres de test).
- Frontend: pruebas unitarias y E2E simples (Vitest/Jest + Playwright/Cypress).

9. Checklist para comenzar un proyecto basado en esta plantilla

- [ ] Inicializar repo con `backend/` y `frontend/`.
- [ ] Crear `init_db.py` para seed y scripts de migración básica.
- [ ] Proveer `.env.example` con variables mínimas (`DATABASE_URL`, `SECRET_KEY`, `VITE_API_URL`).
- [ ] Implementar `POST /api/auth/login` y `GET /api/auth/me`.
- [ ] Documentar comandos `docker-compose up -d --build` y healthchecks.

10. Recursos y plantillas útiles

- Esqueleto backend: FastAPI + SQLAlchemy + Pydantic + Uvicorn.
- Esqueleto frontend: Vite + React + Axios.
- Autenticación: PyJWT / python-jose en Python; `jsonwebtoken` en Node.

---

Este archivo debe adaptarse con detalles concretos del stack elegido (nombres de carpetas, comandos de build, scripts de migración). Está pensado como guía reutilizable para proyectos que implementen login + dashboard sobre una API.
