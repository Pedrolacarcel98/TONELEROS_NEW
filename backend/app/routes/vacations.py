from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.vacation import Vacation
from app.schemas.vacation_schema import VacationCreate, VacationResponse

router = APIRouter(prefix="/api/vacations", tags=["vacations"])

@router.get("/", response_model=List[VacationResponse])
def list_vacations(db: Session = Depends(get_db)):
    return db.query(Vacation).order_by(Vacation.start_date.asc()).all()

@router.post("/", response_model=VacationResponse, status_code=status.HTTP_201_CREATED)
def create_vacation(payload: VacationCreate, db: Session = Depends(get_db)):
    if not payload.is_single_day and payload.end_date and payload.start_date > payload.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin"
        )
        
    db_vacation = Vacation(
        member_name=payload.member_name,
        start_date=payload.start_date,
        end_date=payload.start_date if payload.is_single_day else payload.end_date,
        is_single_day=payload.is_single_day,
        description=payload.description
    )
    db.add(db_vacation)
    db.commit()
    db.refresh(db_vacation)
    return db_vacation

@router.delete("/{vacation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vacation(vacation_id: int, db: Session = Depends(get_db)):
    vacation = db.query(Vacation).filter(Vacation.id == vacation_id).first()
    if not vacation:
        raise HTTPException(status_code=404, detail="Vacaciones no encontradas")
    db.delete(vacation)
    db.commit()
    return
