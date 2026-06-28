from uuid import UUID

from fastapi import HTTPException, status

from app.modules.orders.models import Order, OrderItem
from app.modules.orders.repository import OrderRepository
from app.modules.orders.schemas import OrderCreate
from app.modules.orders.state import assert_transition_allowed
from app.modules.stock.service import StockService
from app.patterns.observer import DomainEvent, EventBus


class OrderService:
    def __init__(self, orders: OrderRepository, stock_service: StockService, event_bus: EventBus) -> None:
        self.orders = orders
        self.stock_service = stock_service
        self.event_bus = event_bus

    def create(self, payload: OrderCreate) -> Order:
        if payload.order_type == "bulk" and payload.needed_at is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Tanggal kebutuhan wajib diisi untuk bulk order.",
            )

        estimation = self.stock_service.estimate_availability(
            [(item.product_id, item.quantity) for item in payload.items]
        )
        order = Order(
            customer_name=payload.customer_name,
            customer_contact=payload.customer_contact,
            order_type=payload.order_type,
            needed_at=payload.needed_at,
            note=payload.note,
            stock_estimation=estimation,
            items=[
                OrderItem(product_id=item.product_id, quantity=item.quantity, item_note=item.item_note)
                for item in payload.items
            ],
        )
        self.orders.add(order)
        self.event_bus.publish(DomainEvent("order.created", {"customer_name": order.customer_name}))
        return order

    def update_status(self, order_id: UUID, next_status: str, reason: str | None = None) -> Order:
        order = self.orders.get_with_items(str(order_id))
        if order is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pesanan tidak ditemukan.")

        assert_transition_allowed(order.status, next_status)
        if next_status == "diproses":
            self.stock_service.consume_for_order(order)

        order.status = next_status
        self.event_bus.publish(
            DomainEvent(
                "order.status_changed",
                {"order_id": str(order.id), "status": next_status, "customer_name": order.customer_name, "reason": reason},
            )
        )
        return order

