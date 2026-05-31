import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_db():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_uri)
    db = client.nee_commerce
    
    count = await db.businesses.count_documents({})
    print(f"Number of businesses: {count}")
    
    if count > 0:
        businesses = await db.businesses.find().to_list(length=10)
        for biz in businesses:
            print(f"Business: {biz.get('name')} (Slug: {biz.get('slug')})")
            products = biz.get('products', [])
            print(f"  Products count: {len(products)}")
            for p in products[:3]:
                print(f"    - {p.get('name')} (Code: {p.get('code')})")
    else:
        print("No businesses found in database.")

if __name__ == "__main__":
    asyncio.run(check_db())
