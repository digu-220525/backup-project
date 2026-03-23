from typing import Optional
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, case
from jobs.models import Job, SavedJob
from bids.models import Bid
from jobs.schemas import JobCreate, JobUpdate

async def create_job(db: AsyncSession, job: JobCreate, client_id: int):
    db_job = Job(
        client_id=client_id,
        title=job.title,
        description=job.description,
        budget=job.budget,
        deadline=job.deadline,
        category=job.category,
        experience_level=job.experience_level
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

async def get_jobs(db: AsyncSession, status: Optional[str] = None):
    # Using outer join with Bid to count bids and unread bids per job
    query = (
        select(
            Job,
            func.count(Bid.bid_id).label('bid_count'),
            func.sum(case((Bid.is_read == False, 1), else_=0)).label('unread_bid_count')
        )
        .outerjoin(Bid, Job.job_id == Bid.job_id)
        .group_by(Job.job_id)
    )
    if status:
        query = query.where(Job.status == status)
    
    result = await db.execute(query)
    rows = result.all()
    jobs = []
    for job, count, unread in rows:
        setattr(job, 'bid_count', count)
        setattr(job, 'unread_bid_count', unread or 0)
        jobs.append(job)
    return jobs

async def get_job(db: AsyncSession, job_id: int):
    query = (
        select(
            Job,
            func.count(Bid.bid_id).label('bid_count'),
            func.sum(case((Bid.is_read == False, 1), else_=0)).label('unread_bid_count')
        )
        .outerjoin(Bid, Job.job_id == Bid.job_id)
        .where(Job.job_id == job_id)
        .group_by(Job.job_id)
    )
    result = await db.execute(query)
    row = result.first()
    if row:
        job, count, unread = row
        setattr(job, 'bid_count', count)
        setattr(job, 'unread_bid_count', unread or 0)
        return job
    return None

async def update_job(db: AsyncSession, job_id: int, obj_in: JobUpdate):
    db_job = await get_job(db, job_id)
    if db_job:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_job, field, update_data[field])
        await db.commit()
        await db.refresh(db_job)
    return db_job

async def toggle_saved_job(db: AsyncSession, job_id: int, user_id: int):
    # Check if already saved
    result = await db.execute(select(SavedJob).where(SavedJob.job_id == job_id, SavedJob.user_id == user_id))
    saved_job = result.scalars().first()
    
    if saved_job:
        # Unsave
        await db.execute(delete(SavedJob).where(SavedJob.saved_id == saved_job.saved_id))
        await db.commit()
        return {"status": "unsaved"}
    else:
        # Save
        new_saved_job = SavedJob(job_id=job_id, user_id=user_id)
        db.add(new_saved_job)
        await db.commit()
        return {"status": "saved"}

async def get_saved_jobs(db: AsyncSession, user_id: int):
    # Get all jobs saved by the user
    query = select(Job).join(SavedJob, Job.job_id == SavedJob.job_id).where(SavedJob.user_id == user_id).order_by(SavedJob.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()
