from app.modules.notifications.models import Notification
from app.modules.notifications.repository import NotificationRepository
from app.patterns.observer import DomainEvent


class NotificationService:
    def __init__(self, repo: NotificationRepository) -> None:
        self.repo = repo

    def handle_event(self, event: DomainEvent) -> None:
        if event.name == "order.status_changed":
            msg = f"Status pesanan {event.payload['order_id']} berubah menjadi {event.payload['status']}."
            if event.payload.get("status") == "dibatalkan" and event.payload.get("reason"):
                msg += f" Alasan: {event.payload['reason']}"

            self.repo.add(
                Notification(
                    recipient_role="pelanggan",
                    recipient_name=event.payload.get("customer_name"),
                    type="status_pesanan",
                    message=msg,
                )
            )
            if event.payload.get("status") == "dibatalkan":
                self.repo.add(
                    Notification(
                        recipient_role="admin",
                        recipient_name="",
                        type="pesanan_dibatalkan",
                        message=f"Pesanan {event.payload['order_id']} dari {event.payload['customer_name']} telah dibatalkan.",
                    )
                )
        if event.name == "order.created":
            self.repo.add(
                Notification(
                    recipient_role="admin",
                    recipient_name="",
                    type="pesanan_baru",
                    message=f"Pesanan baru dari {event.payload['customer_name']} menunggu konfirmasi.",
                )
            )
        if event.name == "stock.critical":
            self.repo.add(
                Notification(
                    recipient_role="admin",
                    recipient_name="",
                    type="stok_minimum",
                    message=(
                        f"Stok {event.payload['ingredient_name']} tersisa {event.payload['stock_current']} "
                        f"{event.payload['unit']}, batas minimum {event.payload['stock_minimum']}."
                    ),
                )
            )
            self.repo.add(
                Notification(
                    recipient_role="staf_produksi",
                    recipient_name="",
                    type="stok_minimum",
                    message=(
                        f"Stok {event.payload['ingredient_name']} tersisa {event.payload['stock_current']} "
                        f"{event.payload['unit']}, batas minimum {event.payload['stock_minimum']}."
                    ),
                )
            )
        if event.name == "stock.restocked":
            actor = event.payload.get("actor", "Seseorang")
            msg = f"{actor} merestock bahan baku {event.payload['ingredient_name']} sebanyak {event.payload['quantity']} {event.payload['unit']}"
            self.repo.add(
                Notification(
                    recipient_role="admin",
                    recipient_name="",
                    type="stok_restock",
                    message=msg,
                )
            )
            self.repo.add(
                Notification(
                    recipient_role="staf_produksi",
                    recipient_name="",
                    type="stok_restock",
                    message=msg,
                )
            )
        if event.name == "stock.adjusted":
            actor = event.payload.get("actor", "Seseorang")
            msg = f"{actor} {event.payload['kind']} stok bahan baku {event.payload['ingredient_name']} sebanyak {event.payload['quantity']} {event.payload['unit']}"
            self.repo.add(
                Notification(
                    recipient_role="admin",
                    recipient_name="",
                    type="stok_adjusted",
                    message=msg,
                )
            )
            self.repo.add(
                Notification(
                    recipient_role="staf_produksi",
                    recipient_name="",
                    type="stok_adjusted",
                    message=msg,
                )
            )

