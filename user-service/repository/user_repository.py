from sqlalchemy.ext.asyncio import AsyncSession
from model.user import User, Patient, Doctor, Admin
from sqlalchemy import select

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