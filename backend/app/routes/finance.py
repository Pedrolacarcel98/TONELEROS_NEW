from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List
from app.db.database import get_db
from app.models.event import Event
from app.models.expense import Expense
from app.schemas.finance_schema import ExpenseCreate, ExpenseResponse, FinanceSummary

router = APIRouter(prefix="/api/finance", tags=["finance"])


@router.get("/summary", response_model=FinanceSummary)
def get_summary(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    # gross total
    gross_total = db.query(func.coalesce(func.sum(Event.presupuesto), 0)).scalar() or 0
    # past
    gross_past = db.query(func.coalesce(func.sum(Event.presupuesto), 0)).filter(Event.fecha <= now).scalar() or 0
    # future
    gross_future = db.query(func.coalesce(func.sum(Event.presupuesto), 0)).filter(Event.fecha > now).scalar() or 0

    per_member = gross_total / 4.0 if gross_total else 0.0

    return {
        "gross_total": float(gross_total),
        "gross_past": float(gross_past),
        "gross_future": float(gross_future),
        "per_member": float(per_member),
    }


@router.get("/expenses", response_model=List[ExpenseResponse])
def list_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Expense).order_by(Expense.created_at.desc()).all()
    return expenses


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    try:
        exp = Expense(concepto=payload.concepto, cantidad=payload.cantidad, observaciones=payload.observaciones)
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/expenses/{expense_id}', response_model=ExpenseResponse)
def update_expense(expense_id: int, payload: ExpenseCreate, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail='Expense not found')
    try:
        exp.concepto = payload.concepto
        exp.cantidad = payload.cantidad
        exp.observaciones = payload.observaciones
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/expenses/{expense_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail='Expense not found')
    try:
        db.delete(exp)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
