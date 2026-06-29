from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://medbook:medbook123@postgres:5433/user_db"
    JWT_SECRET: str = "supersecretkey123medbook"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60

settings = Settings()