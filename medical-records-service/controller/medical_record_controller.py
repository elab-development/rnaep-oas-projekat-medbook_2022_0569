from fastapi import APIRouter, Depends, HTTPException
from security.jwt_security import get_current_user
import httpx
from dto.medical_record_dto import ExaminationCreateDTO, MedicalRecordCreateDTO, MedicalRecordUpdateDTO
from service.medical_record_service import (
    add_examination,
    get_patient_examinations,
    create_medical_record,
    get_medical_record,
    update_medical_record,
)

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


@router.post("/records")
async def create_record_endpoint(
    dto: MedicalRecordCreateDTO,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] == "patient":
        if current_user["id"] != dto.patient_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Access denied")
    result = await create_medical_record(dto)
    return {"id": str(result.id), "message": "Medical record created"}


@router.get("/records/{patient_id}")
async def get_record_endpoint(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] not in ("doctor", "patient"):
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "patient" and current_user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")
    record = await get_medical_record(patient_id)
    return {
        "id": str(record.id),
        "patient_id": record.patient_id,
        "blood_type": record.blood_type,
        "allergies": record.allergies,
        "chronic_diseases": record.chronic_diseases,
        "created_at": record.created_at,
    }


@router.patch("/records/{patient_id}")
async def update_record_endpoint(
    patient_id: int,
    dto: MedicalRecordUpdateDTO,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update medical records")
    record = await update_medical_record(patient_id, dto)
    return {
        "id": str(record.id),
        "patient_id": record.patient_id,
        "blood_type": record.blood_type,
        "allergies": record.allergies,
        "chronic_diseases": record.chronic_diseases,
        "created_at": record.created_at,
    }


@router.get("/diagnosis-info")
async def get_diagnosis_info(
    term: str,
    current_user: dict = Depends(get_current_user),
):
    url = (
        "https://en.wikipedia.org/w/api.php"
        "?action=query&generator=search"
        f"&gsrsearch={httpx.URL(term)}"
        "&prop=extracts|pageimages|info"
        "&exintro=1&exsentences=4&explaintext=1"
        "&pithumbsize=200&inprop=url"
        "&gsrlimit=1&format=json"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Wikipedia service unavailable")
    data = resp.json()
    pages = data.get("query", {}).get("pages")
    if not pages:
        raise HTTPException(status_code=404, detail="No Wikipedia article found")
    page = list(pages.values())[0]
    return {
        "title": page.get("title"),
        "extract": page.get("extract"),
        "thumbnail": page.get("thumbnail", {}).get("source"),
        "page_url": page.get("fullurl"),
    }


