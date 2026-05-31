import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate_ownership():
    mongo_uri = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = "nee_commerce"
    
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    
    default_owner = "ebzchin@gmail.com"
    
    # Add owner_email to all businesses that don't have it
    result = await db.businesses.update_many(
        {"owner_email": {"$exists": False}},
        {"$set": {"owner_email": default_owner}}
    )
    
    print(f"Migration complete. Updated {result.modified_count} businesses to owner: {default_owner}")

if __name__ == "__main__":
    asyncio.run(migrate_ownership())
