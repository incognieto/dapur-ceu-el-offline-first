from sqlalchemy.orm import joinedload

from app.modules.orders.models import Order, OrderItem
from app.patterns.repository import Repository


class OrderRepository(Repository[Order]):
    model = Order

    def get_with_items(self, order_id: str) -> Order | None:
        return (
            self.db.query(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .filter(Order.id == order_id)
            .first()
        )

    def recent(self, limit: int = 100) -> list[Order]:
        return list(
            self.db.query(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .order_by(Order.created_at.desc())
            .limit(limit)
            .all()
        )
