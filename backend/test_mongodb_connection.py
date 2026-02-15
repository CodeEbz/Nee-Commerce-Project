import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "nee_commerce_test"

async def test_connection():
    print(f"Connecting to MongoDB at {MONGODB_URL}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB connection successful!")
        
        db = client[DATABASE_NAME]
        
        # Test inserting a user
        print("Testing user insertion...")
        test_user = {
            "email": "test@example.com",
            "full_name": "Test User",
            "is_admin": True
        }
        result = await db.users.insert_one(test_user)
        print(f"Inserted user with id: {result.inserted_id}")
        
        # Test finding the user
        user = await db.users.find_one({"email": "test@example.com"})
        print(f"Found user: {user['full_name']}")
        
        # Cleanup
        await db.users.delete_one({"email": "test@example.com"})
        print("Cleanup successful.")
        
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
