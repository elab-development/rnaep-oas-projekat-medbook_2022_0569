from pydantic import BaseModel
from datetime import time, datetime
from typing import Optional
from model.appointment import AppointmentStatus


class SlotResponseDTO(BaseModel):
    start_time: time
    end_time: time
    available: bool


class AppointmentCreateDTO(BaseModel):
    doctor_id: int
    date: datetime
    description: Optional[str] = None


class AppointmentResponseDTO(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    status: AppointmentStatus
    description: Optional[str] = None
    date: datetime

    class Config:
        from_attributes = True


class AppointmentDetailDTO(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    status: AppointmentStatus
    description: Optional[str] = None
    date: datetime
