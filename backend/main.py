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

class UserSignup(BaseModel):
    email: str
    nickname: Optional[str] = None
    password: str
    full_name: str

class UserResponse(BaseModel):
    email: str
    nickname: Optional[str] = None
    full_name: str
    is_admin: bool

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
    user = await db.users.find_one({"email": email})
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
    businesses = await db.businesses.find().to_list(length=100)
    # Format for frontend compatibility
    for biz in businesses:
        biz["id"] = biz.get("_id")
    return businesses

# AUTH ENDPOINTS
@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserSignup):
    db = get_database()
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = auth_utils.get_password_hash(user_data.password)
    new_user = {
        "email": user_data.email,
        "nickname": user_data.nickname,
        "hashed_password": hashed_pwd,
        "full_name": user_data.full_name,
        "is_admin": False,
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(new_user)
    return new_user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    print(f"Login attempt for: {form_data.username}")
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        print(f"User not found: {form_data.username}")
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
    return current_user

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
async def initialize_payment(checkout_data: CheckoutRequest):
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
                "authorization_url": f"http://localhost:5173/admin?mock_success={order_id}",
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
            "callback_url": "http://localhost:5173/admin" 
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

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"url": f"http://localhost:8000/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/businesses/{business_id}")
async def update_business(business_id: str, business_update: BusinessUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = business_update.dict(exclude_unset=True)
    result = await db.businesses.update_one({"_id": business_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    return {"status": "success"}

@app.post("/products")
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.businesses.update_one(
        {"_id": product.business_id},
        {"$push": {"products": product.dict()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    return product

@app.delete("/products/{business_id}/{product_code}")
async def delete_product(business_id: str, product_code: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.businesses.update_one(
        {"_id": business_id},
        {"$pull": {"products": {"code": product_code}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
