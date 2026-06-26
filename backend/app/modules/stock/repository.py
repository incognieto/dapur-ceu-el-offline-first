from sqlalchemy.orm import joinedload

from app.modules.stock.models import Ingredient, Recipe, StockMovement
from app.patterns.repository import Repository


class IngredientRepository(Repository[Ingredient]):
    model = Ingredient

    def critical(self) -> list[Ingredient]:
        return list(
            self.db.query(Ingredient)
            .filter(Ingredient.stock_current <= Ingredient.stock_minimum)
            .order_by(Ingredient.name)
            .all()
        )

    def lock_many(self, ids: list[str]) -> list[Ingredient]:
        return list(self.db.query(Ingredient).filter(Ingredient.id.in_(ids)).with_for_update().all())


class RecipeRepository(Repository[Recipe]):
    model = Recipe

    def for_products(self, product_ids: list[str]) -> list[Recipe]:
        return list(
            self.db.query(Recipe)
            .options(joinedload(Recipe.product), joinedload(Recipe.ingredient))
            .filter(Recipe.product_id.in_(product_ids))
            .all()
        )


class StockMovementRepository(Repository[StockMovement]):
    model = StockMovement

    def recent(self, limit: int = 100) -> list[StockMovement]:
        return list(
            self.db.query(StockMovement)
            .options(joinedload(StockMovement.ingredient))
            .order_by(StockMovement.created_at.desc())
            .limit(limit)
            .all()
        )

