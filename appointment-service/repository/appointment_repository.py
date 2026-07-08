from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from model.appointment import Appointment, AppointmentStatus
from datetime import datetime, date


async def get_appointments_by_doctor_and_date(db: AsyncSession, doctor_id: int, target_date: date):
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())
    result = await db.execute(
        select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.date >= start,
            Appointment.date <= end,
            Appointment.status != AppointmentStatus.CANCELLED,
        )
    )
    return result.scalars().all()


async def get_appointments_by_doctor(db: AsyncSession, doctor_id: int):
    result = await db.execute(
        select(Appointment)
        .where(Appointment.doctor_id == doctor_id)
        .order_by(Appointment.date)
    )
    return result.scalars().all()


async def get_appointments_by_patient(db: AsyncSession, patient_id: int):
    result = await db.execute(
        select(Appointment)
        .where(Appointment.patient_id == patient_id)
        .order_by(Appointment.date)
    )
    return result.scalars().all()


async def get_appointment_by_id(db: AsyncSession, appointment_id: int):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    return result.scalar_one_or_none()


async def create_appointment(db: AsyncSession, appointment: Appointment):
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    return appointment


async def delete_appointment(db: AsyncSession, appointment: Appointment):
    await db.delete(appointment)
    await db.commit()


async def update_appointment_status(db: AsyncSession, appointment: Appointment, status: AppointmentStatus):
    appointment.status = status
    await db.commit()
    await db.refresh(appointment)
    return appointment
