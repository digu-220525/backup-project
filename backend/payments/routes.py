from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from payments import schemas, service
from auth.service import get_current_user
from auth.schemas import UserOut

router = APIRouter()

@router.post("", response_model=schemas.TransactionOut, status_code=status.HTTP_201_CREATED)
async def hold_payment(
    transaction: schemas.TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can hold payments.")
    return await service.hold_payment(db=db, transaction=transaction, client_id=current_user.user_id)

@router.post("/release/{project_id}", response_model=schemas.TransactionOut)
async def release_payment(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can release payments.")
    return await service.release_payment(db=db, project_id=project_id, client_id=current_user.user_id)

@router.get("/history", response_model=List[schemas.TransactionOut])
async def transaction_history(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    return await service.get_transaction_history(db=db, user_id=current_user.user_id)
