from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import extract, or_
from typing import List, Dict, Any
import datetime
from app.db.database import get_db
from app.models.vacation import Vacation
from app.schemas.vacation_schema import VacationCreate, VacationUpdate, VacationResponse

router = APIRouter(prefix="/api/vacations", tags=["vacations"])

OFFICIAL_MEMBERS = ["Pedro", "Pipa", "Alfonso", "Luis"]


def _normalize_and_cleanup(db: Session, today: datetime.date):
    """Normaliza end_date nulos y limpia registros de años anteriores para mantener la BD limpia."""
    null_end = db.query(Vacation).filter(Vacation.end_date.is_(None)).all()
    dirty = False
    for v in null_end:
        v.end_date = v.start_date
        dirty = True

    # Borrar automáticamente registros de años anteriores al actual
    year_start = datetime.date(today.year, 1, 1)
    deleted = db.query(Vacation).filter(Vacation.end_date < year_start).delete(synchronize_session=False)
    if dirty or deleted:
        db.commit()


def _check_overlap(
    db: Session,
    member_name: str,
    start_date: datetime.date,
    end_date: datetime.date,
    exclude_id: int = None
):
    """Verifica si un integrante ya tiene vacaciones registradas que se solapen con el rango indicado."""
    query = db.query(Vacation).filter(
        Vacation.member_name == member_name,
        Vacation.start_date <= end_date,
        Vacation.end_date >= start_date
    )
    if exclude_id is not None:
        query = query.filter(Vacation.id != exclude_id)

    existing = query.first()
    if existing:
        fmt_start = existing.start_date.strftime("%d/%m/%Y")
        fmt_end = (existing.end_date or existing.start_date).strftime("%d/%m/%Y")
        rango = fmt_start if fmt_start == fmt_end else f"{fmt_start} - {fmt_end}"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{member_name} ya tiene vacaciones registradas en esas fechas ({rango})"
        )


@router.get("/", response_model=List[VacationResponse])
def list_vacations(include_past: bool = False, db: Session = Depends(get_db)):
    today = datetime.date.today()
    _normalize_and_cleanup(db, today)

    query = db.query(Vacation)
    if not include_past:
        # Solo mostrar vacaciones vigentes o futuras (hasta el último día del periodo inclusive;
        # al día siguiente, cuando today > end_date, desaparecen automáticamente)
        query = query.filter(Vacation.end_date >= today)

    return query.order_by(Vacation.start_date.asc(), Vacation.id.asc()).all()


@router.get("/summary", response_model=List[Dict[str, Any]])
def get_vacation_summary(year: int = None, db: Session = Depends(get_db)):
    today = datetime.date.today()
    if not year:
        year = today.year

    year_start = datetime.date(year, 1, 1)
    year_end = datetime.date(year, 12, 31)

    vacations = db.query(Vacation).filter(
        or_(
            extract('year', Vacation.start_date) == year,
            extract('year', Vacation.end_date) == year
        )
    ).all()

    summary = {m: {"total_days": 0, "periods_count": 0} for m in OFFICIAL_MEMBERS}

    for v in vacations:
        v_end = v.end_date or v.start_date
        eff_start = max(v.start_date, year_start)
        eff_end = min(v_end, year_end)
        if eff_start <= eff_end:
            days = (eff_end - eff_start).days + 1
            if v.member_name not in summary:
                summary[v.member_name] = {"total_days": 0, "periods_count": 0}
            summary[v.member_name]["total_days"] += days
            summary[v.member_name]["periods_count"] += 1

    return [
        {
            "member_name": k,
            "total_days": val["total_days"],
            "periods_count": val["periods_count"]
        }
        for k, val in summary.items()
    ]


@router.post("/", response_model=VacationResponse, status_code=status.HTTP_201_CREATED)
def create_vacation(payload: VacationCreate, db: Session = Depends(get_db)):
    # Determinar integrantes a registrar (soporta 1 o varios a la vez)
    target_members = []
    if payload.member_names and len(payload.member_names) > 0:
        target_members = [m.strip() for m in payload.member_names if m and m.strip()]
    elif payload.member_name and payload.member_name.strip():
        target_members = [payload.member_name.strip()]

    if not target_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes seleccionar al menos un integrante"
        )

    actual_end_date = payload.start_date if (payload.is_single_day or not payload.end_date) else payload.end_date
    is_single = payload.is_single_day or (payload.start_date == actual_end_date)

    if payload.start_date > actual_end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin"
        )

    # Primero validamos solapamientos para todos los integrantes seleccionados
    for member in target_members:
        _check_overlap(db, member, payload.start_date, actual_end_date)

    created_records = []
    for member in target_members:
        db_vacation = Vacation(
            member_name=member,
            start_date=payload.start_date,
            end_date=actual_end_date,
            is_single_day=is_single,
            description=payload.description.strip() if payload.description else None
        )
        db.add(db_vacation)
        created_records.append(db_vacation)

    db.commit()
    for rec in created_records:
        db.refresh(rec)

    return created_records[0]


@router.put("/{vacation_id}", response_model=VacationResponse)
def update_vacation(vacation_id: int, payload: VacationUpdate, db: Session = Depends(get_db)):
    vacation = db.query(Vacation).filter(Vacation.id == vacation_id).first()
    if not vacation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacaciones no encontradas")

    new_member = payload.member_name.strip() if payload.member_name else vacation.member_name
    new_start = payload.start_date if payload.start_date is not None else vacation.start_date
    new_is_single = payload.is_single_day if payload.is_single_day is not None else vacation.is_single_day

    if new_is_single:
        new_end = new_start
    else:
        new_end = payload.end_date if payload.end_date is not None else (vacation.end_date or new_start)

    if new_start > new_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin"
        )

    _check_overlap(db, new_member, new_start, new_end, exclude_id=vacation_id)

    vacation.member_name = new_member
    vacation.start_date = new_start
    vacation.end_date = new_end
    vacation.is_single_day = new_is_single or (new_start == new_end)
    if payload.description is not None:
        vacation.description = payload.description.strip() if payload.description.strip() else None

    db.commit()
    db.refresh(vacation)
    return vacation


@router.delete("/{vacation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vacation(vacation_id: int, db: Session = Depends(get_db)):
    vacation = db.query(Vacation).filter(Vacation.id == vacation_id).first()
    if not vacation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacaciones no encontradas")
    db.delete(vacation)
    db.commit()
    return
