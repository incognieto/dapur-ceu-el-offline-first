from typing import Generic, TypeVar

from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")


class Repository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, entity_id: str) -> ModelT | None:
        return self.db.get(self.model, entity_id)

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        return entity

    def list(self, limit: int = 100) -> list[ModelT]:
        return list(self.db.query(self.model).limit(limit).all())

    def delete(self, entity: ModelT) -> None:
        self.db.delete(entity)

