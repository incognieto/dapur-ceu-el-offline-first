from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class IngredientBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    unit: str = Field(min_length=1, max_length=24)
    stock_minimum: Decimal = Field(ge=0, default=Decimal("0.0"))


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: str | None = Field(min_length=2, max_length=160, default=None)
    unit: str | None = Field(min_length=1, max_length=24, default=None)
    stock_minimum: Decimal | None = Field(ge=0, default=None)


class RecipeBase(BaseModel):
    ingredient_id: UUID
    quantity_per_unit: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=24)


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    ingredient_id: UUID | None = None
    quantity_per_unit: Decimal | None = Field(gt=0, default=None)
    unit: str | None = Field(min_length=1, max_length=24, default=None)


class RecipeRead(BaseModel):
    id: UUID
    product_id: UUID
    ingredient_id: UUID
    ingredient_name: str
    quantity_per_unit: Decimal
    unit: str

    model_config = {"from_attributes": True}
