from datetime import datetime, timezone
from fastapi import HTTPException
from model.medical_record import MedicalRecord, Examination, Therapy
from dto.medical_record_dto import ExaminationCreateDTO, MedicalRecordCreateDTO, MedicalRecordUpdateDTO
from repository.medical_record_repository import (
    get_record_by_patient,
    create_record,
    update_record,
    get_examinations_by_patient,
    get_examination_by_appointment,
    create_examination,
)


async def create_medical_record(dto: MedicalRecordCreateDTO):
    existing = await get_record_by_patient(dto.patient_id)
    if existing:
        raise HTTPException(status_code=409, detail="Medical record already exists for this patient")
    record = MedicalRecord(
        patient_id=dto.patient_id,
        blood_type=dto.blood_type,
        allergies=dto.allergies,
        chronic_diseases=dto.chronic_diseases,
        created_at=datetime.now(timezone.utc),
    )
    return await create_record(record)


async def get_medical_record(patient_id: int):
    record = await get_record_by_patient(patient_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record


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
