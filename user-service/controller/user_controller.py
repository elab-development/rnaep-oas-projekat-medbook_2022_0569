from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from service.user_service import (
    get_all_users, toggle_user_active, create_schedule,
    search_doctors, get_all_doctors,
    update_doctor_profile, remove_schedule,
    get_my_schedule, get_doctor_schedule_by_id, get_my_profile,
)
from repository.user_repository import get_users_by_ids
from security.jwt_security import get_current_user
from dto.register_requestDTO import DoctorUpdateDTO, ScheduleDTO
import httpx

router = APIRouter()


@router.get("/users")
async def get_all_users_endpoint(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access this")
    return await get_all_users(db)


@router.patch("/users/{id}/toggle-active")
async def toggle_user_active_endpoint(id: int, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access this")
    await toggle_user_active(db, id)
    return {"message": "User deactivated/activated"}


@router.get("/users/batch")
async def get_users_batch_endpoint(ids: str, db: AsyncSession = Depends(get_db)):
    id_list = [int(i) for i in ids.split(',') if i.strip().isdigit()]
    users = await get_users_by_ids(db, id_list)
    return [{"user_id": u.user_id, "name": u.name, "surname": u.surname} for u in users]


@router.get("/weather")
async def get_weather(lat: float, lon: float, current_user: dict = Depends(get_current_user)):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}&current=temperature_2m,weathercode"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Weather service unavailable")
    data = resp.json()
    return {
        "temperature": data["current"]["temperature_2m"],
        "weathercode": data["current"]["weathercode"],
    }


@router.get("/doctors/profile")
async def get_my_profile_endpoint(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access this")
    return await get_my_profile(db, current_user["id"])


@router.get("/doctors/schedule")
async def get_my_schedule_endpoint(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access this")
    return await get_my_schedule(db, current_user["id"])


@router.post("/doctors/schedule")
async def create_schedule_endpoint(dto: ScheduleDTO, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create a schedule")
    await create_schedule(db, dto, current_user["id"])
    return {"message": "Schedule created"}


@router.get("/doctors/all")
async def get_all_doctors_endpoint(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_all_doctors(db)


@router.get("/doctors")
async def search_doctors_endpoint(specialization: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await search_doctors(db, specialization)


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


@router.get("/doctors/{doctor_id}/schedule")
async def get_doctor_schedule_endpoint(doctor_id: int, db: AsyncSession = Depends(get_db)):
    return await get_doctor_schedule_by_id(db, doctor_id)
