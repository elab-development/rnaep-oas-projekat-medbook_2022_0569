from fastapi import FastAPI

app = FastAPI(title="MedBook - User Service")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "user-service"}
