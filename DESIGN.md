# 📱 Diseño y Análisis Funcional - Toneleros Mobile App

Este documento ha sido creado específicamente para el Agente de Desarrollo de Apps Móviles. Contiene un análisis intensivo de la funcionalidad actual y planificada del proyecto "Toneleros", junto con pautas de diseño y arquitectura optimizadas para el entorno móvil.

## 1. 🎯 Resumen Ejecutivo

El proyecto **Toneleros** cuenta actualmente con un MVP funcional compuesto por un backend en Python (FastAPI) y un frontend web en React. La aplicación está orientada a la gestión de actuaciones, eventos, finanzas y documentación de una entidad (presumiblemente un grupo, banda o asociación). 

El objetivo principal de la versión móvil es ofrecer a los usuarios (miembros, administradores) una herramienta rápida, accesible y optimizada para su uso en movimiento, aprovechando las capacidades nativas del dispositivo (cámara, notificaciones push, almacenamiento local).

---

## 2. 🧩 Análisis Funcional por Módulos

### 2.1. Módulo de Autenticación y Perfil
*   **Estado Actual:** Login con Email/Contraseña, autenticación basada en JWT, gestión de sesión.
*   **Adaptación Móvil:**
    *   **Biometría:** Implementar inicio de sesión mediante FaceID / TouchID para mejorar la UX y la seguridad.
    *   **Persistencia:** Uso de almacenamiento seguro (`SecureStore` en React Native o `Flutter Secure Storage`) para mantener el token JWT.
    *   **Onboarding:** Pantallas de bienvenida para explicar las funcionalidades principales al usuario por primera vez.

### 2.2. Módulo de Agenda (Eventos y Actuaciones)
*   **Estado Actual:** Modelo de base de datos creado (`Event`), operaciones CRUD planificadas.
*   **Funcionalidad Móvil:**
    *   **Vista de Calendario:** Navegación intuitiva por meses/semanas.
    *   **Detalle del Evento:** Información completa (ubicación, fecha, hora, descripción).
    *   **Integración de Mapas:** Apertura de la ubicación del evento directamente en Google Maps / Apple Maps.
    *   **Recordatorios:** Notificaciones locales (push) previas a los eventos importantes (ej. "Actuación en 2 horas").

### 2.3. Módulo de Finanzas
*   **Estado Actual:** Planificado (Seguimiento de presupuesto, ingresos/gastos).
*   **Funcionalidad Móvil:**
    *   **Dashboard Visual:** Gráficos de barras o tartas para visualizar rápidamente el balance económico.
    *   **Ingreso Rápido:** Formularios optimizados para registrar un gasto o ingreso en pocos toques.
    *   **Escaneo de Tickets (Mejora Nativa):** Uso de la cámara y OCR básico para capturar recibos y autocompletar gastos.

### 2.4. Módulo de Documentos
*   **Estado Actual:** Planificado (Subida de documentos, listado, descarga).
*   **Funcionalidad Móvil:**
    *   **Visualizador Integrado:** Apertura de PDFs y documentos directamente en la app sin depender de apps de terceros.
    *   **Compartir Nativamente:** Uso del menú `Share` nativo de iOS/Android para enviar documentos por WhatsApp o Email.

### 2.5. Módulo de Galería Multimedia
*   **Estado Actual:** Planificado (Fotos, vídeos, lightbox).
*   **Funcionalidad Móvil:**
    *   **Captura Directa:** Tomar fotos y vídeos desde la app y subirlos directamente al backend.
    *   **Galería Optimizada:** Carga perezosa (Lazy Loading), caché de imágenes en disco para reducir consumo de datos.
    *   **Pinch-to-zoom:** Visualizador de imágenes con gestos nativos.

---

## 3. 🎨 Directrices de Diseño UI/UX

El diseño web actual no debe trasladarse 1:1 al entorno móvil. Se deben aplicar los siguientes principios:

1.  **Mobile-First & Thumb-Friendly:** Los botones de acción principal (FAB - Floating Action Buttons) y la navegación deben estar en la parte inferior de la pantalla, accesibles con el pulgar.
2.  **Bottom Navigation Bar:** Utilizar una barra de navegación inferior para cambiar rápidamente entre: *Dashboard, Calendario, Finanzas, Perfil*.
3.  **Dark Mode Nativo:** Soporte integrado para temas claros y oscuros según la configuración del sistema operativo.
4.  **Micro-interacciones:** Retroalimentación háptica (vibración leve) al confirmar acciones importantes (ej. confirmar asistencia a un evento).
5.  **Offline States & Skeleton Loaders:** Mostrar *skeletons* (pantallas de carga grises) mientras se obtienen datos del API, y diseñar pantallas amigables de "Sin Conexión" si falla la red.

---

## 4. 🛠️ Arquitectura Técnica Recomendada para la App

Para el agente de desarrollo móvil, se sugieren las siguientes especificaciones técnicas para mantener coherencia con el ecosistema actual:

*   **Tecnología:** **React Native** (con Expo para agilizar el desarrollo) o **Flutter**. *Nota: React Native permitiría reutilizar algo de lógica de negocio o familiaridad del frontend web actual en React.*
*   **Gestión del Estado:** 
    *   React Native: Zustand o Redux Toolkit.
    *   Flutter: Riverpod o Bloc.
*   **Cliente API:** Axios (RN) o Dio (Flutter) con interceptores para inyectar automáticamente el JWT y manejar refrescos de token en caso de un error `401 Unauthorized`.
*   **Estrategia Offline-First:** 
    *   Usar SQLite local o un wrapper (como WatermelonDB / Hive) para cachear eventos y documentos clave. 
    *   Sincronización en segundo plano cuando se recupere la conexión.
*   **Notificaciones:** Integración con Firebase Cloud Messaging (FCM) para notificaciones push desde el backend FastAPI.

---

## 5. 🚀 Plan de Acción para el Agente Móvil

1.  **Setup Inicial:** Crear el andamiaje del proyecto móvil y configurar los entornos (Dev/Prod) apuntando al backend existente (`http://<IP-LOCAL>:8000/api`).
2.  **Autenticación:** Implementar la pantalla de Login, almacenamiento seguro del token y ruteo protegido (AuthStack vs AppStack).
3.  **Navegación Core:** Configurar la navegación principal (Tab Navigation) y el Dashboard inicial.
4.  **Módulo de Agenda:** Construir la vista de calendario consumiendo la API de eventos.
5.  **Iteraciones Futuras:** Incorporar módulos de finanzas y multimedia a medida que el backend exponga los endpoints correspondientes.
