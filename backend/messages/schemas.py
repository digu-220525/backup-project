from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class MessageCreate(BaseModel):
    content: str
    attachments: Optional[List[Dict[str, Any]]] = []

class MessageOut(BaseModel):
    message_id: int
    project_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime
    attachments: Optional[List[Dict[str, Any]]] = []
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True
