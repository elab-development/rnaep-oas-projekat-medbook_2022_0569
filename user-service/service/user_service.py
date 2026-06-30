from sqlalchemy.ext.asyncio import AsyncSession
from model.user import User, Patient, UserRole, Doctor, Admin
from security.jwt_security import hash_password, verify_password, create_access_token
from repository.user_repository import create_user, create_patient, create_doctor, create_admin
import secrets
from repository.user_repository import get_user_by_email
async def register_patient(db: AsyncSession, dto):
    hashed = hash_password(dto.password)

    user = User(
        name=dto.name,
        surname=dto.surname,
        email=dto.email,
        password_hash=hashed,
        role=UserRole.PATIENT
    )
    await create_user(db, user)

    patient = Patient(
        lbo=str(secrets.randbelow(10**11)).zfill(11),
        telephone=dto.telephone,
        address=dto.address,
        date_of_birth=dto.date_of_birth,
        users_id=user.user_id
    )
    await create_patient(db, patient)
    await db.commit()


async def register_doctor(db: AsyncSession, dto):
    hashed = hash_password(dto.password)

    user = User(
        name=dto.name,
        surname=dto.surname,
        email=dto.email,
        password_hash=hashed,
        role=UserRole.DOCTOR
    )
    await create_user(db, user)

    doctor = Doctor(
        licence=str(secrets.randbelow(10**8)).zfill(8),
        city=dto.city,
        specialization=dto.specialization,
        hire_date=dto.hire_date,
        users_id=user.user_id
    )
    await create_doctor(db, doctor)
    await db.commit()



async def register_admin(db: AsyncSession, dto):
    hashed = hash_password(dto.password)

    user = User(
        name=dto.name,
        surname=dto.surname,
        email=dto.email,
        password_hash=hashed,
        role=UserRole.ADMIN
    )
    await create_user(db, user)

    admin = Admin(
        badge_number=str(secrets.randbelow(10**8)).zfill(8),
        users_id=user.user_id
    )
    await create_admin(db, admin)
    await db.commit()



async def login(db: AsyncSession, dto) -> str:
    user = await get_user_by_email(db, dto.email)
    if user is None:
        return None
    if not verify_password(dto.password, user.password_hash):
        return None
    return create_access_token({"sub": str(user.user_id), "role": user.role.value})
