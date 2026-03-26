from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from change_requests.models import ChangeRequest
from change_requests.schemas import ChangeRequestCreate
from projects.service import get_project
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

# ── Max active change requests per project ────────────────────────────────────
MAX_CHANGE_REQUESTS = 5

ACTIVE_STATUSES = {
    "pending_freelancer", "accepted", "payment_pending", "locked", "revised_submitted", "counter_offered"
}


async def _get_active(db: AsyncSession, project_id: int) -> ChangeRequest | None:
    """Return the single active (non-terminal) change request, if any."""
    result = await db.execute(
        select(ChangeRequest)
        .where(ChangeRequest.project_id == project_id)
        .where(ChangeRequest.status.in_(ACTIVE_STATUSES))
    )
    return result.scalars().first()


async def create_change_request(
    db: AsyncSession, data: ChangeRequestCreate, client_id: int
) -> ChangeRequest:
    project = await get_project(db, data.project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if project.client_id != client_id:
        raise HTTPException(403, "Only the project client can request changes")
    if project.status != "work_submitted":
        raise HTTPException(400, "Change requests are only allowed after the initial work is submitted")

    # Prevent duplicate / overlapping active requests
    active = await _get_active(db, data.project_id)
    if active:
        raise HTTPException(409, "A change request is already in progress for this project")

    # Optional hard limit on total requests
    total_res = await db.execute(
        select(ChangeRequest).where(ChangeRequest.project_id == data.project_id)
    )
    if len(total_res.scalars().all()) >= MAX_CHANGE_REQUESTS:
        raise HTTPException(400, f"Maximum of {MAX_CHANGE_REQUESTS} change requests per project reached")

    cr = ChangeRequest(
        project_id=data.project_id,
        client_id=client_id,
        freelancer_id=project.freelancer_id,
        description=data.description,
        extra_amount=data.extra_amount,
        deadline=data.deadline,
        status="pending_freelancer",
    )
    db.add(cr)
    await db.commit()
    await db.refresh(cr)

    await create_notification(db, NotificationCreate(
        user_id=project.freelancer_id,
        title="Change Request Received",
        message=f"Client has requested additional changes for Project #{project.project_id} with extra payment ${data.extra_amount}.",
        link=f"/projects/{project.project_id}",
    ))
    return cr


async def get_for_project(db: AsyncSession, project_id: int) -> List[ChangeRequest]:
    result = await db.execute(
        select(ChangeRequest)
        .where(ChangeRequest.project_id == project_id)
        .order_by(ChangeRequest.created_at.desc())
    )
    return result.scalars().all()


async def freelancer_respond(
    db: AsyncSession, cr_id: int, freelancer_id: int, accept: bool
) -> ChangeRequest:
    cr = await _get_cr(db, cr_id)
    if cr.freelancer_id != freelancer_id:
        raise HTTPException(403, "Not authorized")
    if cr.status != "pending_freelancer":
        raise HTTPException(400, "Change request is not awaiting your response")

    if accept:
        cr.status = "payment_pending"
        # Notify client to pay
        await create_notification(db, NotificationCreate(
            user_id=cr.client_id,
            title="Change Request Accepted",
            message="Please deposit extra payment to proceed with changes.",
            link=f"/projects/{cr.project_id}",
        ))
    else:
        cr.status = "rejected"
        await create_notification(db, NotificationCreate(
            user_id=cr.client_id,
            title="Change Request Rejected",
            message=f"Freelancer has declined the change request for Project #{cr.project_id}.",
            link=f"/projects/{cr.project_id}",
        ))

    await db.commit()
    await db.refresh(cr)
    return cr


async def freelancer_counter_offer(
    db: AsyncSession, cr_id: int, freelancer_id: int, amount: float
) -> ChangeRequest:
    cr = await _get_cr(db, cr_id)
    if cr.freelancer_id != freelancer_id:
        raise HTTPException(403, "Not authorized")
    if cr.status != "pending_freelancer":
        raise HTTPException(400, "Change request is not awaiting your response")

    cr.status = "counter_offered"
    cr.extra_amount = amount

    await create_notification(db, NotificationCreate(
        user_id=cr.client_id,
        title="Change Request Counter Offer",
        message=f"Freelancer has countered your change request on Project #{cr.project_id} with ${amount}. Please accept or reject.",
        link=f"/projects/{cr.project_id}",
    ))

    await db.commit()
    await db.refresh(cr)
    return cr


async def client_accept_counter(
    db: AsyncSession, cr_id: int, client_id: int
) -> ChangeRequest:
    cr = await _get_cr(db, cr_id)
    if cr.client_id != client_id:
        raise HTTPException(403, "Not authorized")
    if cr.status != "counter_offered":
        raise HTTPException(400, "Not awaiting counter offer acceptance")

    cr.status = "payment_pending"
    await create_notification(db, NotificationCreate(
        user_id=cr.freelancer_id,
        title="Counter Offer Accepted",
        message=f"Client accepted your counter offer for Project #{cr.project_id}. Waiting for them to deposit funds.",
        link=f"/projects/{cr.project_id}",
    ))

    await db.commit()
    await db.refresh(cr)
    return cr


async def client_pay(
    db: AsyncSession, cr_id: int, client_id: int
) -> ChangeRequest:
    """Simulate locking the extra escrow payment."""
    cr = await _get_cr(db, cr_id)
    if cr.client_id != client_id:
        raise HTTPException(403, "Not authorized")
    if cr.status != "payment_pending":
        raise HTTPException(400, "Payment is not expected at this stage")

    cr.status = "locked"
    cr.extra_escrow_status = "LOCKED"
    await db.commit()
    await db.refresh(cr)

    await create_notification(db, NotificationCreate(
        user_id=cr.freelancer_id,
        title="Extra Payment Locked",
        message=f"Client has locked ${cr.extra_amount} for your change request on Project #{cr.project_id}. You may begin work.",
        link=f"/projects/{cr.project_id}",
    ))
    return cr


async def freelancer_submit_revision(
    db: AsyncSession, cr_id: int, freelancer_id: int
) -> ChangeRequest:
    cr = await _get_cr(db, cr_id)
    if cr.freelancer_id != freelancer_id:
        raise HTTPException(403, "Not authorized")
    if cr.status != "locked":
        raise HTTPException(400, "Extra payment must be locked before submitting revision")

    cr.status = "revised_submitted"
    await db.commit()
    await db.refresh(cr)

    await create_notification(db, NotificationCreate(
        user_id=cr.client_id,
        title="Revised Work Submitted",
        message=f"Freelancer has submitted the revised work for Project #{cr.project_id}. Please review.",
        link=f"/projects/{cr.project_id}",
    ))
    return cr


async def client_approve_revision(
    db: AsyncSession, cr_id: int, client_id: int
) -> ChangeRequest:
    cr = await _get_cr(db, cr_id)
    if cr.client_id != client_id:
        raise HTTPException(403, "Not authorized")
    if cr.status != "revised_submitted":
        raise HTTPException(400, "No revised work to approve")

    cr.status = "approved"
    cr.extra_escrow_status = "RELEASED"
    await db.commit()
    await db.refresh(cr)

    await create_notification(db, NotificationCreate(
        user_id=cr.freelancer_id,
        title="Revision Approved & Payment Released",
        message=f"Client approved your revision for Project #{cr.project_id}. Extra payment of ${cr.extra_amount} released.",
        link=f"/projects/{cr.project_id}",
    ))
    return cr


async def _get_cr(db: AsyncSession, cr_id: int) -> ChangeRequest:
    result = await db.execute(select(ChangeRequest).where(ChangeRequest.id == cr_id))
    cr = result.scalars().first()
    if not cr:
        raise HTTPException(404, "Change request not found")
    return cr
