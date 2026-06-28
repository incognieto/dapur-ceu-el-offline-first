from uuid import UUID

from sqlalchemy.orm import Session
from app.api.dependencies import build_services
from app.core.database import get_db
from app.core.security import require_role, ROLE_ORDER
from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.modules.catalog.repository import ProductRepository
from app.modules.notifications.repository import NotificationRepository
from app.modules.orders.repository import OrderRepository
from app.modules.orders.schemas import (
    IngredientRead,
    OrderCreate,
    OrderItemRead,
    OrderRead,
    ProductRead,
    StatusUpdate,
    StockAdjustmentCreate,
    StockMovementRead,
)
from app.modules.stock.repository import IngredientRepository, RecipeRepository, StockMovementRepository
from app.modules.catalog.schemas import ProductCreate, ProductUpdate
from app.modules.stock.schemas import IngredientCreate, IngredientUpdate, RecipeCreate, RecipeUpdate, RecipeRead
from app.modules.catalog.models import Product
from app.modules.stock.models import Ingredient, Recipe
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserLogin, UserResponse
from app.modules.users.repository import UserRepository
import hashlib
import os

router = APIRouter(prefix="/api")

def hash_password(password: str) -> str:
    salt = "dapur_ceu_el_salt" # Simple static salt for demo purposes
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()



def serialize_order(order) -> OrderRead:
    return OrderRead(
        id=order.id,
        customer_name=order.customer_name,
        customer_contact=order.customer_contact,
        order_type=order.order_type,
        needed_at=order.needed_at,
        status=order.status,
        note=order.note,
        stock_estimation=order.stock_estimation,
        created_at=order.created_at,
        items=[
            OrderItemRead(
                product_id=item.product_id,
                product_name=item.product.name,
                quantity=item.quantity,
                item_note=item.item_note,
            )
            for item in order.items
        ],
    )


@router.get("/products", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)):
    return ProductRepository(db).available_products()


@router.post("/products", response_model=ProductRead, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    repo = ProductRepository(db)
    product = Product(**payload.model_dump())
    repo.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductRead)
