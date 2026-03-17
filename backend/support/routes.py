from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from auth.service import get_current_user
from auth.schemas import User
from . import schemas, service

router = APIRouter()

@router.post("/tickets", response_model=schemas.SupportTicketOut, status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    ticket: schemas.SupportTicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a support ticket. Only accessible to logged-in users.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to submit a report"
        )
    
    return await service.create_ticket(db=db, ticket_data=ticket, user_id=current_user.user_id)
