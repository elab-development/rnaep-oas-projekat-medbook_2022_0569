from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from database import engine, Base
from controller.user_controller import router
from controller.auth_controller import router as auth_router
import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="MedBook - User Service", lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(status_code=500, content={"error": traceback.format_exc()})

app.include_router(auth_router)
app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "user-service"}