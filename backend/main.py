from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import data_manager

app = FastAPI(title="Nee Commerce API")

# Setup CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/checkout")
def process_checkout(checkout_data: CheckoutRequest):
    """
    Processes checkout and creates an order record.
    In a real implementation, this would integrate with payment processors.
    """
    try:
        # Create order record
        order_data = {
            "customer_name": checkout_data.customer_name,
            "customer_email": checkout_data.customer_email,
            "customer_phone": checkout_data.customer_phone,
            "items": [item.dict() for item in checkout_data.items],
            "total_amount": checkout_data.total_amount,
            "payment_method": checkout_data.payment_method,
            "status": "completed"  # In real app, this would be "pending" until payment confirms
        }
        
        success = data_manager.save_order(order_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to process order")
        
        return {
            "status": "success",
            "message": "Order processed successfully",
            "order_id": order_data.get("id"),
            "total": checkout_data.total_amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")

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
