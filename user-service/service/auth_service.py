import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from model.user import User, Patient, Doctor, Admin, UserRole
from security.jwt_security import hash_password, verify_password, create_access_token
from repository.user_repository import (
    get_user_by_email,
    create_user,
    create_patient,
    create_doctor,
    create_admin,
)
from events.kafka_producer import publish


async def register_patient(db: AsyncSession, dto):
    user = User(
        name=dto.name,
        surname=dto.surname,
        email=dto.email,
        password_hash=hash_password(dto.password),
        role=UserRole.PATIENT,
    )
    await create_user(db, user)
    patient = Patient(
        lbo=str(secrets.randbelow(10**11)).zfill(11),
        telephone=dto.telephone,
        address=dto.address,
        date_of_birth=dto.date_of_birth,
        users_id=user.user_id,
    )
    await create_patient(db, patient)
    await db.commit()
    await publish("user-registered", {
        "user_id": user.user_id,
        "role": "patient",
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
    })


async def register_doctor(db: AsyncSession, dto):
    user = User(
        name=dto.name,
        surname=dto.surname,
        email=dto.email,
        password_hash=hash_password(dto.password),
        role=UserRole.DOCTOR,
    )
    await create_user(db, user)
    doctor = Doctor(
        licence=str(secrets.randbelow(10**8)).zfill(8),
        city=dto.city,
        specialization=dto.specialization,
        hire_date=dto.hire_date,
        users_id=user.user_id,
    )
    await create_doctor(db, doctor)
    await db.commit()
    await publish("user-registered", {
        "user_id": user.user_id,
        "role": "doctor",
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
    })


async def register_admin(db: AsyncSession, dto):
    user = User(
        name=dto.name,
        surname=dto.surname,
        email=dto.email,
        password_hash=hash_password(dto.password),
        role=UserRole.ADMIN,
    )
    await create_user(db, user)
    admin = Admin(
        badge_number=str(secrets.randbelow(10**8)).zfill(8),
        users_id=user.user_id,
    )
    await create_admin(db, admin)
    await db.commit()


async def login(db: AsyncSession, dto) -> str | None:
    user = await get_user_by_email(db, dto.email)
    if user is None:
        return None
    if not verify_password(dto.password, user.password_hash):
        return None
    if not user.active:
        return None
    return create_access_token({"sub": str(user.user_id), "role": user.role.value})
