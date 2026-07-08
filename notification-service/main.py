import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from events.kafka_consumer import start_consumer, stop_consumer, notifications

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_consumer()
    yield
    await stop_consumer()


app = FastAPI(title="MedBook - Notification Service", lifespan=lifespan)


@app.get("/notifications")
async def get_notifications(limit: int = 50):
    return list(notifications)[:limit]


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notification-service"}

Instrumentator().instrument(app).expose(app)
