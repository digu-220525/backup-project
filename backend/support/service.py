from sqlalchemy.ext.asyncio import AsyncSession
from .models import SupportTicket
from .schemas import SupportTicketCreate

async def create_ticket(db: AsyncSession, ticket_data: SupportTicketCreate, user_id: int = None):
    new_ticket = SupportTicket(
        user_id=user_id,
        subject=ticket_data.subject,
        category=ticket_data.category,
        description=ticket_data.description
    )
    db.add(new_ticket)
    await db.flush() # Ensure ticket_id is generated
    await db.refresh(new_ticket)
    return new_ticket
