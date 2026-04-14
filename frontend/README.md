# Toneleros App - Frontend React

Aplicación frontend desarrollada con React 18 y Vite. Proporciona una interfaz moderna y responsiva para la gestión de eventos.

## Estructura

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── auth/         # Componentes de autenticación
│   │   └── common/       # Componentes comunes (Header, etc)
│   ├── pages/            # Páginas principales
│   ├── services/         # Servicios API
│   ├── context/          # Context API (AuthContext)
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Estilos globales
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
└── README.md
```

## Características MVP

- ✓ Login con email/contraseña
- ✓ Autenticación con JWT
- ✓ Dashboard principal de bienvenida
- ✓ Gestión de sesiones
- ✓ Interfaz responsiva y moderna

## Instalación Local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Build para Producción

```bash
npm run build
```

## Estructura de Componentes

- **LoginForm**: Componente de inicio de sesión
- **Header**: Barra superior con información del usuario
- **Dashboard**: Página principal con menú de acciones

## Services

- **authService**: Manejo de autenticación y tokens
- **apiClient**: Cliente Axios preconfigurado con interceptores

## Context

- **AuthContext**: Estado global de autenticación
- **useAuth**: Hook personalizado para acceder al contexto
