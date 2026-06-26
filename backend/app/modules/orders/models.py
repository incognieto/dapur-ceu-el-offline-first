import uuid

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_name: Mapped[str] = mapped_column(String(120))
    customer_contact: Mapped[str | None] = mapped_column(String(80))
    order_type: Mapped[str] = mapped_column(String(20))
    needed_at = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(32), default="menunggu_konfirmasi")
    note: Mapped[str | None] = mapped_column(Text)
    stock_estimation: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    item_note: Mapped[str | None] = mapped_column(Text)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

