from typing import List
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from payments.models import Transaction
from payments.schemas import TransactionCreate
from projects.service import get_project
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def hold_payment(db: AsyncSession, transaction: TransactionCreate, client_id: int):
    # Verify project exists and belongs to the client
    project = await get_project(db, transaction.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the project client can hold payment")
        
    db_transaction = Transaction(
        project_id=project.project_id,
        client_id=client_id,
        freelancer_id=project.freelancer_id,
        amount=transaction.amount,
        status='held'
    )
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)

    # Notify both parties
    # For Client: Recent activity
    await create_notification(db, NotificationCreate(
        user_id=client_id,
        title="Payment Processed",
        message=f"You have successfully authorized payment of ${transaction.amount} for Mission #{project.project_id}.",
        link=f"/projects/{project.project_id}"
    ))
    
    return db_transaction

async def release_payment(db: AsyncSession, project_id: int, client_id: int):
    # Get the held transaction for this project
    query = select(Transaction).where(
        Transaction.project_id == project_id,
        Transaction.status == 'held'
    )
    result = await db.execute(query)
    transaction = result.scalars().first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="No held payment found for this project")
    if transaction.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the client can release payment")
        
    transaction.status = 'released'
    await db.commit()
    await db.refresh(transaction)
    return transaction

async def get_transaction_history(db: AsyncSession, user_id: int):
    query = select(Transaction).where(or_(Transaction.client_id == user_id, Transaction.freelancer_id == user_id))
    result = await db.execute(query)
    return result.scalars().all()
