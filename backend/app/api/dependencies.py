from sqlalchemy.orm import Session

from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.service import NotificationService
from app.modules.orders.repository import OrderRepository
from app.modules.orders.service import OrderService
from app.modules.stock.repository import IngredientRepository, RecipeRepository, StockMovementRepository
from app.modules.stock.service import StockService
from app.patterns.observer import EventBus


def build_services(db: Session) -> tuple[OrderService, StockService]:
    event_bus = EventBus()
    notifications = NotificationService(NotificationRepository(db))
    event_bus.subscribe("order.created", notifications.handle_event)
    event_bus.subscribe("order.status_changed", notifications.handle_event)
    event_bus.subscribe("stock.critical", notifications.handle_event)
    event_bus.subscribe("stock.restocked", notifications.handle_event)
    event_bus.subscribe("stock.adjusted", notifications.handle_event)

    stock_service = StockService(
        ingredients=IngredientRepository(db),
        recipes=RecipeRepository(db),
        movements=StockMovementRepository(db),
        event_bus=event_bus,
    )
    order_service = OrderService(OrderRepository(db), stock_service, event_bus)
    return order_service, stock_service

