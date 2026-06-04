from fastapi import FastAPI, HTTPException, Request, Depends, UploadFile, File, status
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
import uvicorn
import shutil
import uuid
import auth_utils
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import requests
import json
import os
import time
from datetime import datetime
from dotenv import load_dotenv

import data_manager
import models
from database import get_database

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Nee Commerce API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mount Uploads folder
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"DEBUG: Status {response.status_code}")
        return response
    except Exception as e:
        print(f"DEBUG: Error processing request: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for dev, adjust in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paystack Config
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "sk_test_placeholder")
PAYSTACK_API_URL = "https://api.paystack.co"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def sanitize_mongo_obj(obj):
    if not obj:
        return obj
    if isinstance(obj, list):
        return [sanitize_mongo_obj(i) for i in obj]
    if isinstance(obj, dict):
        new_obj = obj.copy()
        if "_id" in new_obj:
            new_obj["id"] = str(new_obj["_id"])
            del new_obj["_id"]
        for key, value in new_obj.items():
            new_obj[key] = sanitize_mongo_obj(value)
        return new_obj
    return obj

# Pydantic Models for API
class CartItem(BaseModel):
    code: str
    whatsapp_id: Optional[str] = None
    name: str
    price: float
    quantity: int = 1
    business_name: str
    business_slug: str

class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[CartItem]
    total_amount: float
    payment_method: str = "card"

class ProductCreate(BaseModel):
    code: str
    whatsapp_id: Optional[str] = None
    name: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None
    featured: bool = False
    business_id: str

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    logo: Optional[str] = None
    hero_image: Optional[str] = None
    whatsapp_link: Optional[str] = None

class BusinessCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class UserSignup(BaseModel):
    email: str
    nickname: Optional[str] = None
    password: str
    full_name: str
    is_merchant: bool = False

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponse(BaseModel):
    email: str
    nickname: Optional[str] = None
    full_name: str
    is_admin: bool
    is_merchant: bool = False
    profile_picture: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth_utils.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    db = get_database()
    # Normalize email to lowercase for lookup
    user = await db.users.find_one({"email": email.lower()})
    if user is None:
        raise credentials_exception
    return user

# Dependency to check if current user is admin
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges",
        )
    return current_user

@app.get("/")
async def read_root():
    return {"message": "Welcome to Nee Commerce API (MongoDB Driven)"}

@app.get("/ping")
async def ping():
    return {"status": "pong"}

@app.get("/businesses")
async def get_businesses():
    """Returns the list of all businesses and their catalogs from MongoDB."""
    db = get_database()
    businesses = await db.businesses.find({"is_approved": {"$ne": False}}).to_list(length=100)
    return sanitize_mongo_obj(businesses)

@app.get("/my-businesses")
async def get_my_businesses(current_user: dict = Depends(get_current_user)):
    """Returns businesses owned by the current user."""
    db = get_database()
    businesses = await db.businesses.find({"owner_email": current_user["email"]}).to_list(length=100)
    return sanitize_mongo_obj(businesses)

@app.get("/admin/users")
async def admin_get_users(current_admin: dict = Depends(get_current_admin)):
    """Returns all registered users (Admin only)."""
    db = get_database()
    users = await db.users.find().to_list(length=100)
    return sanitize_mongo_obj(users)

@app.get("/admin/businesses")
async def admin_get_businesses(current_admin: dict = Depends(get_current_admin)):
    """Returns all businesses with owner info (Admin only)."""
    db = get_database()
    businesses = await db.businesses.find().to_list(length=100)
    return sanitize_mongo_obj(businesses)

