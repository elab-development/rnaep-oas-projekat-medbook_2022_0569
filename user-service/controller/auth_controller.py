from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from database import get_db
from dto.register_requestDTO import PatientRegisterDTO, DoctorRegisterDTO, AdminRegisterDTO, LoginDTO
from service.auth_service import register_patient, register_doctor, register_admin, login
from security.jwt_security import get_current_user

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
async def register_admin_endpoint(
    dto: AdminRegisterDTO,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can register new admins")
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
