from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from service.appointment_service import (
    get_available_slots,
    get_upcoming_slots,
    book_appointment,
    cancel_appointment,
    complete_appointment,
    get_doctor_appointments,
    get_patient_appointments,
)
from dto.appointment_dto import AppointmentCreateDTO, AppointmentResponseDTO
from security.jwt_security import get_current_user
from datetime import date

router = APIRouter()


@router.get("/doctors/{doctor_id}/upcoming-slots")
async def get_upcoming_slots_endpoint(
    doctor_id: int,
    weeks: int = 3,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_upcoming_slots(db, doctor_id, weeks)


@router.get("/doctors/{doctor_id}/slots")
async def get_slots_endpoint(
    doctor_id: int,
    target_date: date,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_available_slots(db, doctor_id, target_date)


@router.post("/appointments")
async def book_appointment_endpoint(
    dto: AppointmentCreateDTO,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    appointment = await book_appointment(db, dto.doctor_id, current_user["id"], dto.date, dto.description)
    return AppointmentResponseDTO.model_validate(appointment)


@router.get("/appointments/doctor")
async def get_doctor_appointments_endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access this")
    return await get_doctor_appointments(db, current_user["id"])


@router.get("/appointments/patient")
async def get_patient_appointments_endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access this")
    return await get_patient_appointments(db, current_user["id"])


@router.delete("/appointments/{appointment_id}")
async def cancel_appointment_endpoint(
    appointment_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await cancel_appointment(db, appointment_id, current_user["id"])
    return {"message": "Appointment cancelled, slot is now available"}


@router.patch("/appointments/{appointment_id}/complete")
async def complete_appointment_endpoint(
    appointment_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can complete appointments")
    appointment = await complete_appointment(db, appointment_id, current_user["id"])
    return AppointmentResponseDTO.model_validate(appointment)
