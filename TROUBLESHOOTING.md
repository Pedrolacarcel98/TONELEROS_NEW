# 🔧 Solución de Problemas - TONELEROS MVP

---

## ❌ Error: `RUN python init_db.py` fails in Docker backend

### Problema
```
ERROR [backend 7/7] RUN python init_db.py
ModuleNotFoundError: No module named 'app'
OR
sqlite3.DatabaseError: database disk image is malformed
```

### Solución ✅ 
**Ya está arreglado en el código.**

**Cambios realizados:**
1. **Removido:** `RUN python init_db.py` del Dockerfile (ya no se ejecuta en build)
2. **Agregado:** `CMD ["python", "run.py"]` (se ejecuta al startup)
3. **Creado:** `backend/run.py` - Entrypoint robusto que:
   - Inicializa BD correctamente
   - Maneja excepciones
   - Inicia Uvicorn
4. **Mejorado:** `backend/init_db.py` - Mejor manejo de errores
5. **Agregado:** Healthcheck en `docker-compose.yml`

**Por qué pasó:**
- `init_db.py` se ejecutaba durante el build, antes de que las tablas estuvieran creadas
- Los imports fallaban porque la BD aún no estaba lista
- Ahora se ejecuta al iniciar el contenedor (runtime, no build)

---

## ❌ Error: `npm ci` fails in Docker

### Problema
```
ERROR: package-lock.json not found
Cannot find a package-lock file
```

### Solución ✅ 
**Ya está arreglado!**

Cambios:
1. Cambió `npm ci` → `npm install` en `frontend/Dockerfile`
2. Creado `Dockerfile.dev` para desarrollo
3. docker-compose.yml usa `Dockerfile.dev`

---

## 🐳 Docker-compose no inicia

### Problema
```
ERROR: Service backend/frontend build failed
```

### Soluciones

#### Opción 1: Forzar reconstrucción completa
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

#### Opción 2: Eliminar imágenes viejas
```bash
docker rmi toneleros-backend toneleros-frontend
docker-compose up -d --build
```

#### Opción 3: Ver logs detallados
```bash
docker-compose up --build  # sin -d para ver logs en tiempo real
```

---

## 📊 Backend tarda mucho en iniciar

### Problema
```
Frontend muestra "Error connecting to API"
Backend no responde de inmediato
```

### Solución
El backend necesita **30-60 segundos** para:
1. Crear las tablas de la BD
2. Crear usuarios de prueba
3. Iniciar Uvicorn

Mira los logs:
```bash
docker-compose logs -f backend
```

Busca este mensaje:
```
✓ Database tables created successfully
✓ Starting Uvicorn server on http://0.0.0.0:8000
```

---

## Puerto 3000 o 8000 en uso

### Problema
```
ERROR: for toneleros-frontend  Cannot start service frontend: Ports are not available
```

### Solución
Cambia puertos en `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # formato: Puerto_Host:Puerto_Contenedor
  
  frontend:
    ports:
      - "3001:3000"
```

---

## Base de datos corrupta o vieja

### Problema
```
Las credenciales no funcionan
Error de BD al iniciar
```

### Solución
```bash
# 1. Detener contenedores
docker-compose down

# 2. Eliminar BD antigua
rm backend/toneleros.db

# 3. Reiniciar
docker-compose up -d --build
```

---

## CORS Error en Frontend

### Problema
```
Access to XMLHttpRequest at 'http://backend:8000/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Solución
El error está arreglado. El backend ahora acepta CORS desde:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://0.0.0.0:3000`
- `http://frontend:3000` (nombre del servicio)

Si persiste, verifica en `backend/.env`:
```env
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://frontend:3000"]
```

---

## API no responde (backend no inicia)

### Problema
```
Error al conectar con http://localhost:8000
Frontend muestra "Connecting error..."
```

### Solución
```bash
# Ver logs del backend
docker-compose logs backend

# Verificar que el contenedor está corriendo
docker ps | grep toneleros-backend

# Ver healthcheck status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Si muestra "unhealthy", espera más tiempo
# o verifica logs completos
docker-compose logs backend | tail -50
```

---

## Frontend en blanco (código no se carga)

### Problema
La página sale vacía o no carga CSS/JS

### Solución

#### 1. Verifica que Vite está corriendo
```bash
docker-compose logs frontend | grep "VITE"
```

Debería mostrar:
```
➜  Local:   http://localhost:3000/
```

#### 2. Fuerza reload en navegador
- Presiona `Ctrl + Shift + R` (reload hard)
- O abre en pestaña privada/incógnita

#### 3. Elimina caché del navegador
```bash
# En DevTools: F12 → Application → Clear All
```

#### 4. Verifica que frontend se conecta a backend
```bash
docker-compose logs frontend | grep "VITE_API_URL"
```

Debe ser:
```
VITE_API_URL=http://backend:8000/api
```

---

## `node_modules` gigantescos o causa problemas

### Problema
Docker descarga tarde o usa mucho espacio

### Solución
Ya está optimizado en docker-compose.yml:
```yaml
volumes:
  - /app/node_modules  # no sincroniza node_modules
```

Si aún ocurren problemas:
```bash
docker volume prune
docker-compose up -d --build
```

---

## Permission Denied (Linux/Mac)

### Problema
```
Permission denied while trying to connect to Docker daemon
```

### Solución
```bash
# Agrega tu usuario al grupo docker
sudo usermod -aG docker $USER

# Aplica cambios (requiere logout/login)
newgrp docker

# O usa sudo
sudo docker-compose up -d --build
```

---

## Cambios en código no se reflejan

### Problema
Actualicé archivos pero los cambios no aparecen

### Solución

#### Frontend (React/Vite)
- El hot reload debería funcionar automáticamente
- Si no:
```bash
# Reinicia contenedor
docker-compose restart frontend

# O fuerza reload: Ctrl+Shift+R
```

#### Backend (Python/FastAPI)
- El reload también debería ser automático (--reload)
- Si no:
```bash
# Reinicia contenedor
docker-compose restart backend
```

---

## Error: `ModuleNotFoundError: No module named 'app'`

### Problema
```
ModuleNotFoundError: No module named 'app'
```

### Solución
Este error fue arreglado moviendo `init_db.py` del build al runtime.

Si aún ocurre:
```bash
# Reconstruye desde cero
docker system prune -a
docker-compose up -d --build
```

---

## Error: `pip: command not found`

### Problema
```
pip: command not found
```

### Solución
Usa el Dockerfile correcto:
```bash
docker-compose down
docker-compose up -d --build
```

---

## Token expirado o inválido

### Problema
```
Token invalid or expired
Unauthorized
```

### Solución
En Frontend:
```javascript
// Borra el token guardado
localStorage.clear()
// Vuelve a hacer login
```

---

## Despliegue Manual Local (sin Docker)

Si Docker no te funciona, intenta esto:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python run.py
```

### Frontend (otra terminal)
```bash
cd frontend
npm install
npm run dev
```

Accede a `http://localhost:3000`

---

## ¿Nada funcionó?

### Información a recopilar
1. **SO:** Windows / Mac / Linux
2. **Docker version:**
   ```bash
   docker --version
   docker-compose --version
   ```
3. **Output del error:**
   ```bash
   docker-compose up --build  # copia todo el output
   ```
4. **Logs:**
   ```bash
   docker-compose logs
   ```
5. **Estado de contenedores:**
   ```bash
   docker ps -a
   ```

---

**Last Updated:** April 13, 2026

**Ver también:** [FIXES.md](FIXES.md) - Cambios realizados
