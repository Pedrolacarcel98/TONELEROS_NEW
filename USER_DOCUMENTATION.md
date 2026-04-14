# Toneleros — Guía para el usuario

Breve guía orientada a usuarios que desean ejecutar y usar la aplicación Toneleros (MVP).

## Acceso rápido

- Frontend: http://localhost:3000
- Backend API docs (Swagger): http://localhost:8000/docs

Credenciales de prueba (solo entorno de desarrollo):

- Email: pedro@toneleros.com  | Contraseña: Pedro123?
- Email: admin@toneleros.com  | Contraseña: Admin123?

## Inicio rápido (Docker)

1. Abre una terminal en la carpeta del proyecto `TONELEROS_APP`.
2. Ejecuta:

```bash
docker-compose up -d --build
```

3. Espera 20–60s mientras los contenedores inician. Comprueba el estado del backend:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Respuesta esperada: `{ "status": "OK", "app": "Toneleros API" }`.

4. Abre `http://localhost:3000` en el navegador y usa las credenciales de prueba.

## Problemas comunes

- Error en login / Conexión con API: verifica que el backend responde (`/api/health`).
- Si el frontend muestra peticiones a `http://backend:8000`, **cámbialo** por `http://localhost:8000` en la variable `VITE_API_URL` dentro de `docker-compose.yml` (esto ya está configurado en la versión de desarrollo).
- Si la base de datos falla o crees que está corrupta:

```bash
docker-compose down
rm backend/toneleros.db
docker-compose up -d --build
```

## Qué esperar

- Login funcional con JWT
- Dashboard de bienvenida
- Enlaces a la documentación de la API en `/docs`

## Soporte y feedback

Para bugs, mejoras o preguntas, abre un issue en el repositorio privado o contacta con el equipo responsable.
