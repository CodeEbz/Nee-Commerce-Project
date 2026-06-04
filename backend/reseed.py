import asyncio, json, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def reseed():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client['nee_commerce']

    with open(os.path.join(os.path.dirname(__file__), 'data', 'catalog.json')) as f:
        catalog = json.load(f)

    await db.businesses.delete_many({})
    for biz in catalog:
        biz['is_approved'] = True
        biz.pop('_id', None)
        await db.businesses.insert_one(biz)

    count = await db.businesses.count_documents({})
    print(f"Seeded {count} businesses successfully.")
    for biz in catalog:
        print(f"  ✓ {biz['name']} ({len(biz['products'])} products)")

asyncio.run(reseed())
