from sqlalchemy.ext.asyncio import AsyncSession
from model.user import User, Doctor, Schedule
from repository.user_repository import get_all_users as get_all_users_repo
from repository.user_repository import get_user_by_id as get_user_by_id_repo
from repository.user_repository import set_working_hours as set_working_hours_repo
from repository.user_repository import get_doctor_by_user_id
from fastapi import HTTPException
from dto.register_requestDTO import UserResponseDTO
from repository.user_repository import get_doctors_by_specialization, get_all_doctors as get_all_doctors_repo
from dto.register_requestDTO import DoctorResponseDTO, DoctorProfileDTO, ScheduleResponseDTO
from repository.user_repository import get_doctor_by_user_id, update_doctor
from repository.user_repository import delete_schedule, get_doctor_by_user_id
from repository.user_repository import get_schedule_by_user_id


async def get_all_users(db: AsyncSession) -> list[UserResponseDTO]:
    users = await get_all_users_repo(db)
    return [UserResponseDTO.model_validate(u) for u in users]


async def toggle_user_active(db: AsyncSession, id: int):
    user = await get_user_by_id_repo(db, id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = not user.active
    await db.commit()

async def create_schedule(db: AsyncSession, dto, user_id: int):
    doctor = await get_doctor_by_user_id(db, user_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")

    schedule = Schedule(
        day=dto.day,
        start_time=dto.start_time,
        end_time=dto.end_time,
        doctor_licence=doctor.licence
    )
    await set_working_hours_repo(db, schedule)
    await db.commit()

async def get_all_doctors(db: AsyncSession):
    results = await get_all_doctors_repo(db)
    return [
        DoctorResponseDTO(
            user_id=user.user_id,
            name=user.name,
            surname=user.surname,
            email=user.email,
            specialization=doctor.specialization,
            city=doctor.city,
            hire_date=doctor.hire_date
        )
        for user, doctor in results
    ]

async def search_doctors(db: AsyncSession, specialization: str):
    results = await get_doctors_by_specialization(db, specialization)
    return [
        DoctorResponseDTO(
            user_id=user.user_id,
            name=user.name,
            surname=user.surname,
            email=user.email,
            specialization=doctor.specialization,
            city=doctor.city,
            hire_date=doctor.hire_date
        )
        for user, doctor in results
    ]

async def update_doctor_profile(db: AsyncSession, user_id: int, dto):
    doctor = await get_doctor_by_user_id(db, user_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if dto.city is not None:
        doctor.city = dto.city
    if dto.specialization is not None:
        doctor.specialization = dto.specialization
    await update_doctor(db, doctor)

async def remove_schedule(db: AsyncSession, schedule_id: int, user_id: int):
    doctor = await get_doctor_by_user_id(db, user_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    await delete_schedule(db, schedule_id, doctor.licence)

async def get_my_schedule(db: AsyncSession, user_id: int) -> list[ScheduleResponseDTO]:
    schedules = await get_schedule_by_user_id(db, user_id)
    return [ScheduleResponseDTO.model_validate(s) for s in schedules]

async def get_doctor_schedule_by_id(db: AsyncSession, doctor_id: int) -> list[ScheduleResponseDTO]:
    schedules = await get_schedule_by_user_id(db, doctor_id)
    return [ScheduleResponseDTO.model_validate(s) for s in schedules]

async def get_my_profile(db: AsyncSession, user_id: int) -> DoctorProfileDTO:
    user = await get_user_by_id_repo(db, user_id)
    doctor = await get_doctor_by_user_id(db, user_id)
    if user is None or doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return DoctorProfileDTO(
        user_id=user.user_id,
        name=user.name,
        surname=user.surname,
        email=user.email,
        specialization=doctor.specialization,
        city=doctor.city,
        hire_date=doctor.hire_date,
        licence=doctor.licence,
    )
