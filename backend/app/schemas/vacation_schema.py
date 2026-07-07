from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class VacationBase(BaseModel):
    member_name: str
    start_date: date
    end_date: Optional[date] = None
    is_single_day: bool = False
    description: Optional[str] = None

class VacationCreate(VacationBase):
    pass

class VacationResponse(VacationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
