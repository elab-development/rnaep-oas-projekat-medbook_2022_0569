from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://medbook:medbook123@postgres_appointment:5432/appointment_db"
    JWT_SECRET: str = "supersecretkey123medbook"
    JWT_ALGORITHM: str = "HS256"
    USER_SERVICE_URL: str = "http://user-service:8000"

settings = Settings()