from fastapi import APIRouter, Depends, HTTPException
from security.jwt_security import get_current_user
from dto.medical_record_dto import MedicalRecordCreateDTO, MedicalRecordUpdateDTO
from service.medical_record_service import (
    create_medical_record,
    get_medical_record,
    update_medical_record,
)

router = APIRouter()


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
