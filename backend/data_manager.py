import json
import os
from typing import List, Dict, Optional
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CATALOG_FILE = os.path.join(DATA_DIR, "catalog.json")
ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")

def load_catalog() -> List[Dict]:
    """Loads the catalog of businesses and products."""
    if not os.path.exists(CATALOG_FILE):
        return []
    with open(CATALOG_FILE, "r") as f:
        return json.load(f)

import re

def extract_whatsapp_id(link: str) -> str:
    """
    Extracts the product ID from a WhatsApp link.
    Supported formats:
    - https://wa.me/p/PRODUCT_ID/BUSINESS_NUMBER
    - https://wa.me/p/PRODUCT_ID
    - https://www.whatsapp.com/catalog/PRODUCT_ID
    - PRODUCT_ID (raw ID)
    """
    # Handle WhatsApp Business catalog links: https://wa.me/p/PRODUCT_ID/BUSINESS_NUMBER
    if "wa.me/p/" in link:
        # Extract product ID from wa.me/p/PRODUCT_ID or wa.me/p/PRODUCT_ID/BUSINESS_NUMBER
        match = re.search(r"wa\.me/p/([^/]+)", link)
        if match:
            return match.group(1)
    
    # Handle WhatsApp catalog links
    elif "whatsapp.com/catalog/" in link:
        match = re.search(r"catalog/([^/]+)", link)
        if match:
            return match.group(1)
    
    # Handle direct WhatsApp Business API links
    elif "api.whatsapp.com" in link:
        match = re.search(r"product_id=([^&]+)", link)
        if match:
            return match.group(1)
    
    # Clean up and return as-is (might be a direct ID)
    return link.strip()

def get_product_by_identifier(identifier: str) -> Optional[Dict]:
    """Searches for a product by its sync code, WhatsApp ID, or WhatsApp URL."""
    catalog = load_catalog()
    
    # Try to extract ID if it's a link
    clean_id = extract_whatsapp_id(identifier)
    
    for business in catalog:
        for product in business.get("products", []):
            # Check for code match
            if product["code"].lower() == identifier.lower().strip():
                return _attach_business_info(product, business)
            
            # Check for whatsapp_id match
            if product.get("whatsapp_id") == clean_id:
                return _attach_business_info(product, business)
                
    return None

def _attach_business_info(product: Dict, business: Dict) -> Dict:
    """Attaches business context to a product."""
    product_with_context = product.copy()
    product_with_context["business_name"] = business["name"]
    product_with_context["business_slug"] = business["slug"]
    return product_with_context

def load_orders() -> List[Dict]:
    """Loads all orders from the orders.json file."""
    if not os.path.exists(ORDERS_FILE):
        return []
    with open(ORDERS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_order(order_data: Dict) -> bool:
    """Appends a new order to the orders.json ledger."""
    orders = []
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, "r") as f:
            try:
                orders = json.load(f)
            except json.JSONDecodeError:
                orders = []
    
    # Add timestamp and ID
    order_data["id"] = f"ORD-{int(datetime.now().timestamp())}"
    order_data["created_at"] = datetime.now().isoformat()
    
    orders.append(order_data)
    
    with open(ORDERS_FILE, "w") as f:
        json.dump(orders, f, indent=2)
    
    return True
