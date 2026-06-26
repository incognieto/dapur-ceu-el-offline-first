from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DomainEvent:
    name: str
    payload: dict[str, Any]


Subscriber = Callable[[DomainEvent], None]


class EventBus:
    def __init__(self) -> None:
        self._subscribers: dict[str, list[Subscriber]] = defaultdict(list)

    def subscribe(self, event_name: str, subscriber: Subscriber) -> None:
        self._subscribers[event_name].append(subscriber)

    def publish(self, event: DomainEvent) -> None:
        for subscriber in self._subscribers.get(event.name, []):
            subscriber(event)

