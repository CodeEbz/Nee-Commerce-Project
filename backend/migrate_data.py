import json
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from datetime import datetime

# Create tables
models.Base.metadata.create_all(bind=engine)

def migrate():
    db = SessionLocal()
    
    # Paths
    DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
    CATALOG_FILE = os.path.join(DATA_DIR, "catalog.json")
    ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")

    # 1. Migrate Businesses and Products
    if os.path.exists(CATALOG_FILE):
        with open(CATALOG_FILE, "r") as f:
            catalog = json.load(f)
            
        for biz_data in catalog:
            # Check if business already exists
            existing_biz = db.query(models.Business).filter(models.Business.id == biz_data["id"]).first()
            if not existing_biz:
                new_biz = models.Business(
                    id=biz_data["id"],
                    name=biz_data["name"],
                    slug=biz_data["slug"],
                    category=biz_data.get("category"),
                    description=biz_data.get("description"),
                    whatsapp_link=biz_data.get("whatsapp_link"),
                    hero_image=biz_data.get("hero_image"),
                    logo=biz_data.get("logo"),
                    featured=biz_data.get("featured", False)
                )
                db.add(new_biz)
                db.flush() # Get the business in the session
                
                # Add Products
                for prod_data in biz_data.get("products", []):
                    new_prod = models.Product(
                        code=prod_data["code"],
                        whatsapp_id=prod_data.get("whatsapp_id"),
                        name=prod_data["name"],
                        price=prod_data["price"],
                        description=prod_data.get("description"),
                        image=prod_data.get("image"),
                        featured=prod_data.get("featured", False),
                        business_id=new_biz.id
                    )
                    db.add(new_prod)
        print("Businesses and Products migrated.")

    # 2. Migrate Orders
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, "r") as f:
            try:
                orders_data = json.load(f)
            except json.JSONDecodeError:
                orders_data = []
                
        for order_data in orders_data:
            existing_order = db.query(models.Order).filter(models.Order.id == order_data["id"]).first()
            if not existing_order:
                # Handle potential timestamp formats
                created_at = datetime.utcnow()
                if "created_at" in order_data:
                    try:
                        created_at = datetime.fromisoformat(order_data["created_at"])
                    except ValueError:
                        pass
                
                new_order = models.Order(
                    id=order_data["id"],
                    customer_name=order_data.get("customer_name"),
                    customer_email=order_data.get("customer_email"),
                    customer_phone=order_data.get("customer_phone"),
                    total_amount=order_data.get("total_amount", 0),
                    payment_method=order_data.get("payment_method", "card"),
                    status=order_data.get("status", "pending"),
                    created_at=created_at
                )
                db.add(new_order)
                db.flush()
                
                # Add Order Items
                for item_data in order_data.get("items", []):
                    new_item = models.OrderItem(
                        order_id=new_order.id,
                        product_code=item_data.get("code"),
                        name=item_data.get("name"),
                        price=item_data.get("price"),
                        quantity=item_data.get("quantity", 1),
                        business_name=item_data.get("business_name")
                    )
                    db.add(new_item)
        print("Orders migrated.")

    db.commit()
    db.close()
    print("Migration finished successfully!")

if __name__ == "__main__":
    migrate()
