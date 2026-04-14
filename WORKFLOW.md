# Flujo de trabajo y funcionalidad — Toneleros (plantilla)

Este documento define un flujo de trabajo reproducible (para desarrolladores y agentes) que garantiza que el proyecto arranque, el frontend se conecte al backend y el login funcione correctamente. Está basado en los archivos de despliegue del repositorio: `docker-compose.yml`, `backend/run.py`, `backend/init_db.py`, `frontend/vite.config.js` y los `.env.example`.

1. Propósito

- Proveer pasos claros y atómicos para: arrancar, comprobar conectividad API, inicializar DB, probar login y resetear el entorno si es necesario.
- Incluir un flujo automatizable por un agente para tareas comunes (backup, reset DB, rebuild).

2. Prerrequisitos

- Docker & Docker Compose instalados.
- Node.js y Python para desarrollo local opcional (sin Docker).
- Fichas clave en el repo:
  - `docker-compose.yml` (orquestación frontend/backend)
  - `backend/run.py` (entrypoint runtime que ejecuta `init_db` y arranca Uvicorn)
  - `backend/init_db.py` (crea tablas y usuarios de prueba)
  - `frontend/vite.config.js` (config dev/proxy)
  - `backend/.env.example` y `frontend/.env.example`

3. Flujo rápido (desarrollador)

- Desde la raíz del proyecto:

```bash
# 1) Levantar servicios reproducibles
docker-compose up -d --build

# 2) Verificar health del backend
# PowerShell:
Invoke-RestMethod http://localhost:8000/api/health
# o con curl (Windows):
curl.exe -sS http://localhost:8000/api/health

# 3) Probar login en Swagger (backend docs)
# Abrir http://localhost:8000/docs y ejecutar POST /api/auth/login

# 4) Probar UI en el navegador
# Abrir http://localhost:3000 e iniciar sesión con credenciales de prueba
```

Notas:
- Asegúrate de que `VITE_API_URL` en `docker-compose.yml` apunta a `http://localhost:8000/api` (el navegador necesita resolver `localhost`, no `backend`).

4. Reset seguro de la base de datos (manual)

```bash
# 1. Parar contenedores
docker-compose down

# 2. (Opcional) Backup
cp backend/toneleros.db backend/toneleros.db.bak

# 3. Eliminar base de datos
rm backend/toneleros.db

# 4. Levantar y recrear (run.py invoca init_db)
docker-compose up -d --build

# 5. Ver logs para confirmar creación de usuarios
docker-compose logs -f backend
```

5. Flujo del agente / script automatizado (idempotente y seguro)

Pauta para un agente (o script CI) que debe resetear el entorno y comprobar login:

1. Crear backup del archivo DB si existe.
2. Parar contenedores: `docker-compose down`.
3. Eliminar `backend/toneleros.db`.
4. Levantar contenedores: `docker-compose up -d --build`.
5. Esperar a que el backend pase el healthcheck (poll hasta 60s).
6. Verificar endpoint `/api/health` responde 200 y `POST /api/auth/login` con credenciales de prueba devuelve token.
7. Opcional: comprobar usuarios en DB con Python:

```bash
docker-compose exec backend python - <<'PY'
import sqlite3
db=sqlite3.connect('/app/toneleros.db')
rows=list(db.execute('SELECT id,email FROM usuarios'))
print(rows)
db.close()
PY
```

Ejemplo de script (pseudo-PowerShell) — acciones críticas explícitas:

```powershell
# Backup
if (Test-Path backend\toneleros.db) { Copy-Item backend\toneleros.db backend\toneleros.db.bak }

# Down
docker-compose down

# Remove DB
Remove-Item backend\toneleros.db -ErrorAction SilentlyContinue

# Up
docker-compose up -d --build

# Wait for health (simple loop)
for ($i=0; $i -lt 30; $i++) {
  try { $resp = Invoke-RestMethod http://localhost:8000/api/health; if ($resp.status -eq 'OK') { Write-Host 'Healthy'; break } }
  catch { Start-Sleep -s 2 }
}

# Test login
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/auth/login -ContentType 'application/json' -Body '{"email":"pedro@toneleros.com","password":"Pedro123?"}'
```

6. Verificaciones esenciales (post-arranque)

- `GET /api/health` -> status OK
- `POST /api/auth/login` -> devuelve `access_token` y `user`
- `docker ps` -> ambos contenedores corriendo
- Frontend en navegador envía peticiones a `http://localhost:8000` (no `http://backend:8000`)

7. Flujo de desarrollo iterativo (cambios en código)

- Backend: editar código en `backend/` (si montado en volumen), logs y reload con `run.py`/uvicorn `--reload` gestionan reinicio rápido.
- Frontend: editar `frontend/src/*`, Vite HMR aplica cambios instantáneamente.
- Si cambias dependencias:
  - Backend: actualizar `backend/requirements.txt` y reconstruir la imagen.
  - Frontend: actualizar `frontend/package.json` y reconstruir (o `npm install` dentro del contenedor de dev).

8. Git / Pull Requests

- Rama por feature: `feature/<nombre>`
- Mensajes de commit claros: `feat(auth): add login endpoint` o `fix(docker): set VITE_API_URL to localhost`
- PRs con checklist: build pasa, health OK, login probado en Swagger y UI.

9. Errores comunes y soluciones rápidas

- Frontend intenta conectar a `http://backend:8000`: cambiar `VITE_API_URL` a `http://localhost:8000/api` en `docker-compose.yml` o usar proxy Vite.
- `ModuleNotFoundError: No module named 'app'` al ejecutar `init_db.py` en build: ejecutar `init_db.py` en runtime (esto ya está resuelto, `run.py` lo hace).
- Healthcheck falla: aumentar `start_period` en `docker-compose.yml` y revisar `docker-compose logs backend`.

10. Punto de entrada mínimo funcional

- Objetivo: ser capaz de arrancar, conectar a la DB y hacer login.
- Archivos clave que garantizan ese objetivo: `docker-compose.yml` (con `VITE_API_URL=http://localhost:8000/api`), `backend/run.py`, `backend/init_db.py`.

11. Checklist para agentes automatizados

- [ ] Hacer backup del archivo DB si existe.
- [ ] Parar contenedores y eliminar DB.
- [ ] Levantar contenedores y esperar healthcheck.
- [ ] Probar `POST /api/auth/login` con credenciales de prueba.
- [ ] Reportar resultados (success/fail) y logs relevantes.

---

Este flujo es intencionadamente mínimo y portable: adapta los nombres de servicios, variables de entorno y scripts a cualquier proyecto similar (frontend SPA + backend API + BD ligera). Para tareas más avanzadas (migraciones, seeds complejos, pruebas end-to-end) extiende los pasos manteniendo las mismas garantías (backup, healthcheck, verificación de login).
