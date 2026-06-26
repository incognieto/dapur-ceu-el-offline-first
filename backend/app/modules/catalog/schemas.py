from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = Field(pattern="^(kue_basah|kue_kering|bolu)$")
    price: Decimal = Field(gt=0)
    available: bool = True
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(min_length=2, max_length=160, default=None)
    category: str | None = Field(pattern="^(kue_basah|kue_kering|bolu)$", default=None)
    price: Decimal | None = Field(gt=0, default=None)
    available: bool | None = None
    image_url: str | None = None
