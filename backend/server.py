from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'atelier-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_admin: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    sizes: List[str] = ["XS", "S", "M", "L", "XL"]
    colors: List[str] = ["Black", "White"]
    image_url: str
    stock: int = 100
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    sizes: List[str]
    colors: List[str]
    image_url: str
    stock: int
    featured: bool
    created_at: str

class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1
    size: str
    color: str

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_image: str
    price: float
    quantity: int
    size: str
    color: str
    subtotal: float

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float
    item_count: int

class ShippingAddress(BaseModel):
    full_name: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    postal_code: str
    country: str
    phone: str

class OrderCreate(BaseModel):
    shipping_address: ShippingAddress

class OrderItemResponse(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    price: float
    quantity: int
    size: str
    color: str
    subtotal: float

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItemResponse]
    shipping_address: dict
    total: float
    status: str
    created_at: str

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "sub": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "is_admin": False,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Initialize empty cart for user
    await db.carts.insert_one({"user_id": user_id, "items": []})
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, username=user_data.username, email=user_data.email, is_admin=False, created_at=now)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user.get("is_admin", False))
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            is_admin=user.get("is_admin", False),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        is_admin=current_user.get("is_admin", False),
        created_at=current_user["created_at"]
    )

# ============== PRODUCT ROUTES ==============

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return {"categories": categories}

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/admin/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, admin: dict = Depends(get_admin_user)):
    product_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    product_doc = {
        "id": product_id,
        **product.model_dump(),
        "created_at": now
    }
    
    await db.products.insert_one(product_doc)
    return ProductResponse(**product_doc)

