from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import data_manager
import os

app = FastAPI(title="Nee Commerce API (Minimal)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
def read_root():
    return {"message": "API is alive"}

@app.get("/orders")
def get_orders():
    return data_manager.load_orders()

@app.get("/businesses")
def get_businesses():
    return data_manager.load_catalog()

@app.post("/checkout")
def process_checkout(checkout_data: CheckoutRequest):
    order_data = {
        "customer_name": checkout_data.customer_name,
        "customer_email": checkout_data.customer_email,
        "customer_phone": checkout_data.customer_phone,
        "items": [item.dict() for item in checkout_data.items],
        "total_amount": checkout_data.total_amount,
        "payment_method": checkout_data.payment_method,
        "status": "completed"
    }
    data_manager.save_order(order_data)
    return {"status": "success", "order_id": order_data.get("id")}
