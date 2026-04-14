# Toneleros App - Guía Rápida de Inicio

## 🎯 Inicio Rápido - 2 Pasos

### 1️⃣ Requisitos

- Docker Desktop instalado ([descargar](https://www.docker.com/products/docker-desktop))

### 2️⃣ Ejecutar

```bash
cd TONELEROS_APP
docker-compose up -d --build
```

Espera 30-60 segundos mientras instala dependencias...

### 3️⃣ Acceder

- **Frontend:** http://localhost:3000
- **Backend API Docs:** http://localhost:8000/docs

### 4️⃣ Login

**Usuario:** `pedro@toneleros.com`  
**Contraseña:** `Pedro123?`

---

## 🛠️ Comandos Útiles

```bash
# Ver logs en vivo
docker-compose logs -f

# Ver solo el frontend
docker-compose logs -f frontend

# Ver solo el backend
docker-compose logs -f backend

# Verificar que los contenedores están corriendo
docker ps

# Detener todo
docker-compose down

# Detener y limpiar
docker-compose down -v

# Reconstruir (si hiciste cambios en Dockerfile)
docker-compose up -d --build
```

---

## ❌ Problemas Comunes

### Error: `npm install failed`
**Solución:** Ya está arreglado! El código incluye `Dockerfile.dev` que usa `npm install` en lugar de `npm ci`.

### Frontend en blanco
**Solución:** Presiona `Ctrl+Shift+R` (hard refresh) o abre en modo incógnito

### Puerto 3000 o 8000 en uso
**Solución:** Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### ¿Más problemas?
**Ver:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Guía completa de solución de problemas

---

## 📖 Documentación Completa

- [README.md](README.md) - Documentación principal
- [ARQUITECTURA.md](ARQUITECTURA.md) - Diagramas técnicos
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solución de problemas
- [RESUMEN_MVP.md](RESUMEN_MVP.md) - Resumen técnico

---

**Última actualización:** Abril 13, 2026
