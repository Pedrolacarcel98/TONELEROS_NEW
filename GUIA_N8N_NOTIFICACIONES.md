# 🚀 Guía Paso a Paso: Notificaciones por Email con n8n

Esta guía está diseñada para principiantes. Te explicará paso a paso cómo conectar tu aplicación (Toneleros) con n8n para que, cada vez que se cree una nueva actuación, se envíe un correo electrónico automáticamente.

---

## 🎯 El Concepto Básico (¿Cómo funciona?)

El flujo de información será el siguiente:
1. El usuario rellena el formulario de "Nueva Actuación" en tu página web.
2. Tu backend (FastAPI) guarda la actuación en la base de datos de forma normal.
3. Inmediatamente después, tu backend hace una **"llamada telefónica" (Webhook)** a n8n avisándole: *"¡Oye, hay una nueva actuación! Aquí tienes los datos"*.
4. **n8n** recibe esos datos y ejecuta el nodo de **Email** para enviar el correo a quien tú decidas.

---

## 🛠️ PASO 1: Crear el flujo (Workflow) en n8n

1. Abre tu panel de **n8n**.
2. En el menú lateral izquierdo, haz clic en **"Workflows"** y luego en el botón **"Add workflow"** (o "Create new workflow").
3. Dale un nombre a tu flujo haciendo clic en la parte superior izquierda (donde dice "My workflow"). Llámalo, por ejemplo: `Notificar Nueva Actuación`.

### 1.1 Añadir el Nodo "Webhook" (El que escucha)
El Webhook es como un buzón que estará esperando a que tu aplicación le envíe los datos.

1. En el lienzo en blanco, haz clic en **"Add first step"** (Añadir primer paso).
2. Busca la palabra **`Webhook`** y selecciónalo.
3. Configura el Webhook con los siguientes valores:
   - **Authentication:** `None` (Para empezar, lo dejaremos sin contraseña para que sea más fácil. Luego puedes asegurarlo).
   - **HTTP Method:** Selecciona **`POST`** (Esto es importante, significa que va a recibir datos, no a enviarlos).
   - **Path:** Escribe `nueva-actuacion` (o déjalo como está).
4. Verás que hay un apartado llamado **"Webhook URLs"**. Si haces clic ahí, verás dos pestañas: `Test` y `Production`.
5. Haz clic en la pestaña **`Test`** y haz clic en el botón de copiar (el icono de portapapeles) al lado de la URL. **Guarda esa URL, la necesitaremos en el Paso 2.**
   - *Nota:* Las URL de test solo funcionan cuando le das al botón de "escuchar" en n8n.
6. Cierra la ventana de configuración del Webhook haciendo clic fuera de ella.

---

## 💻 PASO 2: Enviar los datos desde tu Backend (FastAPI)

Ahora tenemos que decirle a tu aplicación que envíe los datos a la URL que acabamos de copiar de n8n.

1. Abre tu proyecto y ve a tu backend. Posiblemente en el archivo `backend/app/routes/events.py` (o donde tengas la función para crear actuaciones).
2. Tienes que añadir un pequeño código que haga una petición HTTP a n8n usando la librería `httpx`.

**Ejemplo de cómo modificar tu código (FastAPI):**

```python
import httpx # Añade esto arriba del todo en tus imports
from fastapi import APIRouter, BackgroundTasks

router = APIRouter()

# URL de TEST de n8n que copiaste en el paso anterior (Cámbiala por la tuya)
N8N_WEBHOOK_URL = "http://TU_N8N_URL/webhook-test/nueva-actuacion"

@router.post("/actuaciones/")
async def crear_actuacion(actuacion_in: ActuacionCreate, background_tasks: BackgroundTasks):
    # 1. Tu código normal para guardar en la base de datos
    # nueva_actuacion = crud.crear_actuacion(db, actuacion_in)
    
    # 2. Preparamos los datos que queremos mandar al email
    datos_para_n8n = {
        "titulo": actuacion_in.titulo,
        "fecha": str(actuacion_in.fecha),
        "cliente": actuacion_in.cliente_nombre,
        "descripcion": actuacion_in.descripcion
    }
    
    # 3. Le decimos a FastAPI que envíe los datos a n8n en segundo plano
    # (Para que el usuario de la web no tenga que esperar a que el email se envíe)
    background_tasks.add_task(enviar_a_n8n, datos_para_n8n)
    
    return {"message": "Actuación creada con éxito"}

# Función que realmente envía los datos
async def enviar_a_n8n(datos: dict):
    async with httpx.AsyncClient() as client:
        try:
            # Enviamos un POST al webhook de n8n
            await client.post(N8N_WEBHOOK_URL, json=datos)
        except Exception as e:
            print(f"Error al enviar a n8n: {e}")
```

