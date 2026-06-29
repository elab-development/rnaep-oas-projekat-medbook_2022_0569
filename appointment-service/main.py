from fastapi import FastAPI

app = FastAPI(title="MedBook - Appointment Service")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "appointment-service"}
