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

import urllib.request
import re

import html

def scrape_whatsapp_metadata(url: str) -> Optional[Dict]:
    """
    Attempts to fetch product metadata from a WhatsApp link.
    """
    try:
        # Normalize URL: Ensure it starts with https://
        if url.startswith("http:/") and not url.startswith("https://"):
             url = url.replace("http:/", "https:/", 1)
        
        # Comprehensive headers to mimic a mobile browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        # Increase timeout and handle redirects explicitly if needed
        with urllib.request.urlopen(req, timeout=10) as response:
            final_url = response.geturl()
            html_content = response.read().decode('utf-8')
            
            # Extract OG data
            og_title = re.search(r'<meta property="og:title" content="([^"]+)"', html_content)
            og_desc = re.search(r'<meta property="og:description" content="([^"]+)"', html_content)
            # Find the first image link (either og:image or a direct img tag if og:image fails)
            og_image = re.search(r'<meta property="og:image" content="([^"]+)"', html_content)
            
            if not og_title:
                # Fallback: check <title> tag
                title_tag = re.search(r'<title>([^<]+)</title>', html_content)
                if not title_tag: return None
                title_text = title_tag.group(1)
            else:
                title_text = og_title.group(1)
            
            desc_text = og_desc.group(1) if og_desc else ""
            image_url = og_image.group(1) if og_image else ""
            
            # Unescape HTML entities (e.g., &amp; -> &)
            title_text = html.unescape(title_text)
            desc_text = html.unescape(desc_text)
            image_url = html.unescape(image_url)
            
            # Clean up title: often contains "WhatsApp" or "Business"
            product_name = title_text.split(" from ")[0].replace(" on WhatsApp", "").strip()
            # Remove common "clutter" like hashtags or leading symbols
            product_name = re.sub(r'#\w+', '', product_name).strip()
            
            business_name = "WhatsApp Shop"
            if " from " in title_text:
                business_name = title_text.split(" from ")[1].split(" on WhatsApp")[0].strip()
            
            # Enhanced Price extraction
            price = 0
            description = desc_text
            # Look for currency symbols or "NGN"
            price_match = re.search(r'(?:NGN|₦|₦)\s?([\d,]+(?:\.\d{2})?)', desc_text)
            if price_match:
                price = float(price_match.group(1).replace(',', ''))
                # Clean up description to remove price
                description = desc_text.split(" · ")[0] if " · " in desc_text else desc_text

            # Final text cleanup for description
            description = re.sub(r'#\w+', '', description).strip()
            description = description.replace('\n', ' ').strip()

            whatsapp_id = extract_whatsapp_id(final_url if final_url else url)

            return {
                "code": f"SYNC-{whatsapp_id[-4:]}" if whatsapp_id else "SYNC-AUTO",
                "whatsapp_id": whatsapp_id,
                "name": product_name,
                "price": price,
                "description": description,
                "image": image_url or "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
                "business_name": business_name,
                "business_slug": "wa-" + business_name.lower().replace(" ", "-"),
                "auto_synced": True
            }
    except Exception as e:
        print(f"Scraping failed for {url}: {e}")
        return None

def get_product_by_identifier(identifier: str) -> Optional[Dict]:
    """Searches for a product by its sync code, WhatsApp ID, or WhatsApp URL."""
    catalog = load_catalog()
    
    # Try to extract ID if it's a link
    clean_id = extract_whatsapp_id(identifier)
    
    # 1. Check local catalog first
    for business in catalog:
        for product in business.get("products", []):
            if product["code"].lower() == identifier.lower().strip():
                return _attach_business_info(product, business)
            if product.get("whatsapp_id") == clean_id:
                return _attach_business_info(product, business)
    
    # 2. If it's a URL and not in catalog, try to scrape it (Automatic Sync)
    if "http" in identifier:
        return scrape_whatsapp_metadata(identifier)
    elif clean_id and len(clean_id) > 10: # Likely a WhatsApp ID
        # We can't scrape by ID alone easily, but we can return the ID if it matches a URL format we know
        url = f"https://wa.me/p/{clean_id}"
        return scrape_whatsapp_metadata(url)
                
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
