from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from database import engine, Base
from controller.appointment_controller import router
from events.kafka_producer import start_producer, stop_producer
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await start_producer()
    yield
    await stop_producer()
    await engine.dispose()


app = FastAPI(title="MedBook - Appointment Service", lifespan=lifespan)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(status_code=500, content={"error": traceback.format_exc()})


app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "appointment-service"}

Instrumentator().instrument(app).expose(app)