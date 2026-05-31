import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def seed_db():
    # Database config
    mongo_uri = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = "nee_commerce"
    
    # Files
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    catalog_file = os.path.join(data_dir, "catalog.json")
    
    if not os.path.exists(catalog_file):
        print(f"Error: {catalog_file} not found.")
        return

    with open(catalog_file, "r") as f:
        catalog_data = json.load(f)

    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    
    # Clear and re-seed for a clean state
    # WARNING: Only do this if you want a complete reset!
    # For now, let's just insert if empty.
    
    count = await db.businesses.count_documents({})
    if count == 0:
        print(f"Seeding {len(catalog_data)} businesses into MongoDB...")
        for biz in catalog_data:
            # Ensure _id is not reused from old runs if they exist but are problematic
            if "_id" in biz:
                del biz["_id"]
            await db.businesses.insert_one(biz)
        print("Seeding complete.")
    else:
        print(f"Database already has {count} businesses. Skipping seed.")
        # If the user wants a forced update, we could add a flag.

if __name__ == "__main__":
    asyncio.run(seed_db())
