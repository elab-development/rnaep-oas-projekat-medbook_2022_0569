from datetime import datetime, timezone
from fastapi import HTTPException
from model.medical_record import MedicalRecord
from dto.medical_record_dto import MedicalRecordCreateDTO, MedicalRecordUpdateDTO
from repository.medical_record_repository import (
    get_record_by_patient,
    create_record,
    update_record,
)


async def create_medical_record(dto: MedicalRecordCreateDTO):
    existing = await get_record_by_patient(dto.patient_id)
    if existing:
        raise HTTPException(status_code=409, detail="Medical record already exists for this patient")
    record = MedicalRecord(
        patient_id=dto.patient_id,
        created_at=datetime.now(timezone.utc),
    )
    return await create_record(record)


async def get_medical_record(patient_id: int):
    record = await get_record_by_patient(patient_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record


async def update_medical_record(patient_id: int, dto: MedicalRecordUpdateDTO):
    record = await get_record_by_patient(patient_id)
    if record is None:
        record = MedicalRecord(
            patient_id=patient_id,
            created_at=datetime.now(timezone.utc),
        )
        await create_record(record)
    fields = {}
    if dto.blood_type is not None:
        fields["blood_type"] = dto.blood_type
    if dto.allergies is not None:
        fields["allergies"] = dto.allergies
    if dto.chronic_diseases is not None:
        fields["chronic_diseases"] = dto.chronic_diseases
    if fields:
        return await update_record(record, fields)
    return record
