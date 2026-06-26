from abc import ABC, abstractmethod
from decimal import Decimal


class RequirementStrategy(ABC):
    @abstractmethod
    def multiplier(self, quantity: int) -> Decimal:
        raise NotImplementedError


class StandardUnitStrategy(RequirementStrategy):
    def multiplier(self, quantity: int) -> Decimal:
        return Decimal(quantity)


class BulkFriendlyStrategy(RequirementStrategy):
    def multiplier(self, quantity: int) -> Decimal:
        # Kue kering sering dibuat batch; buffer 2% membantu antisipasi susut produksi.
        return Decimal(quantity) * Decimal("1.02")


class StrategyFactory:
    def for_category(self, category: str) -> RequirementStrategy:
        if category == "kue_kering":
            return BulkFriendlyStrategy()
        return StandardUnitStrategy()

