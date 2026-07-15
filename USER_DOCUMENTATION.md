# 📖 Manual de Usuario — Toneleros App

Guía de referencia rápida de las funcionalidades y módulos del sistema, organizada de mayor a menor relevancia para la gestión operativa.

---

## 1. 📅 Agenda de Eventos
Módulo central para la planificación, registro y seguimiento de actuaciones, bolos y eventos.

### Funciones Principales
* **Visualización Dual:** Consulta de la agenda en formato de listado ordenado o vista de calendario mensual.
* **Control de Estados:** Clasificación de eventos en *Negociación*, *Confirmado* o *Cancelado*.
* **Historial de Actuaciones:** Alternancia rápida entre próximos eventos y actuaciones pasadas.
* **Gestión de Fichas:** Creación, edición y borrado de eventos rellenando datos básicos.
* **Cálculo de Saldos:** Cálculo automático del dinero restante a cobrar descontando la señal inicial.

### Información del Evento
* Tipo de evento (Boda, Fiesta Patronal, Privado, etc.).
* Fecha, hora de comienzo y hora de llegada obligatoria.
* Dirección exacta y contacto del organizador (nombre y teléfono).
* Presupuesto total, señal abonada y estado de entrega de señal.
* Observaciones especiales y estado de equipamiento de sonido.

---

## 2. 👥 Clientes Habituales
Base de datos de representantes, ayuntamientos, comisionistas y clientes frecuentes.

### Funciones Principales
* **Directorio Telefónico:** Almacenamiento rápido de nombres, correos, teléfonos y direcciones.
* **Vínculo Directo a Eventos:** Botón "Crear Evento" en cada ficha de cliente para cargar automáticamente sus datos de contacto en el formulario de la agenda.
* **Mantenimiento:** Altas, modificaciones y eliminación de registros de clientes.

---

## 3. 💰 Finanzas
Control de ingresos brutos, gastos de explotación y balance de rendimiento de la orquesta.

### Funciones Principales
* **Métricas Clave:** Consulta instantánea de ingresos brutos generales, gastos acumulados y balance neto disponible.
* **Registro de Gastos:** Entrada detallada de costes (combustible, mantenimiento de vehículos, marketing, dietas).
* **Filtros Temporales:** Segmentación de cuentas por año y meses seleccionados.
* **Gráfica de Evolución:** Análisis visual comparativo de ingresos frente a gastos mes a mes.

---

## 4. 📄 Documentos y Presupuestos
Gestión de almacenamiento de archivos y herramientas de edición de ofertas comerciales.

### Funciones Principales
* **Creador de Presupuestos:** Generador interactivo de presupuestos elegantes en PDF para clientes. Permite:
  * Modificar datos de cabecera y precio base.
  * Añadir u omitir sonido e iluminación opcional.
  * Seleccionar los bloques de canciones del repertorio que se adjuntarán al PDF.
  * Descargar el presupuesto formateado a 4 páginas en un clic.
* **Almacenamiento en la Nube:** Subida de contratos, facturas o especificaciones técnicas en formato digital.
* **Función Compartir:** Copia directa del enlace de descarga al portapapeles o compartición mediante las aplicaciones del dispositivo (WhatsApp, e-mail).

---

## 5. 🏖️ Calendario de Vacaciones
Coordinación de los periodos de descanso de los componentes del equipo.

### Funciones Principales
* **Registro de Fechas:** Solicitud e indicación de días libres individuales o periodos vacacionales completos.
* **Control de Disponibilidad:** Visualización unificada del equipo (Luis, Pedro, Alfonso, Pipa) para evitar reservar actuaciones en días incompatibles.

---

## 6. 🖼️ Multimedia
Repositorio de contenido promocional para marketing de la banda.

### Funciones Principales
* **Organización de Archivos:** Clasificación rápida por pestañas de fotografías y vídeos cargados.
* **Vista en Detalle:** Apertura de imágenes a pantalla completa sin salir del navegador.
* **Distribución Rápida:** Descarga o envío inmediato del material publicitario a clientes interesados mediante mensajería integrada.

---

## 7. ⚙️ Automatizaciones n8n
Panel técnico para integraciones externas y conectores API.

### Funciones Principales
* **Control de Webhooks:** Configuración de alertas y llamadas automáticas a plataformas externas (como n8n) cuando cambian los eventos de la agenda.
* **Claves API:** Generación y eliminación de credenciales de conexión segura para que otras aplicaciones interactúen con el sistema de Toneleros.

---

## 💡 Utilidades y Seguridad
* **Copia de Seguridad:** Botón de descarga rápida de la base de datos completa (`.db`) en el pie del Dashboard para almacenar respaldos de seguridad fuera del servidor.
* **Compatibilidad Móvil:** Interfaz adaptiva diseñada para su consulta y actualización rápida desde smartphones en ruta.
