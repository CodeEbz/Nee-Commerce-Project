from fastapi import FastAPI, HTTPException, Request
import uvicorn

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import data_manager
import requests
import json
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Nee Commerce API")

# Setup CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paystack Config
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "sk_test_placeholder")
PAYSTACK_API_URL = "https://api.paystack.co"

if PAYSTACK_SECRET_KEY != "sk_test_placeholder":
    print("✅ Paystack Secret Key loaded successfully.")
else:
    print("⚠️ Warning: PAYSTACK_SECRET_KEY not found in environment. Using placeholder.")

# Models
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

class OrderItem(BaseModel):
    code: str
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_whatsapp: str
    items: List[OrderItem]
    total_amount: float

@app.get("/")
def read_root():
    return {"message": "Welcome to Nee Commerce API"}

@app.get("/businesses")
def get_businesses():
    """Returns the list of all businesses and their catalogs."""
    return data_manager.load_catalog()

@app.get("/sync/{identifier:path}")
def sync_product(identifier: str):
    """
    The Sync Station Endpoint.
    Takes an identifier (code, WhatsApp ID, or WhatsApp URL) and returns the product details.
    """
    product = data_manager.get_product_by_identifier(identifier)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found. Check the code or link and try again.")
    return product

@app.post("/payments/initialize")
def initialize_payment(checkout_data: CheckoutRequest):
    """
    Initializes a Paystack transaction and creates a pending order.
    """
    try:
        # 1. Create unique order ID
        order_id = f"ORD-{int(time.time())}"
        
        # 2. Create "pending" order record
        order_data = {
            "id": order_id,
            "customer_name": checkout_data.customer_name,
            "customer_email": checkout_data.customer_email,
            "customer_phone": checkout_data.customer_phone,
            "items": [item.dict() for item in checkout_data.items],
            "total_amount": checkout_data.total_amount,
            "payment_method": checkout_data.payment_method,
            "status": "pending"
        }
        
        data_manager.save_order(order_data)

        if PAYSTACK_SECRET_KEY == "sk_test_placeholder":
            print("⚠️ PAYSTACK_SECRET_KEY not set. Using Demo Mode.")
            return {
                "status": "success",
                "authorization_url": f"http://localhost:5173/admin?mock_success={order_id}",
                "reference": order_id,
                "order_id": order_id,
                "demo_mode": True
            }

        # 3. Call Paystack to initialize transaction
        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "NeeCommerce/1.0"
        }
        
        # Paystack amount is in kobo (multiply by 100)
        paystack_payload = {
            "email": checkout_data.customer_email,
            "amount": int(checkout_data.total_amount * 100),
            "reference": order_id,
            "callback_url": "http://localhost:5173/admin" 
        }

        try:
            response = requests.post(
                f"{PAYSTACK_API_URL}/transaction/initialize",
                json=paystack_payload,
                headers=headers,
                timeout=10
            )
            
            if not response.ok:
                print(f"❌ Paystack API Error: {response.status_code} - {response.text}")
                data_manager.update_order_status(order_id, "failed")
                raise HTTPException(status_code=response.status_code, detail=f"Paystack error: {response.text}")

            res_data = response.json()
        except requests.exceptions.RequestException as e:
            # If request fails, update order to "failed"
            data_manager.update_order_status(order_id, "failed")
            print(f"❌ Request failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Paystack request failed: {str(e)}")
            
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
    """
    Handles Paystack webhook notifications to confirm payments.
    """
    # Note: In production, verify x-paystack-signature!
    try:
        payload = await request.json()
        event = payload.get("event")
        
        if event == "charge.success":
            data = payload.get("data")
            reference = data.get("reference")
            
            # Update order status to completed
            success = data_manager.update_order_status(reference, "completed")
            if success:
                return {"status": "success", "message": "Order completed"}
                
        return {"status": "ignored"}
    except Exception as e:
        # We don't want to throw 500 to Paystack usually, just log it
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/checkout")
def process_checkout(checkout_data: CheckoutRequest):
    """
    Legacy/Simulated checkout - now redirects to payment initialization logic
    """
    return initialize_payment(checkout_data)

@app.get("/orders")
def get_orders():
    """Returns all orders for admin/analytics purposes."""
    return data_manager.load_orders()

@app.post("/orders")
def create_order(order: OrderCreate):
    """
    Records a new order in the ledger.
    """
    success = data_manager.save_order(order.dict())
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save order")
    return {"status": "success", "message": "Order recorded successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

