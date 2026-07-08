from fastapi import APIRouter, Depends, HTTPException
from security.jwt_security import get_current_user
from dto.medical_record_dto import ExaminationCreateDTO
from service.examination_service import add_examination, get_patient_examinations
import httpx
from urllib.parse import quote

router = APIRouter()


@router.post("/examinations")
async def create_examination_endpoint(
    dto: ExaminationCreateDTO,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can add examinations")
    result = await add_examination(dto, current_user["id"])
    return {"id": str(result.id), "message": "Examination saved"}


@router.get("/examinations/patient/{patient_id}")
async def get_examinations_endpoint(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] not in ("doctor", "patient"):
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "patient" and current_user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")
    examinations = await get_patient_examinations(patient_id)
    return [
        {
            "id": str(e.id),
            "appointment_id": e.termin_id,
            "patient_id": e.patient_id,
            "doctor_id": e.doctor_id,
            "date": e.date,
            "diagnosis": e.diagnosis,
            "symptoms": e.symptoms,
            "recommendations": e.recommendations,
            "therapy": [t.model_dump() for t in e.therapy],
            "description": e.description,
        }
        for e in examinations
    ]


@router.get("/diagnosis-info")
async def get_diagnosis_info(
    term: str,
    current_user: dict = Depends(get_current_user),
):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(term)}",
            timeout=10,
        )
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="No Wikipedia article found")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Wikipedia service unavailable")
    data = resp.json()
    return {
        "title": data.get("title"),
        "extract": data.get("extract"),
        "thumbnail": data.get("thumbnail", {}).get("source"),
        "page_url": data.get("content_urls", {}).get("desktop", {}).get("page"),
    }
