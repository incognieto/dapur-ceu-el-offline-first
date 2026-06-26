from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ProductRead(BaseModel):
    id: UUID
    name: str
    category: str
    price: Decimal
    available: bool
    image_url: str | None = None

    model_config = {"from_attributes": True}


class IngredientRead(BaseModel):
    id: UUID
    name: str
    unit: str
    stock_current: Decimal
    stock_minimum: Decimal

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0)
    item_note: str | None = None


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_contact: str | None = None
    order_type: str = Field(pattern="^(satuan|bulk)$")
    needed_at: date | None = None
    note: str | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    product_id: UUID
    product_name: str
    quantity: int
    item_note: str | None = None


class OrderRead(BaseModel):
    id: UUID
    customer_name: str
    customer_contact: str | None
    order_type: str
    needed_at: date | None
    status: str
    note: str | None
    stock_estimation: dict
    created_at: datetime | None = None
    items: list[OrderItemRead]


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(dikonfirmasi|diproses|siap_diambil|selesai|dibatalkan)$")


class StockAdjustmentCreate(BaseModel):
    ingredient_id: UUID
    kind: str = Field(pattern="^(masuk|keluar|koreksi)$")
    quantity: Decimal = Field(gt=0)
    note: str | None = None


class StockMovementRead(BaseModel):
    id: UUID
    ingredient_name: str
    kind: str
    quantity: Decimal
    note: str | None = None
    created_at: datetime | None = None