def update_product(product_id: UUID, payload: ProductUpdate, db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    repo = ProductRepository(db)
    product = repo.get(str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: UUID, db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    repo = ProductRepository(db)
    product = repo.get(str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    repo.delete(product)
    db.commit()


@router.get("/ingredients", response_model=list[IngredientRead])
def list_ingredients(db: Session = Depends(get_db), _: str = Depends(require_role("staf_produksi"))):
    return IngredientRepository(db).list(limit=200)


@router.post("/ingredients", response_model=IngredientRead, status_code=201)
def create_ingredient(
    payload: IngredientCreate, 
    db: Session = Depends(get_db), 
    x_username: str = Header(default="Admin", alias="X-Username"),
    _: str = Depends(require_role("admin"))
):
    repo = IngredientRepository(db)
    
    # Validation for duplicate
    from sqlalchemy import func
    existing = db.query(Ingredient).filter(func.lower(Ingredient.name) == payload.name.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bahan Baku sudah ditambahkan")
        
    ingredient = Ingredient(**payload.model_dump())
    repo.add(ingredient)
    
    # Send notification
    notif_repo = NotificationRepository(db)
    from app.modules.notifications.models import Notification
    msg = f"{x_username} menambahkan bahan baku {ingredient.name}"
    notif_repo.add(Notification(recipient_role="admin", type="kelola_bahan_baku", message=msg))
    notif_repo.add(Notification(recipient_role="staf_produksi", type="kelola_bahan_baku", message=msg))
    
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.put("/ingredients/{ingredient_id}", response_model=IngredientRead)
def update_ingredient(ingredient_id: UUID, payload: IngredientUpdate, db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    repo = IngredientRepository(db)
    ingredient = repo.get(str(ingredient_id))
    if not ingredient:
        raise HTTPException(status_code=404, detail="Bahan baku tidak ditemukan")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(ingredient, key, value)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.delete("/ingredients/{ingredient_id}", status_code=204)
def delete_ingredient(
    ingredient_id: UUID, 
    db: Session = Depends(get_db), 
    x_username: str = Header(default="Admin", alias="X-Username"),
    _: str = Depends(require_role("admin"))
):
    repo = IngredientRepository(db)
    ingredient = repo.get(str(ingredient_id))
    if not ingredient:
        raise HTTPException(status_code=404, detail="Bahan baku tidak ditemukan")
        
    # Send notification
    notif_repo = NotificationRepository(db)
    from app.modules.notifications.models import Notification
    msg = f"{x_username} menghapus bahan baku {ingredient.name}"
    notif_repo.add(Notification(recipient_role="admin", type="kelola_bahan_baku", message=msg))
    notif_repo.add(Notification(recipient_role="staf_produksi", type="kelola_bahan_baku", message=msg))
    
    repo.delete(ingredient)
    db.commit()


@router.get("/recipes", response_model=list[RecipeRead])
def list_recipes(db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    recipes = RecipeRepository(db).list(limit=500)
    return [
        RecipeRead(
            id=r.id,
            product_id=r.product_id,
            ingredient_id=r.ingredient_id,
            ingredient_name=r.ingredient.name,
            quantity_per_unit=r.quantity_per_unit,
            unit=r.unit
        ) for r in recipes
    ]


@router.post("/recipes/{product_id}", response_model=RecipeRead, status_code=201)
def add_recipe_to_product(product_id: UUID, payload: RecipeCreate, db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    repo = RecipeRepository(db)
    recipe = Recipe(product_id=product_id, **payload.model_dump())
    repo.add(recipe)
    db.commit()
    db.refresh(recipe)
    return RecipeRead(
        id=recipe.id,
        product_id=recipe.product_id,
        ingredient_id=recipe.ingredient_id,
        ingredient_name=recipe.ingredient.name,
        quantity_per_unit=recipe.quantity_per_unit,
        unit=recipe.unit
    )


@router.delete("/recipes/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: UUID, db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    repo = RecipeRepository(db)
    recipe = repo.get(str(recipe_id))
    if not recipe:
        raise HTTPException(status_code=404, detail="Resep tidak ditemukan")
    repo.delete(recipe)
    db.commit()


@router.get("/stock/critical", response_model=list[IngredientRead])
def critical_stock(db: Session = Depends(get_db), _: str = Depends(require_role("staf_produksi"))):
    return IngredientRepository(db).critical()


@router.get("/stock/movements", response_model=list[StockMovementRead])
def stock_movements(db: Session = Depends(get_db), _: str = Depends(require_role("admin"))):
    return [
        StockMovementRead(
            id=movement.id,
            ingredient_name=movement.ingredient.name,
            kind=movement.kind,
            quantity=movement.quantity,
            note=movement.note,
            created_at=movement.created_at,
        )
        for movement in StockMovementRepository(db).recent()
    ]


@router.post("/stock/adjustments", response_model=StockMovementRead)
def adjust_stock(
    payload: StockAdjustmentCreate, 
    db: Session = Depends(get_db), 
    x_username: str = Header(default="Admin", alias="X-Username"),
    x_role: str = Header(default="admin", alias="X-Role"),
    _: str = Depends(require_role("staf_produksi"))
):
    _, stock_service = build_services(db)
    movement = stock_service.adjust_stock(payload.ingredient_id, payload.kind, payload.quantity, payload.note, x_username, x_role)
    db.commit()
    db.refresh(movement)
    return StockMovementRead(
        id=movement.id,
        ingredient_name=movement.ingredient.name,
        kind=movement.kind,
        quantity=movement.quantity,
        note=movement.note,
        created_at=movement.created_at,
    )


@router.get("/orders", response_model=list[OrderRead])
def list_orders(
    db: Session = Depends(get_db),
    x_role: str = Header(default="pelanggan", alias="X-Role"),
    x_username: str = Header(default="", alias="X-Username")
):
    # Base security check: must be at least pelanggan
    if ROLE_ORDER.get(x_role, 0) < ROLE_ORDER["pelanggan"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    orders = OrderRepository(db).recent()
    
    if x_role == "pelanggan":
        if not x_username:
            return [] # or raise error, but empty is safe
        orders = [o for o in orders if o.customer_name.lower() == x_username.lower()]
        
    return [serialize_order(order) for order in orders]


@router.post("/orders", response_model=OrderRead, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), _: str = Depends(require_role("pelanggan"))):
    order_service, _ = build_services(db)
    order = order_service.create(payload)
    db.commit()
    db.refresh(order)
    order = OrderRepository(db).get_with_items(str(order.id))
    return serialize_order(order)


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: UUID,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    x_role: str = Header(default="admin", alias="X-Role"),
    x_username: str = Header(default="", alias="X-Username")
):
    if ROLE_ORDER.get(x_role, 0) < ROLE_ORDER["pelanggan"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    if x_role == "pelanggan":
        if payload.status != "dibatalkan":
            raise HTTPException(status_code=403, detail="Pelanggan hanya bisa membatalkan pesanan.")
        order_to_check = OrderRepository(db).get(str(order_id))
        if order_to_check and order_to_check.customer_name.lower() != x_username.lower():
            raise HTTPException(status_code=403, detail="Hanya bisa membatalkan pesanan sendiri.")
    order_service, _ = build_services(db)
    order = order_service.update_status(order_id, payload.status, payload.reason)
    db.commit()
    db.refresh(order)
    order = OrderRepository(db).get_with_items(str(order.id))
    return serialize_order(order)


@router.get("/orders/{order_id}/production-needs")
def production_needs(order_id: UUID, db: Session = Depends(get_db), _: str = Depends(require_role("staf_produksi"))):
    order = OrderRepository(db).get_with_items(str(order_id))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pesanan tidak ditemukan.")
    _, stock_service = build_services(db)
    return stock_service.estimate_availability([(item.product_id, item.quantity) for item in order.items])


@router.get("/notifications")
def unread_notifications(role: str = "admin", db: Session = Depends(get_db)):
    return NotificationRepository(db).unread_for_role(role)


@router.post("/auth/signup", response_model=UserResponse, status_code=201)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    if repo.get_by_username(payload.username):
        raise HTTPException(status_code=400, detail="Username sudah digunakan")
    
    hashed_pw = hash_password(payload.password)
    user = User(username=payload.username, password_hash=hashed_pw, role=payload.role)
    repo.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        token=f"auth-token-for-{user.id}",
        role=user.role,
        username=user.username
    )

@router.post("/auth/login", response_model=UserResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_username(payload.username)
    if not user:
        raise HTTPException(status_code=401, detail="Kredensial tidak valid")
    
    hashed_pw = hash_password(payload.password)
    if user.password_hash != hashed_pw:
        raise HTTPException(status_code=401, detail="Kredensial tidak valid")

    return UserResponse(
        token=f"auth-token-for-{user.id}",
        role=user.role,
        username=user.username
    )
