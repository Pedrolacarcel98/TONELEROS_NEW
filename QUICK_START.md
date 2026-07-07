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

## 🔄 Migración de Datos (Separación Fecha/Hora)

**¡MUY IMPORTANTE PARA NO PERDER DATOS!** 
Se ha separado la fecha de la hora en la base de datos y se ha añadido el cálculo automático de la hora de llegada. Para que esto funcione sin perder ningún evento existente, debes ejecutar el script de migración una vez que despliegues los cambios.

### En Desarrollo (Local con Docker)

1. Levanta los contenedores con los últimos cambios:
   ```bash
   docker-compose up -d --build
   ```
2. Ejecuta el script de migración dentro del contenedor del backend:
   ```bash
   docker-compose exec backend python migrate_times.py
   ```
3. Verás un mensaje indicando que se han añadido las columnas y que la migración se completó con éxito.

### En Producción (Máquina Virtual de Google Cloud)

Dado que usas Docker en una VM de Google Cloud, los pasos son los siguientes:

1. Conéctate por SSH a tu instancia de Google Cloud.
2. Navega a la carpeta donde tienes alojado el proyecto:
   ```bash
   cd /ruta/a/tu/proyecto/TONELEROS_APP
   ```
3. Descarga los últimos cambios del repositorio (si usas git):
   ```bash
   git pull
   ```
4. Reconstruye y levanta los contenedores con los nuevos cambios en segundo plano:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
5. Ejecuta la migración de datos dentro del contenedor del backend activo (esto no detendrá la aplicación):
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python migrate_times.py
   ```
6. Verás un mensaje de éxito. ¡Tus datos se habrán migrado al nuevo formato de fecha y hora!

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
