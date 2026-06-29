from fastapi import FastAPI

app = FastAPI(title="MedBook - Medical Record Service")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "medical-record-service"}
