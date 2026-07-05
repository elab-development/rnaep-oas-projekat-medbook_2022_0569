from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from model.medical_record import BloodType, Therapy


class TherapyDTO(BaseModel):
    medicine: str
    dose: str
    frequency: str
    duration: int


class ExaminationCreateDTO(BaseModel):
    appointment_id: int
    patient_id: int
    diagnosis: str
    symptoms: list[str]
    recommendations: str
    therapy: list[TherapyDTO] = []
    description: str = ""


class ExaminationResponseDTO(BaseModel):
    id: str
    appointment_id: int
    patient_id: int
    doctor_id: int
    date: datetime
    diagnosis: str
    symptoms: list[str]
    recommendations: str
    therapy: list[TherapyDTO]
    description: str


class MedicalRecordCreateDTO(BaseModel):
    patient_id: int
    blood_type: Optional[BloodType] = None
    allergies: list[str] = []
    chronic_diseases: list[str] = []


class MedicalRecordUpdateDTO(BaseModel):
    blood_type: Optional[BloodType] = None
    allergies: Optional[list[str]] = None
    chronic_diseases: Optional[list[str]] = None


class MedicalRecordResponseDTO(BaseModel):
    id: str
    patient_id: int
    blood_type: Optional[BloodType]
    allergies: list[str]
    chronic_diseases: list[str]
    created_at: datetime
