from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from auth.service import get_current_user
from auth.schemas import UserOut
from change_requests import schemas, service

router = APIRouter()


@router.post("", response_model=schemas.ChangeRequestOut, status_code=201)
async def create_change_request(
    data: schemas.ChangeRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "client":
        raise HTTPException(403, "Only clients can create change requests")
    return await service.create_change_request(db, data, current_user.user_id)


@router.get("/project/{project_id}", response_model=List[schemas.ChangeRequestOut])
async def list_for_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    return await service.get_for_project(db, project_id)


@router.put("/{cr_id}/accept", response_model=schemas.ChangeRequestOut)
async def accept_change_request(
    cr_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "freelancer":
        raise HTTPException(403, "Only freelancers can accept change requests")
    return await service.freelancer_respond(db, cr_id, current_user.user_id, accept=True)


@router.put("/{cr_id}/reject", response_model=schemas.ChangeRequestOut)
async def reject_change_request(
    cr_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    # Both clients and freelancers can reject a request
    # Clients use this to reject a counter offer
    return await service.freelancer_respond(db, cr_id, current_user.user_id, accept=False)


@router.put("/{cr_id}/counter", response_model=schemas.ChangeRequestOut)
async def counter_change_request(
    cr_id: int,
    data: schemas.CounterOfferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "freelancer":
        raise HTTPException(403, "Only freelancers can make a counter offer")
    return await service.freelancer_counter_offer(db, cr_id, current_user.user_id, data.amount)


@router.put("/{cr_id}/accept-counter", response_model=schemas.ChangeRequestOut)
async def accept_counter(
    cr_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "client":
        raise HTTPException(403, "Only clients can accept counter offers")
    return await service.client_accept_counter(db, cr_id, current_user.user_id)


@router.put("/{cr_id}/pay", response_model=schemas.ChangeRequestOut)
async def pay_change_request(
    cr_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "client":
        raise HTTPException(403, "Only clients can fund change requests")
    return await service.client_pay(db, cr_id, current_user.user_id)


@router.put("/{cr_id}/submit-revision", response_model=schemas.ChangeRequestOut)
async def submit_revision(
    cr_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "freelancer":
        raise HTTPException(403, "Only freelancers can submit revisions")
    return await service.freelancer_submit_revision(db, cr_id, current_user.user_id)


@router.put("/{cr_id}/approve-revision", response_model=schemas.ChangeRequestOut)
async def approve_revision(
    cr_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "client":
        raise HTTPException(403, "Only clients can approve revisions")
    return await service.client_approve_revision(db, cr_id, current_user.user_id)