@app.put("/admin/businesses/{business_id}/approve")
async def approve_business(business_id: str, current_admin: dict = Depends(get_current_admin)):
    db = get_database()
    result = await db.businesses.update_one({"_id": business_id}, {"$set": {"is_approved": True}})
    if result.modified_count == 0:
        # Also check if it exists at all
        existing = await db.businesses.find_one({"_id": business_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Business not found")
    return {"status": "success"}

@app.get("/merchant/orders")
async def get_merchant_orders(current_user: dict = Depends(get_current_user)):
    """Returns orders that contain products from businesses owned by the merchant."""
    db = get_database()
    # Find businesses owned by the user
    my_businesses = await db.businesses.find({"owner_email": current_user["email"]}).to_list(length=100)
    my_business_names = [b["name"] for b in my_businesses]
    
    # Simple strategy: find orders where at least one item matches my business name
    # In a more robust system, we'd use business IDs
    orders = await db.orders.find({"items.business_name": {"$in": my_business_names}}).to_list(length=100)
    
    # Filter items in each order to only show what belongs to this merchant (optional but helpful)
    for order in orders:
        order["id"] = order.get("_id")
        # Keep all order info but maybe the merchant only cares about their share? 
        # For now return full order for context.
        
    return sanitize_mongo_obj(orders)

# AUTH ENDPOINTS
@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserSignup):
    db = get_database()
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = auth_utils.get_password_hash(user_data.password)
    user_email = user_data.email.lower().strip()
    new_user = {
        "email": user_email,
        "nickname": user_data.nickname,
        "hashed_password": hashed_pwd,
        "full_name": user_data.full_name,
        "is_admin": user_email == "ebzchin@gmail.com",
        "is_merchant": user_data.is_merchant,
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(new_user)
    return sanitize_mongo_obj(new_user)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user_email = form_data.username.lower().strip()
    print(f"DEBUG: Login attempt for: {user_email}")
    user = await db.users.find_one({"email": user_email})
    if not user:
        print(f"DEBUG: User not found: {user_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    is_valid = auth_utils.verify_password(form_data.password, user["hashed_password"])
    print(f"Password valid: {is_valid}")
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_utils.create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return sanitize_mongo_obj(current_user)

@app.put("/auth/me", response_model=UserResponse)
async def update_me(user_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in user_data.dict().items() if v is not None}
    
    if not update_data:
        return sanitize_mongo_obj(current_user)
        
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return sanitize_mongo_obj(updated_user)

@app.get("/sync/{identifier:path}")
async def sync_product(identifier: str):
    """
    The Sync Station Endpoint.
    """
    db = get_database()
    clean_id = data_manager.extract_whatsapp_id(identifier)
    
    # Search in DB
    product = await db.businesses.find_one({"products.code": identifier}, {"products.$": 1, "name": 1, "slug": 1})
    if not product:
        product = await db.businesses.find_one({"products.whatsapp_id": clean_id}, {"products.$": 1, "name": 1, "slug": 1})
    
    if product:
        p = product["products"][0]
        return {
            "code": p["code"],
            "whatsapp_id": p.get("whatsapp_id"),
            "name": p["name"],
            "price": p["price"],
            "description": p.get("description"),
            "image": p.get("image"),
            "business_name": product["name"],
            "business_slug": product["slug"]
        }
    
    # Fallback to scraping
    if "http" in identifier:
        scraped = data_manager.scrape_whatsapp_metadata(identifier)
        if scraped: return scraped
    elif clean_id and len(clean_id) > 10:
        url = f"https://wa.me/p/{clean_id}"
        scraped = data_manager.scrape_whatsapp_metadata(url)
        if scraped: return scraped
            
    raise HTTPException(status_code=404, detail="Product not found.")

@app.post("/payments/initialize")
async def initialize_payment(request: Request, checkout_data: CheckoutRequest):
    db = get_database()
    try:
        order_id = f"ORD-{int(time.time())}"
        
        new_order = {
            "_id": order_id,
            "customer_name": checkout_data.customer_name,
            "customer_email": checkout_data.customer_email,
            "customer_phone": checkout_data.customer_phone,
            "total_amount": checkout_data.total_amount,
            "payment_method": checkout_data.payment_method,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "items": [item.dict() for item in checkout_data.items]
        }
        await db.orders.insert_one(new_order)

        if PAYSTACK_SECRET_KEY == "sk_test_placeholder":
            return {
                "status": "success",
                "authorization_url": f"{FRONTEND_URL}/admin?mock_success={order_id}",
                "reference": order_id,
                "order_id": order_id,
                "demo_mode": True
            }

        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        paystack_payload = {
            "email": checkout_data.customer_email,
            "amount": int(checkout_data.total_amount * 100),
            "reference": order_id,
            "callback_url": f"{FRONTEND_URL}/admin" 
        }

        response = requests.post(f"{PAYSTACK_API_URL}/transaction/initialize", json=paystack_payload, headers=headers)
        if not response.ok:
            await db.orders.update_one({"_id": order_id}, {"$set": {"status": "failed"}})
            raise HTTPException(status_code=response.status_code, detail=f"Paystack error: {response.text}")

        res_data = response.json()
        return {
            "status": "success",
            "authorization_url": res_data["data"]["authorization_url"],
            "reference": res_data["data"]["reference"],
            "order_id": order_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment initialization failed: {str(e)}")

@app.post("/checkout")
async def process_checkout(checkout_data: CheckoutRequest):
    db = get_database()
    try:
        order_id = f"ORD-{int(time.time())}"
        new_order = {
            "_id": order_id,
            "customer_name": checkout_data.customer_name,
            "customer_email": checkout_data.customer_email,
            "customer_phone": checkout_data.customer_phone,
            "total_amount": checkout_data.total_amount,
            "payment_method": checkout_data.payment_method,
            "status": "completed",
            "created_at": datetime.utcnow(),
            "items": [item.dict() for item in checkout_data.items]
        }
        await db.orders.insert_one(new_order)
        return {
            "status": "success",
            "order_id": order_id,
            "total": checkout_data.total_amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/webhook/paystack")
async def paystack_webhook(request: Request):
    db = get_database()
    try:
        payload = await request.json()
        if payload.get("event") == "charge.success":
            reference = payload.get("data", {}).get("reference")
            await db.orders.update_one({"_id": reference}, {"$set": {"status": "completed", "updated_at": datetime.utcnow()}})
            return {"status": "success"}
        return {"status": "ignored"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/orders")
async def get_orders(current_admin: dict = Depends(get_current_admin)):
    db = get_database()
    orders = await db.orders.find().to_list(length=100)
    for order in orders:
        order["id"] = order.get("_id")
    return orders

from collections import defaultdict

@app.get("/admin/analytics")
async def get_admin_analytics(current_admin: dict = Depends(get_current_admin)):
    db = get_database()
    orders = await db.orders.find().to_list(length=1000)
    
    daily_revenue_map = defaultdict(float)
    product_sales = defaultdict(int)
    business_sales = defaultdict(float)
    
    for order in orders:
        # We can analyze all orders or just completed ones. Let's stick to completed for revenue.
        if order.get("status") not in ["completed", "pending"]: # Include pending for demo purposes
            continue
            
        date_str = order.get("created_at", datetime.utcnow()).strftime("%m/%d")
        daily_revenue_map[date_str] += order.get("total_amount", 0)
        
        for item in order.get("items", []):
            prod_name = item.get("name")
            biz_name = item.get("business_name")
            qty = item.get("quantity", 1)
            
            product_sales[prod_name] += qty
            business_sales[biz_name] += (item.get("price", 0) * qty)
            
    daily_revenue = [{"date": k, "revenue": v} for k, v in sorted(daily_revenue_map.items())[-30:]]
    top_products = [{"name": k, "sales": v} for k, v in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]]
    top_businesses = [{"name": k, "revenue": v} for k, v in sorted(business_sales.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    return {
        "dailyRevenue": daily_revenue,
        "topProducts": top_products,
        "topBusinesses": top_businesses
    }

@app.get("/merchant/analytics")
async def get_merchant_analytics(current_user: dict = Depends(get_current_user)):
    db = get_database()
    my_businesses = await db.businesses.find({"owner_email": current_user["email"]}).to_list(length=100)
    my_business_names = [b["name"] for b in my_businesses]
    my_business_slugs = [b["slug"] for b in my_businesses]
    
    orders = await db.orders.find({"$or": [{"items.business_name": {"$in": my_business_names}}, {"items.business_slug": {"$in": my_business_slugs}}]}).to_list(length=1000)
    
    daily_revenue_map = defaultdict(float)
    product_sales = defaultdict(int)
    total_revenue = 0
    total_orders = 0
    
    for order in orders:
        if order.get("status") not in ["completed", "pending"]:
            continue
            
        merchant_share = 0
        has_merchant_item = False
        
        for item in order.get("items", []):
            if item.get("business_name") in my_business_names or item.get("business_slug") in my_business_slugs:
                qty = item.get("quantity", 1)
                revenue = item.get("price", 0) * qty
                merchant_share += revenue
                has_merchant_item = True
                
                prod_name = item.get("name")
                product_sales[prod_name] += qty
                
        if has_merchant_item:
            total_orders += 1
            total_revenue += merchant_share
            date_str = order.get("created_at", datetime.utcnow()).strftime("%m/%d")
            daily_revenue_map[date_str] += merchant_share
            
    daily_revenue = [{"date": k, "revenue": v} for k, v in sorted(daily_revenue_map.items())[-30:]]
    top_products = [{"name": k, "sales": v} for k, v in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    return {
        "totalRevenue": total_revenue,
        "totalOrders": total_orders,
        "dailyRevenue": daily_revenue,
        "topProducts": top_products
    }

@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        base_url = str(request.base_url).rstrip("/")
        return {"url": f"{base_url}/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/businesses/{business_id}")
async def update_business(business_id: str, business_update: BusinessUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Check ownership unless admin
    existing = await db.businesses.find_one({"_id": business_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Business not found")
        
    if not current_user.get("is_admin") and existing.get("owner_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this business")
        
    update_data = business_update.dict(exclude_unset=True)
    result = await db.businesses.update_one({"_id": business_id}, {"$set": update_data})
    return {"status": "success"}

@app.post("/businesses")
async def create_business(business: BusinessCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not current_user.get("is_merchant") and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Only merchants can create businesses")
        
    slug = business.name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:4]
    
    new_business = {
        "_id": str(uuid.uuid4()),
        "name": business.name,
        "slug": slug,
        "description": business.description,
        "category": business.category,
        "owner_email": current_user["email"],
        "is_approved": False,
        "products": [],
        "logo": "",
        "hero_image": "",
        "whatsapp_link": ""
    }
    
    await db.businesses.insert_one(new_business)
    return sanitize_mongo_obj(new_business)

@app.post("/products")
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Check ownership
    existing = await db.businesses.find_one({"_id": product.business_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Business not found")
        
    if not current_user.get("is_admin") and existing.get("owner_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to add products to this business")
        
    result = await db.businesses.update_one(
        {"_id": product.business_id},
        {"$push": {"products": product.dict()}}
    )
    return product

@app.delete("/products/{business_id}/{product_code}")
async def delete_product(business_id: str, product_code: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Check ownership
    existing = await db.businesses.find_one({"_id": business_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Business not found")
        
    if not current_user.get("is_admin") and existing.get("owner_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete products from this business")
        
    result = await db.businesses.update_one(
        {"_id": business_id},
        {"$pull": {"products": {"code": product_code}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
