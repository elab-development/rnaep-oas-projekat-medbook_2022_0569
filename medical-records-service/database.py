from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from model.medical_record import MedicalRecord, Examination
from config import settings


async def init_db():
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    await init_beanie(
        database=client.get_default_database(),
        document_models=[MedicalRecord, Examination],
    )
