from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SupportTicketCreate(BaseModel):
    subject: str
    category: str
    description: str

class SupportTicketOut(BaseModel):
    ticket_id: int
    user_id: Optional[int]
    subject: str
    category: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
