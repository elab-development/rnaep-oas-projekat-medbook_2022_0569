from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import enum

class BloodType(str, enum.Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    UNKNOWN = "Unknown"


class MedicalRecord(Document):
    patient_id: int
    blood_type: Optional[BloodType] = BloodType.UNKNOWN
    allergies: list[str] = []
    chronic_diseases: list[str] = []
    created_at: datetime

    class Settings:
        name = "medical_records"


class Therapy(BaseModel):
    medicine : str
    dose : str
    frequency : str
    duration : int

class Examination(Document):
    patient_id : int
    doctor_id : int
    termin_id : int
    date : datetime
    diagnosis : str
    symptoms : list[str]
    recommendations : str
    therapy : list[Therapy]
    description : str

    class Settings:
        name = "examination"


