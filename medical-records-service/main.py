from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from database import init_db
from controller.medical_record_controller import router
from controller.examination_controller import router as examination_router
from events.kafka_producer import start_producer, stop_producer
from events.kafka_consumer import start_consumer, stop_consumer
import traceback



@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await start_producer()
    start_consumer()
    yield
    await stop_consumer()
    await stop_producer()


app = FastAPI(title="MedBook - Medical Records Service", lifespan=lifespan)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(status_code=500, content={"error": traceback.format_exc()})


app.include_router(router)
app.include_router(examination_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "medical-records-service"}

Instrumentator().instrument(app).expose(app)