> **NOTA:** Si no tienes `httpx` instalado en tu backend, instálalo ejecutando `pip install httpx` en tu terminal del backend y añade `httpx` a tu `requirements.txt`.

---

## 🔗 PASO 3: Probar la conexión (¡Muy Importante!)

Antes de configurar el envío del email, necesitamos que n8n reciba una "prueba" para saber qué forma tienen tus datos.

1. Vuelve a **n8n**.
2. Haz clic en el nodo Webhook y pulsa el botón **"Listen for test event"** (Escuchar evento de prueba). n8n se quedará "pensando".
3. Ahora, ve a tu aplicación web (el frontend) y **crea una nueva actuación real** (o usa Swagger interactivo en `http://localhost:8000/docs` para hacer la petición a tu API).
4. Vuelve a n8n. Si todo ha ido bien, ¡magia! Verás que n8n ha capturado los datos (título, fecha, cliente, etc.) y te los muestra en formato JSON.
5. Cierra el panel del Webhook.

---

## ✉️ PASO 4: Configurar el envío del Email en n8n

Como n8n ya conoce la estructura de tus datos, es hora de montar el correo.

1. En n8n, al lado derecho de tu nodo Webhook, verás un pequeño símbolo de un `+`. Haz clic en él y arrastra para añadir un nuevo nodo.
2. Busca **`Gmail`**, **`Send Email`** (SMTP genérico) o el servicio que vayas a usar. Para este ejemplo, imaginemos que usas **Gmail**.
3. Selecciona **"Send Email"** como acción.

### 4.1 Configurar tus credenciales de correo
1. En el nodo de Gmail, te pedirá "Credential to connect with". Haz clic en **Create New Credential**.
2. Sigue los pasos para conectar tu cuenta de Google (probablemente te pedirá iniciar sesión con tu cuenta de Gmail y darle permisos a n8n).

### 4.2 Rellenar los campos del correo
Ahora vamos a escribir el correo, utilizando los datos que nos pasaron en el paso 3.

- **To (Para):** Escribe el correo de quien debe recibir el aviso (ej: `admin@toneleros.com`).
- **Subject (Asunto):** Haz clic en el icono de expresión (las herramientas) junto al campo y selecciona **Add Expression**. 
  - Verás un menú a la izquierda con los datos del webhook.
  - Puedes escribir algo como: `¡Nueva Actuación Confirmada: ` y luego hacer clic en el `titulo` que viene del Webhook. Quedará algo como: `¡Nueva Actuación Confirmada: {{$json.titulo}}!`
- **Message (Mensaje):** Haz lo mismo. Selecciona **Add Expression** y escribe el cuerpo del correo. Ejemplo:

```text
Hola equipo,

Se ha registrado una nueva actuación en el sistema:

- Título: {{$json.titulo}}
- Fecha: {{$json.fecha}}
- Cliente: {{$json.cliente}}
- Notas: {{$json.descripcion}}

Saludos,
El sistema Toneleros.
```

4. Cierra la ventana del nodo de Gmail.
5. Para comprobar que el correo funciona, pulsa el botón play (▶) que está directamente encima del nodo de Gmail (Test node). ¡Debería llegarte un email de prueba con los datos que mandaste en el Paso 3!

---

## 🚀 PASO 5: Pasar a Producción (Paso Final)

Ahora mismo, tu flujo solo funciona si le das manualmente al botón "Test". Hay que dejarlo siempre encendido.

1. Abre tu nodo **Webhook** en n8n.
2. Ve a **Webhook URLs** y haz clic en la pestaña **`Production`**.
3. Copia esa URL (verás que la palabra `webhook-test` cambió a solo `webhook`).
4. Ve a tu código **FastAPI** (Paso 2) y cambia la variable `N8N_WEBHOOK_URL` por esta nueva URL de producción.
5. Vuelve a **n8n** y en la esquina superior derecha de la pantalla, busca un interruptor (Toggle) que dice **"Inactive"** y pásalo a **"Active"**.

¡Listo! 🎉 Has creado tu primer workflow. 

### Resumen de lo que has logrado:
A partir de ahora, n8n estará ejecutándose silenciosamente en segundo plano. Cada vez que FastAPI detecte que se guarda una actuación, le enviará un mensaje HTTP silencioso a la URL de producción de n8n, y n8n disparará instantáneamente el correo con todos los detalles.
