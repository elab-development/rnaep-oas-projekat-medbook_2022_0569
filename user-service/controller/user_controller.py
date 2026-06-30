from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from database import get_db
from dto.register_requestDTO import PatientRegisterDTO, DoctorRegisterDTO, AdminRegisterDTO, LoginDTO, ScheduleDTO
from service.user_service import register_patient, register_doctor, register_admin, login, get_all_users, toggle_user_active, create_schedule
from security.jwt_security import get_current_user
from service.user_service import search_doctors
from dto.register_requestDTO import DoctorUpdateDTO
from service.user_service import update_doctor_profile
from service.user_service import remove_schedule

router = APIRouter()

@router.post("/register/patient")
async def register_patient_endpoint(dto: PatientRegisterDTO, db: AsyncSession = Depends(get_db)):
    try:
        await register_patient(db, dto)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")
    return {"message": "Patient registered successfully"}


@router.post("/register/doctor")
async def register_doctor_endpoint(dto: DoctorRegisterDTO, db: AsyncSession = Depends(get_db)):
    try:
        await register_doctor(db, dto)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")
    return {"message": "Doctor registered successfully"}


@router.post("/register/admin")
async def register_admin_endpoint(dto: AdminRegisterDTO, db: AsyncSession = Depends(get_db)):
    try:
        await register_admin(db, dto)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")
    return {"message": "Admin registered successfully"}

@router.post("/login")
async def login_endpoint(dto: LoginDTO, db: AsyncSession = Depends(get_db)):
    token = await login(db, dto)
    if token is None:
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return {"access_token": token}


@router.get("/users")
async def get_all_users_endpoint(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access this")
    users = await get_all_users(db)
    return users

@router.patch("/users/{id}/toggle-active")
async def toggle_user_active_endpoint(id: int, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access this")
    await toggle_user_active(db, id)
    return {"message": "User deactivated/activated"}

@router.post("/doctors/schedule")
async def create_schedule_endpoint(dto: ScheduleDTO, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create a schedule")
    await create_schedule(db, dto, current_user["id"])
    return {"message": "Schedule created"}

@router.get("/doctors")
async def search_doctors_endpoint(specialization: str, db: AsyncSession = Depends(get_db)):
    doctors = await search_doctors(db, specialization)
    return doctors

@router.put("/doctors/profile")
async def update_doctor_profile_endpoint(dto: DoctorUpdateDTO, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update profile")
    await update_doctor_profile(db, current_user["id"], dto)
    return {"message": "Profile updated"}

@router.delete("/doctors/schedule/{schedule_id}")
async def delete_schedule_endpoint(schedule_id: int, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can delete schedule")
    await remove_schedule(db, schedule_id, current_user["id"])
    return {"message": "Schedule deleted"}