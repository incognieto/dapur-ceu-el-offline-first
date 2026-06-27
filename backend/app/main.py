# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings

# Import models so SQLAlchemy can resolve relationships in service code.
from app.modules.catalog import models as catalog_models  # noqa: F401
from app.modules.notifications import models as notification_models  # noqa: F401
from app.modules.orders import models as order_models  # noqa: F401
from app.modules.stock import models as stock_models  # noqa: F401
from app.modules.users import models as user_models  # noqa: F401

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Modular monolith offline-first untuk Pemesanan dan Manajemen Stok Dapur Ceu El.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(router)

