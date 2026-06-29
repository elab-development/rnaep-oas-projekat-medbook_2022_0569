from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mongodb://medbook:medbook123@mongo_medicaldoc:27017/medical_records_db?authSource=admin"
    JWT_SECRET: str = "supersecretkey123medbook"
    JWT_ALGORITHM: str = "HS256"

settings = Settings()