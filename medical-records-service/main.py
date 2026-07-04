from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from database import init_db
from controller.medical_record_controller import router
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="MedBook - Medical Records Service", lifespan=lifespan)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(status_code=500, content={"error": traceback.format_exc()})


app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "medical-records-service"}
