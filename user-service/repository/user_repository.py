from sqlalchemy.ext.asyncio import AsyncSession
from model.user import User, Patient, Doctor, Admin, Schedule
from sqlalchemy import select
from fastapi import HTTPException

async def create_user(db: AsyncSession, user: User) -> User:
    db.add(user)
    await db.flush()
    return user

async def create_patient(db: AsyncSession, patient: Patient) -> Patient:
    db.add(patient)
    return patient

async def create_doctor(db: AsyncSession, doctor: Doctor) -> Doctor:
    db.add(doctor)
    return doctor

async def create_admin(db: AsyncSession, admin: Admin) -> Admin:
    db.add(admin)
    return admin


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_all_users(db:AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()

async def get_user_by_id(db:AsyncSession, id : int):
    result = await db.execute(select(User).where(User.user_id == id))
    return result.scalar_one_or_none()

async def set_working_hours(db:AsyncSession, schedule : Schedule):
    db.add(schedule)
    return schedule

async def get_doctor_by_user_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(Doctor).where(Doctor.users_id == user_id))
    return result.scalar_one_or_none()

async def get_doctors_by_specialization(db: AsyncSession, spec: str):
    result = await db.execute(
        select(User, Doctor).join(Doctor, User.user_id == Doctor.users_id).where(Doctor.specialization == spec)
    )
    return result.all()


async def update_doctor(db: AsyncSession, doctor: Doctor):
    await db.commit()
    await db.refresh(doctor)
    return doctor


async def delete_schedule(db: AsyncSession, schedule_id: int, doctor_licence: str):
    result = await db.execute(
        select(Schedule).where(Schedule.schedule_id == schedule_id, Schedule.doctor_licence == doctor_licence)
    )
    schedule = result.scalar_one_or_none()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")
    await db.delete(schedule)
    await db.commit()