from app.modules.notifications.models import Notification
from app.patterns.repository import Repository


class NotificationRepository(Repository[Notification]):
    model = Notification

    def unread_for_role(self, role: str) -> list[Notification]:
        return list(
            self.db.query(Notification)
            .filter(Notification.recipient_role == role, Notification.read.is_(False))
            .order_by(Notification.created_at.desc())
            .all()
        )

