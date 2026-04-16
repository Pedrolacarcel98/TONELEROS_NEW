from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.event import Event
from app.schemas.event_schema import EventCreate, EventResponse
from datetime import datetime

router = APIRouter(prefix="/api/events", tags=["events"])


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
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
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
            estado=payload.estado,
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)
        return ev
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventCreate, db: Session = Depends(get_db)):
    """Update an existing event"""
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
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
