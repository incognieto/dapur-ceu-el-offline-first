from app.modules.catalog.models import Product
from app.patterns.repository import Repository


class ProductRepository(Repository[Product]):
    model = Product

    def available_products(self) -> list[Product]:
        # Fetch all products that are marked available
        products = list(self.db.query(Product).filter(Product.available.is_(True)).order_by(Product.name).all())
        
        # Calculate dynamic availability based on ingredient stock
        for product in products:
            dynamic_available = True
            for recipe in product.recipes:
                if recipe.ingredient.stock_current < recipe.quantity_per_unit:
                    dynamic_available = False
                    break
            product.available = dynamic_available
        
        return products

