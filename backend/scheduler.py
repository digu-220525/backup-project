import asyncio
from datetime import datetime, timedelta, time
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from database import AsyncSessionLocal
from projects.models import Project
from jobs.models import Job
from notifications.models import Notification
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def check_deadlines_and_reminders():
    while True:
        try:
            async with AsyncSessionLocal() as db:
                now = datetime.utcnow()
                
                # --- A. PROJECT DEADLINE (Freelancer) ---
                # Find all active projects
                active_projects_query = select(Project).where(Project.status == 'active').options(joinedload(Project.job))
                result = await db.execute(active_projects_query)
                active_projects = result.scalars().all()

                for project in active_projects:
                    job = project.job
                    if not job:
                        continue
                    
                    # Assume deadline is at 23:59:59 of the target date
                    deadline_dt = datetime.combine(job.deadline, time(23, 59, 59))
                    time_remaining = deadline_dt - now

                    # 1. 24 hours before deadline
                    if timedelta(hours=0) < time_remaining <= timedelta(hours=24):
                        # Check if 24h reminder exists
                        chk_24 = await db.execute(
                            select(Notification).where(
                                Notification.user_id == project.freelancer_id,
                                Notification.title == "Project Deadline Reminder (24h)",
                                Notification.message.like(f"%Project #{project.project_id}%")
                            )
                        )
                        if not chk_24.scalars().first():
                            await create_notification(db, NotificationCreate(
                                user_id=project.freelancer_id,
                                title="Project Deadline Reminder (24h)",
                                message=f"Project deadline is approaching. Please submit your work. (Project #{project.project_id})",
                                link=f"/projects/{project.project_id}"
                            ))

                    # 2. 2 hours before deadline
                    if timedelta(hours=0) < time_remaining <= timedelta(hours=2):
                        # Check if 2h reminder exists
                        chk_2 = await db.execute(
                            select(Notification).where(
                                Notification.user_id == project.freelancer_id,
                                Notification.title == "Project Deadline Reminder (2h)",
                                Notification.message.like(f"%Project #{project.project_id}%")
                            )
                        )
                        if not chk_2.scalars().first():
                            await create_notification(db, NotificationCreate(
                                user_id=project.freelancer_id,
                                title="Project Deadline Reminder (2h)",
                                message=f"Project deadline is approaching. Please submit your work. (Project #{project.project_id})",
                                link=f"/projects/{project.project_id}"
                            ))

                # --- C. CLIENT APPROVAL REMINDER ---
                # Check projects where work is submitted
                submitted_query = select(Project).where(Project.status == 'work_submitted')
                sub_result = await db.execute(submitted_query)
                submitted_projects = sub_result.scalars().all()

                for project in submitted_projects:
                    if not project.submitted_at:
                        continue
                        
                    time_since_submit = now - project.submitted_at
                    # if client hasn't responded in 24 hours
                    if time_since_submit >= timedelta(hours=24):
                        chk_approval = await db.execute(
                            select(Notification).where(
                                Notification.user_id == project.client_id,
                                Notification.title == "Approval Reminder",
                                Notification.message.like(f"%Project #{project.project_id}%")
                            )
                        )
                        if not chk_approval.scalars().first():
                            await create_notification(db, NotificationCreate(
                                user_id=project.client_id,
                                title="Approval Reminder",
                                message=f"Pending review: Please approve or request changes. (Project #{project.project_id})",
                                link=f"/projects/{project.project_id}"
                            ))

        except Exception as e:
            print(f"Scheduler error: {e}")
            
        # Run periodically (e.g., every 5 minutes in production, but here maybe every 1 minute)
        await asyncio.sleep(60)

def start_scheduler():
    asyncio.create_task(check_deadlines_and_reminders())
