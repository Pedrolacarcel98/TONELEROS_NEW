from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.client import Client
from app.schemas.client_schema import ClientCreate, ClientResponse

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.get("/", response_model=List[ClientResponse])
def list_clients(db: Session = Depends(get_db)):
    return db.query(Client).order_by(Client.nombre.asc()).all()

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    try:
        client = Client(
            nombre=payload.nombre,
            email=payload.email,
            telefono=payload.telefono,
            direccion=payload.direccion,
            notas=payload.notas
        )
        db.add(client)
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, payload: ClientCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    try:
        client.nombre = payload.nombre
        client.email = payload.email
        client.telefono = payload.telefono
        client.direccion = payload.direccion
        client.notas = payload.notas
        
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    try:
        db.delete(client)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
