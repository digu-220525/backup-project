from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field


class ChangeRequestCreate(BaseModel):
    project_id: int
    description: str = Field(..., min_length=10)
    extra_amount: float = Field(0.0, ge=0)
    deadline: Optional[date] = None


class CounterOfferCreate(BaseModel):
    amount: float = Field(..., ge=0)


class ChangeRequestOut(BaseModel):
    id: int
    project_id: int
    client_id: int
    freelancer_id: int
    description: str
    extra_amount: float
    deadline: Optional[date] = None
    status: str
    extra_escrow_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