@api_router.put("/admin/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_update: ProductUpdate, admin: dict = Depends(get_admin_user)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return ProductResponse(**updated)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============== CART ROUTES ==============

@api_router.get("/cart", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart:
        cart = {"user_id": current_user["id"], "items": []}
        await db.carts.insert_one(cart)
    
    cart_items = []
    total = 0
    
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            subtotal = product["price"] * item["quantity"]
            cart_items.append(CartItemResponse(
                id=item["id"],
                product_id=item["product_id"],
                product_name=product["name"],
                product_image=product["image_url"],
                price=product["price"],
                quantity=item["quantity"],
                size=item["size"],
                color=item["color"],
                subtotal=subtotal
            ))
            total += subtotal
    
    return CartResponse(items=cart_items, total=total, item_count=len(cart_items))

@api_router.post("/cart/items", response_model=CartResponse)
async def add_to_cart(item: CartItemAdd, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    if not cart:
        cart = {"user_id": current_user["id"], "items": []}
        await db.carts.insert_one(cart)
    
    # Check if item already exists with same size and color
    existing_item = None
    for cart_item in cart.get("items", []):
        if (cart_item["product_id"] == item.product_id and 
            cart_item["size"] == item.size and 
            cart_item["color"] == item.color):
            existing_item = cart_item
            break
    
    if existing_item:
        await db.carts.update_one(
            {"user_id": current_user["id"], "items.id": existing_item["id"]},
            {"$inc": {"items.$.quantity": item.quantity}}
        )
    else:
        new_item = {
            "id": str(uuid.uuid4()),
            "product_id": item.product_id,
            "quantity": item.quantity,
            "size": item.size,
            "color": item.color
        }
        await db.carts.update_one(
            {"user_id": current_user["id"]},
            {"$push": {"items": new_item}}
        )
    
    return await get_cart(current_user)

@api_router.put("/cart/items/{item_id}", response_model=CartResponse)
async def update_cart_item(item_id: str, item_update: CartItemUpdate, current_user: dict = Depends(get_current_user)):
    if item_update.quantity <= 0:
        return await remove_from_cart(item_id, current_user)
    
    result = await db.carts.update_one(
        {"user_id": current_user["id"], "items.id": item_id},
        {"$set": {"items.$.quantity": item_update.quantity}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return await get_cart(current_user)

@api_router.delete("/cart/items/{item_id}", response_model=CartResponse)
async def remove_from_cart(item_id: str, current_user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$pull": {"items": {"id": item_id}}}
    )
    return await get_cart(current_user)

@api_router.delete("/cart", response_model=CartResponse)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": []}}
    )
    return await get_cart(current_user)

# ============== ORDER ROUTES ==============

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    order_items = []
    total = 0
    
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            subtotal = product["price"] * item["quantity"]
            order_items.append({
                "product_id": item["product_id"],
                "product_name": product["name"],
                "product_image": product["image_url"],
                "price": product["price"],
                "quantity": item["quantity"],
                "size": item["size"],
                "color": item["color"],
                "subtotal": subtotal
            })
            total += subtotal
    
    order_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    order_doc = {
        "id": order_id,
        "user_id": current_user["id"],
        "items": order_items,
        "shipping_address": order_data.shipping_address.model_dump(),
        "total": total,
        "status": "confirmed",
        "created_at": now
    }
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart after successful order
    await db.carts.update_one({"user_id": current_user["id"]}, {"$set": {"items": []}})
    
    return OrderResponse(**order_doc)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ============== ADMIN ROUTES ==============

@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(admin: dict = Depends(get_admin_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin: dict = Depends(get_admin_user)):
    valid_statuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Valid options: {valid_statuses}")
    
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": f"Order status updated to {status}"}

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    # Check if products already exist
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": "Database already seeded", "product_count": count}
    
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Classic White Shirt",
            "description": "A timeless white cotton shirt with a modern fit. Perfect for any occasion.",
            "price": 89.00,
            "category": "Shirts",
            "sizes": ["XS", "S", "M", "L", "XL"],
            "colors": ["White", "Off-White"],
            "image_url": "https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 50,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Essential Cotton Tee",
            "description": "Premium organic cotton t-shirt with a relaxed silhouette.",
            "price": 45.00,
            "category": "T-Shirts",
            "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
            "colors": ["Black", "White", "Gray", "Navy"],
            "image_url": "https://images.unsplash.com/photo-1564316800929-be17a69d6966?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 100,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Navy Polo",
            "description": "Classic polo shirt in premium pique cotton. Understated elegance.",
            "price": 65.00,
            "category": "Polos",
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Navy", "Black", "White"],
            "image_url": "https://images.unsplash.com/photo-1587375027707-6aeb5230fe3b?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 75,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Structured Wool Coat",
            "description": "Luxurious wool blend coat with clean lines and minimal details.",
            "price": 295.00,
            "category": "Outerwear",
            "sizes": ["XS", "S", "M", "L"],
            "colors": ["Camel", "Black", "Gray"],
            "image_url": "https://images.pexels.com/photos/3400764/pexels-photo-3400764.jpeg",
            "stock": 30,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Slim Fit Chinos",
            "description": "Tailored chino trousers in stretch cotton. Modern slim fit.",
            "price": 95.00,
            "category": "Trousers",
            "sizes": ["28", "30", "32", "34", "36"],
            "colors": ["Khaki", "Navy", "Black", "Olive"],
            "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 60,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cashmere Sweater",
            "description": "Pure cashmere crew neck sweater. Incredibly soft and warm.",
            "price": 245.00,
            "category": "Knitwear",
            "sizes": ["XS", "S", "M", "L", "XL"],
            "colors": ["Cream", "Navy", "Gray", "Black"],
            "image_url": "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 40,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Linen Blazer",
            "description": "Lightweight linen blazer for warm weather sophistication.",
            "price": 185.00,
            "category": "Blazers",
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Beige", "Navy", "Light Gray"],
            "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 35,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Denim Jacket",
            "description": "Classic denim jacket with a vintage wash. A wardrobe essential.",
            "price": 125.00,
            "category": "Outerwear",
            "sizes": ["XS", "S", "M", "L", "XL"],
            "colors": ["Light Blue", "Dark Blue", "Black"],
            "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 45,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Oxford Button-Down",
            "description": "Timeless oxford cloth button-down shirt. Smart casual perfection.",
            "price": 79.00,
            "category": "Shirts",
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Blue", "White", "Pink"],
            "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 55,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Merino Wool Cardigan",
            "description": "Versatile merino wool cardigan with horn buttons.",
            "price": 155.00,
            "category": "Knitwear",
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Charcoal", "Navy", "Burgundy"],
            "image_url": "https://images.unsplash.com/photo-1638643391904-9b551ba91eaa?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 42,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Silk Scarf",
            "description": "Luxurious silk scarf with abstract print. Add elegance to any outfit.",
            "price": 85.00,
            "category": "Accessories",
            "sizes": ["One Size"],
            "colors": ["Multicolor", "Blue", "Red"],
            "image_url": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 25,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Leather Belt",
            "description": "Full-grain leather belt with brushed silver buckle.",
            "price": 75.00,
            "category": "Accessories",
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Brown", "Black"],
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock": 50,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@atelier.com"})
    if not admin_exists:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id,
            "username": "admin",
            "email": "admin@atelier.com",
            "password_hash": hash_password("admin123"),
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Database seeded successfully", "product_count": len(products)}

@api_router.get("/")
async def root():
    return {"message": "ATELIER API - Fashion E-Commerce"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
