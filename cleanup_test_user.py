import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_test_user():
    mongo_uri = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = "nee_commerce"
    
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    
    email_to_remove = "ebzchin@gmail.com"
    result = await db.users.delete_one({"email": email_to_remove})
    
    if result.deleted_count > 0:
        print(f"Successfully removed test user: {email_to_remove}")
    else:
        print(f"No user found with email: {email_to_remove}")

if __name__ == "__main__":
    asyncio.run(cleanup_test_user())
