import uuid
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(160))
    unit: Mapped[str] = mapped_column(String(24))
    stock_current: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    stock_minimum: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    recipes = relationship("Recipe", back_populates="ingredient")


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"))
    ingredient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ingredients.id"))
    quantity_per_unit: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    unit: Mapped[str] = mapped_column(String(24))

    product = relationship("Product", back_populates="recipes")
    ingredient = relationship("Ingredient", back_populates="recipes")


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingredient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ingredients.id"))
    kind: Mapped[str] = mapped_column(String(20))
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    reference_type: Mapped[str | None] = mapped_column(String(32))
    reference_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    note: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    ingredient = relationship("Ingredient")

