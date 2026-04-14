from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ExpenseCreate(BaseModel):
    concepto: str
    cantidad: float
    observaciones: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    concepto: str
    cantidad: float
    observaciones: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FinanceSummary(BaseModel):
    gross_total: float
    gross_past: float
    gross_future: float
    per_member: float
