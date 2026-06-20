import httpx
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.event import Event
from app.schemas.event_schema import EventCreate, EventResponse
from datetime import datetime

router = APIRouter(prefix="/api/events", tags=["events"])

# URL de webhook de n8n
N8N_WEBHOOK_URL_LOCAL = "http://localhost:5678/webhook-test/new_event"
N8N_WEBHOOK_URL_DOCKER = "http://host.docker.internal:5678/webhook-test/new_event"

async def enviar_a_n8n(datos: dict):
    async with httpx.AsyncClient() as client:
        try:
            # Primero intentamos con localhost (si ejecutas Python manual sin Docker)
            try:
                await client.post(N8N_WEBHOOK_URL_LOCAL, json=datos, timeout=5.0)
            except httpx.ConnectError:
                # Si falla la conexión, intentamos con host.docker.internal (si ejecutas con Docker)
                await client.post(N8N_WEBHOOK_URL_DOCKER, json=datos, timeout=5.0)
            print("Webhook enviado a n8n correctamente.")
        except Exception as e:
            print(f"Error al enviar a n8n: {e}")


@router.get("/", response_model=List[EventResponse])
def list_events(history: bool = False, db: Session = Depends(get_db)):
    """
    Return events.
    - If history=False (default): Returns upcoming events (fecha >= today) and not archived.
    - If history=True: Returns past events (fecha < today) or already archived ones.
    """
    now = datetime.now()
    
    # Auto-archive past events that aren't archived yet
    # We do this on the fly when listing
    past_events = db.query(Event).filter(
        Event.fecha < now,
        Event.archivado == False
    ).all()
    
    if past_events:
        for event in past_events:
            event.archivado = True
        db.commit()

    if history:
        # Show history: past dates or explicitly archived
        events = db.query(Event).filter(
            (Event.fecha < now) | (Event.archivado == True)
        ).order_by(Event.fecha.desc()).all()
    else:
        # Show upcoming: future dates and not explicitly archived
        events = db.query(Event).filter(
            Event.fecha >= now,
            Event.archivado == False
        ).order_by(Event.fecha.asc()).all()
        
    return events


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Create a new event"""
    try:
        ev = Event(
            tipo=payload.tipo,
            fecha=payload.fecha,
            direccion=payload.direccion,
            pContacto=payload.pContacto,
            tlf=payload.tlf,
            presupuesto=payload.presupuesto,
            senal=payload.senal,
            observaciones=payload.observaciones,
            equipo=payload.equipo,
            estado=payload.estado
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)
        
        from fastapi.encoders import jsonable_encoder
        event_data = jsonable_encoder(ev)
        
        import urllib.parse
        from datetime import timedelta
        
        # Crear formato de fecha para calendarios (YYYYMMDDTHHmmss sin zonas horarias para local)
        fecha_dt = payload.fecha
        fecha_start = fecha_dt.strftime("%Y%m%dT%H%M%S")
        fecha_end = (fecha_dt + timedelta(hours=2)).strftime("%Y%m%dT%H%M%S") # Asumimos 2h por defecto
        
        # Generar enlace para Google Calendar
        gcal_url = (
            f"https://calendar.google.com/calendar/render?action=TEMPLATE"
            f"&text={urllib.parse.quote('Actuación: ' + payload.tipo)}"
            f"&dates={fecha_start}/{fecha_end}"
            f"&details={urllib.parse.quote('Contacto: ' + payload.pContacto + ' | Teléfono: ' + str(payload.tlf))}"
            f"&location={urllib.parse.quote(payload.direccion)}"
        )
        
        # Enlace genérico (descarga un .ics compatible con Apple Calendar, Outlook, etc.)
        ics_url = (
            f"https://calndr.link/d/event/"
            f"?service=apple"
            f"&start={fecha_start}"
            f"&end={fecha_end}"
            f"&title={urllib.parse.quote('Actuación: ' + payload.tipo)}"
            f"&location={urllib.parse.quote(payload.direccion)}"
        )
        
        # Preparamos los datos para enviar a n8n
        datos_para_n8n = {
            "titulo": f"Nueva actuación: {payload.tipo}",
            "fecha": str(payload.fecha),
            "cliente": payload.pContacto,
            "direccion": payload.direccion,
            "tlf": payload.tlf,
            "descripcion": payload.observaciones,
            "estado": payload.estado,
            "event_id": ev.id,
            "equipo": payload.equipo,
            "gcal_url": gcal_url,
            "ics_url": ics_url
        }
        
        # Enviar a n8n en segundo plano SOLAMENTE si el estado es CONFIRMADO
        if payload.estado == "CONFIRMADO":
            background_tasks.add_task(enviar_a_n8n, datos_para_n8n)
        
        # Opcional: Dispatch webhook general (por si se usa en el futuro)
        from app.services.webhook_service import dispatch_event
        dispatch_event("event.created", event_data)
        
        return ev
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Update an existing event"""
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    estado_anterior = ev.estado
    
    try:
        ev.tipo = payload.tipo
        ev.fecha = payload.fecha
        ev.direccion = payload.direccion
        ev.pContacto = payload.pContacto
        ev.tlf = payload.tlf
        ev.presupuesto = payload.presupuesto
        ev.senal = payload.senal
        ev.observaciones = payload.observaciones
        ev.equipo = payload.equipo
        ev.estado = payload.estado
        
        db.commit()
        db.refresh(ev)
        
        # Si el evento ha pasado a CONFIRMADO en esta edición, disparamos n8n
        if estado_anterior != "CONFIRMADO" and payload.estado == "CONFIRMADO":
            import urllib.parse
            from datetime import timedelta
            
            fecha_dt = payload.fecha
            fecha_start = fecha_dt.strftime("%Y%m%dT%H%M%S")
            fecha_end = (fecha_dt + timedelta(hours=2)).strftime("%Y%m%dT%H%M%S")
            
            gcal_url = (
                f"https://calendar.google.com/calendar/render?action=TEMPLATE"
                f"&text={urllib.parse.quote('Actuación: ' + payload.tipo)}"
                f"&dates={fecha_start}/{fecha_end}"
                f"&details={urllib.parse.quote('Contacto: ' + payload.pContacto + ' | Teléfono: ' + str(payload.tlf))}"
                f"&location={urllib.parse.quote(payload.direccion)}"
            )
            
            ics_url = (
                f"https://calndr.link/d/event/"
                f"?service=apple"
                f"&start={fecha_start}"
                f"&end={fecha_end}"
                f"&title={urllib.parse.quote('Actuación: ' + payload.tipo)}"
                f"&location={urllib.parse.quote(payload.direccion)}"
            )
            
            datos_para_n8n = {
                "titulo": f"Actuación Confirmada: {payload.tipo}",
                "fecha": str(payload.fecha),
                "cliente": payload.pContacto,
                "direccion": payload.direccion,
                "tlf": payload.tlf,
                "descripcion": payload.observaciones,
                "estado": payload.estado,
                "event_id": ev.id,
                "equipo": payload.equipo,
                "gcal_url": gcal_url,
                "ics_url": ics_url
            }
            background_tasks.add_task(enviar_a_n8n, datos_para_n8n)
            
        return ev
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event"""
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    try:
        db.delete(ev)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
