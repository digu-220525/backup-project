from typing import Optional
from datetime import date, datetime
from sqlalchemy import Integer, String, Text, Numeric, Date, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class ChangeRequest(Base):
    __tablename__ = "change_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False
    )
    freelancer_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)
    extra_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # pending_freelancer → accepted / rejected
    # accepted → payment_pending → locked
    # locked → revised_submitted → approved / disputed
    status: Mapped[str] = mapped_column(
        String(30), server_default="pending_freelancer", nullable=False
    )
    extra_escrow_status: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True  # None | LOCKED | RELEASED
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
