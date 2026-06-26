from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status

from app.modules.orders.models import Order
from app.modules.stock.models import StockMovement
from app.modules.stock.repository import IngredientRepository, RecipeRepository, StockMovementRepository
from app.patterns.observer import DomainEvent, EventBus
from app.patterns.strategy import StrategyFactory


class StockService:
    def __init__(
        self,
        ingredients: IngredientRepository,
        recipes: RecipeRepository,
        movements: StockMovementRepository,
        event_bus: EventBus,
    ) -> None:
        self.ingredients = ingredients
        self.recipes = recipes
        self.movements = movements
        self.event_bus = event_bus
        self.strategy_factory = StrategyFactory()

    def calculate_requirements(self, items: list[tuple[UUID, int]]) -> dict[str, dict]:
        product_ids = [str(product_id) for product_id, _ in items]
        quantity_by_product = {str(product_id): quantity for product_id, quantity in items}
        requirements: dict[str, dict] = {}

        for recipe in self.recipes.for_products(product_ids):
            product_id = str(recipe.product_id)
            strategy = self.strategy_factory.for_category(recipe.product.category)
            required = recipe.quantity_per_unit * strategy.multiplier(quantity_by_product[product_id])
            ingredient_id = str(recipe.ingredient_id)
            current = requirements.setdefault(
                ingredient_id,
                {
                    "ingredient_id": ingredient_id,
                    "ingredient_name": recipe.ingredient.name,
                    "unit": recipe.ingredient.unit,
                    "required": Decimal("0"),
                    "stock_current": recipe.ingredient.stock_current,
                    "stock_minimum": recipe.ingredient.stock_minimum,
                },
            )
            current["required"] += required

        return requirements

    def estimate_availability(self, items: list[tuple[UUID, int]]) -> dict:
        requirements = self.calculate_requirements(items)
        shortages = []
        for req in requirements.values():
            if req["stock_current"] < req["required"]:
                shortages.append(
                    {
                        "ingredient_id": req["ingredient_id"],
                        "ingredient_name": req["ingredient_name"],
                        "required": str(req["required"]),
                        "available": str(req["stock_current"]),
                        "unit": req["unit"],
                    }
                )
        return {
            "available": not shortages,
            "shortages": shortages,
            "requirements": [
                {
                    "ingredient_id": req["ingredient_id"],
                    "ingredient_name": req["ingredient_name"],
                    "required": str(req["required"]),
                    "available": str(req["stock_current"]),
                    "unit": req["unit"],
                }
                for req in requirements.values()
            ],
        }

    def consume_for_order(self, order: Order) -> None:
        items = [(item.product_id, item.quantity) for item in order.items]
        requirements = self.calculate_requirements(items)
        locked = {str(item.id): item for item in self.ingredients.lock_many(list(requirements.keys()))}
        shortages = []

        for ingredient_id, req in requirements.items():
            ingredient = locked[ingredient_id]
            if ingredient.stock_current < req["required"]:
                shortages.append(
                    f"{ingredient.name}: butuh {req['required']} {ingredient.unit}, tersedia {ingredient.stock_current}"
                )

        if shortages:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "Stok tidak cukup untuk memproses pesanan.", "shortages": shortages},
            )

        for ingredient_id, req in requirements.items():
            ingredient = locked[ingredient_id]
            ingredient.stock_current -= req["required"]
            self.movements.add(
                StockMovement(
                    ingredient_id=ingredient.id,
                    kind="keluar",
                    quantity=req["required"],
                    reference_type="order",
                    reference_id=order.id,
                    note=f"Pengurangan otomatis untuk pesanan {order.id}",
                )
            )
            if ingredient.stock_current <= ingredient.stock_minimum:
                self.event_bus.publish(
                    DomainEvent(
                        "stock.critical",
                        {
                            "ingredient_name": ingredient.name,
                            "stock_current": str(ingredient.stock_current),
                            "stock_minimum": str(ingredient.stock_minimum),
                            "unit": ingredient.unit,
                        },
                    )
                )

    def adjust_stock(self, ingredient_id: UUID, kind: str, quantity: Decimal, note: str | None = None) -> StockMovement:
        ingredient = self.ingredients.lock_many([str(ingredient_id)])[0]
        if kind == "masuk":
            ingredient.stock_current += quantity
            self.event_bus.publish(
                DomainEvent(
                    "stock.restocked",
                    {
                        "ingredient_name": ingredient.name,
                        "quantity": str(quantity),
                        "unit": ingredient.unit,
                    },
                )
            )
        elif kind == "keluar":
            if ingredient.stock_current < quantity:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Stok tidak cukup untuk dikurangi.")
            ingredient.stock_current -= quantity
        elif kind == "koreksi":
            ingredient.stock_current = quantity

        movement = self.movements.add(
            StockMovement(
                ingredient_id=ingredient.id,
                kind=kind,
                quantity=quantity,
                reference_type="manual",
                note=note,
            )
        )

        if ingredient.stock_current <= ingredient.stock_minimum:
            self.event_bus.publish(
                DomainEvent(
                    "stock.critical",
                    {
                        "ingredient_name": ingredient.name,
                        "stock_current": str(ingredient.stock_current),
                        "stock_minimum": str(ingredient.stock_minimum),
                        "unit": ingredient.unit,
                    },
                )
            )
        return movement
