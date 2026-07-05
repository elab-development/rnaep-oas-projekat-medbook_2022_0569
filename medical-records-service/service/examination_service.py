from datetime import datetime, timezone
from fastapi import HTTPException
from model.medical_record import Examination, Therapy
from dto.medical_record_dto import ExaminationCreateDTO
from repository.medical_record_repository import (
    get_examinations_by_patient,
    get_examination_by_appointment,
    create_examination,
)


async def add_examination(dto: ExaminationCreateDTO, doctor_id: int):
    existing = await get_examination_by_appointment(dto.appointment_id)
    if existing:
        raise HTTPException(status_code=409, detail="Examination already exists for this appointment")
    examination = Examination(
        patient_id=dto.patient_id,
        doctor_id=doctor_id,
        termin_id=dto.appointment_id,
        date=datetime.now(timezone.utc),
        diagnosis=dto.diagnosis,
        symptoms=dto.symptoms,
        recommendations=dto.recommendations,
        therapy=[Therapy(**t.model_dump()) for t in dto.therapy],
        description=dto.description,
    )
    return await create_examination(examination)


async def get_patient_examinations(patient_id: int):
    return await get_examinations_by_patient(patient_id)
