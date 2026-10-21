from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class VacationBase(BaseModel):
    member_name: str
    start_date: date
    end_date: Optional[date] = None
    is_single_day: bool = False
    description: Optional[str] = None

class VacationCreate(BaseModel):
    member_name: Optional[str] = None
    member_names: Optional[List[str]] = None
    start_date: date
    end_date: Optional[date] = None
    is_single_day: bool = False
    description: Optional[str] = None

class VacationUpdate(BaseModel):
    member_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_single_day: Optional[bool] = None
    description: Optional[str] = None

class VacationResponse(VacationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
