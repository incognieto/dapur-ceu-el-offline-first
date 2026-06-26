from app.modules.users.models import User
from app.patterns.repository import Repository

class UserRepository(Repository[User]):
    model = User

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()
