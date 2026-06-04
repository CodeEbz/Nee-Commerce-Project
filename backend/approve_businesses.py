import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def approve_all():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client['nee_commerce']
    result = await db.businesses.update_many({}, {'$set': {'is_approved': True}})
    print(f'Approved {result.modified_count} businesses')
    businesses = await db.businesses.find({}, {'name': 1, 'is_approved': 1}).to_list(100)
    for b in businesses:
        print(f"  - {b.get('name')} -> approved: {b.get('is_approved')}")

asyncio.run(approve_all())
