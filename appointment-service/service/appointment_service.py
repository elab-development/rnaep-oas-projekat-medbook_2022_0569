from datetime import datetime, timedelta, date, timezone
import httpx
from config import settings
from repository.appointment_repository import (
    get_appointments_by_doctor_and_date,
    get_appointments_by_doctor,
    get_appointments_by_patient,
    get_appointment_by_id,
    create_appointment,
    update_appointment_status,
    delete_appointment,
)
from model.appointment import Appointment, AppointmentStatus
from fastapi import HTTPException

SLOT_DURATION_MINUTES = 30


async def get_available_slots(db, doctor_id: int, target_date: date):
    day_name = target_date.strftime("%A")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{settings.USER_SERVICE_URL}/doctors/{doctor_id}/schedule")
        schedules = response.json()

    working_hours = None
    for s in schedules:
        if s["day"] == day_name:
            working_hours = s
            break

    if working_hours is None:
        return []

    start = datetime.strptime(working_hours["start_time"], "%H:%M:%S").time()
    end = datetime.strptime(working_hours["end_time"], "%H:%M:%S").time()

    slots = []
    current = datetime.combine(target_date, start)
    end_dt = datetime.combine(target_date, end)

    while current + timedelta(minutes=SLOT_DURATION_MINUTES) <= end_dt:
        slot_end = current + timedelta(minutes=SLOT_DURATION_MINUTES)
        slots.append({"start_time": current.time(), "end_time": slot_end.time(), "datetime": current})
        current = slot_end

    appointments = await get_appointments_by_doctor_and_date(db, doctor_id, target_date)
    booked_times = [a.date for a in appointments]

    return [
        {
            "start_time": s["start_time"],
            "end_time": s["end_time"],
            "available": s["datetime"] not in booked_times,
        }
        for s in slots
    ]


async def book_appointment(db, doctor_id: int, patient_id: int, appointment_date: datetime, description: str = None):
    appointment = Appointment(
        doctor_id=doctor_id,
        patient_id=patient_id,
        status=AppointmentStatus.SCHEDULED,
        description=description,
        date=appointment_date,
    )
    return await create_appointment(db, appointment)


async def cancel_appointment(db, appointment_id: int, user_id: int):
    appointment = await get_appointment_by_id(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.patient_id != user_id and appointment.doctor_id != user_id:
        raise HTTPException(status_code=403, detail="Not your appointment")
    await delete_appointment(db, appointment)


async def complete_appointment(db, appointment_id: int, doctor_id: int):
    appointment = await get_appointment_by_id(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.doctor_id != doctor_id:
        raise HTTPException(status_code=403, detail="Not your appointment")
    return await update_appointment_status(db, appointment, AppointmentStatus.COMPLETED)


async def _fetch_names(user_ids: list[int]) -> dict[int, str]:
    if not user_ids:
        return {}
    ids_str = ','.join(str(i) for i in user_ids)
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{settings.USER_SERVICE_URL}/users/batch?ids={ids_str}")
        users = response.json()
    return {u["user_id"]: f"{u['name']} {u['surname']}" for u in users}


async def get_upcoming_slots(db, doctor_id: int, weeks: int = 3):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{settings.USER_SERVICE_URL}/doctors/{doctor_id}/schedule")
        schedules = response.json()

    if not schedules:
        return []

    schedule_by_day = {s["day"]: s for s in schedules}
    today = date.today()
    result = []

    for i in range(1, weeks * 7 + 1):
        target_date = today + timedelta(days=i)
        day_name = target_date.strftime("%A")

        if day_name not in schedule_by_day:
            continue

        working_hours = schedule_by_day[day_name]
        start = datetime.strptime(working_hours["start_time"], "%H:%M:%S").time()
        end = datetime.strptime(working_hours["end_time"], "%H:%M:%S").time()

        slots = []
        current = datetime.combine(target_date, start)
        end_dt = datetime.combine(target_date, end)

        while current + timedelta(minutes=SLOT_DURATION_MINUTES) <= end_dt:
            slot_end = current + timedelta(minutes=SLOT_DURATION_MINUTES)
            slots.append({"start_time": current.time(), "end_time": slot_end.time(), "datetime": current})
            current = slot_end

        appointments = await get_appointments_by_doctor_and_date(db, doctor_id, target_date)
        booked_times = [a.date for a in appointments]

        result.append({
            "date": str(target_date),
            "day_name": day_name,
            "slots": [
                {
                    "start_time": s["start_time"],
                    "end_time": s["end_time"],
                    "available": s["datetime"] not in booked_times,
                }
                for s in slots
            ],
        })

    return result


async def get_doctor_appointments(db, doctor_id: int):
    appointments = await get_appointments_by_doctor(db, doctor_id)
    patient_ids = list({a.patient_id for a in appointments})
    names = await _fetch_names(patient_ids)
    return [
        {
            "id": a.id,
            "doctor_id": a.doctor_id,
            "patient_id": a.patient_id,
            "patient_name": names.get(a.patient_id, f"Patient #{a.patient_id}"),
            "status": a.status,
            "description": a.description,
            "date": a.date,
        }
        for a in appointments
    ]


async def get_patient_appointments(db, patient_id: int):
    appointments = await get_appointments_by_patient(db, patient_id)
    doctor_ids = list({a.doctor_id for a in appointments})
    names = await _fetch_names(doctor_ids)
    return [
        {
            "id": a.id,
            "doctor_id": a.doctor_id,
            "patient_id": a.patient_id,
            "doctor_name": names.get(a.doctor_id, f"Doctor #{a.doctor_id}"),
            "status": a.status,
            "description": a.description,
            "date": a.date,
        }
        for a in appointments
    ]
