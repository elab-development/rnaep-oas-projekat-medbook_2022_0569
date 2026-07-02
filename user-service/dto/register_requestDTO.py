from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from model.user import Specialization, DayOfWeek, UserRole
from datetime import time



class UserRegisterDTO(BaseModel):
    name: str
    surname: str
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class PatientRegisterDTO(UserRegisterDTO):
    telephone: str
    address: str
    date_of_birth: date


class AdminRegisterDTO(UserRegisterDTO):
    pass


class DoctorRegisterDTO(UserRegisterDTO):
    city: str
    hire_date: date
    specialization: Specialization


class LoginDTO(BaseModel):
    email: str
    password: str


class ScheduleDTO(BaseModel):
    day: DayOfWeek
    start_time: time
    end_time: time


class UserResponseDTO(BaseModel):
    user_id: int
    name: str
    surname: str
    email: str
    role: UserRole
    active: bool


    class Config:
        from_attributes = True

class DoctorResponseDTO(BaseModel):
    user_id: int
    name: str
    surname: str
    email: str
    specialization: Specialization
    city: str
    hire_date: date


class DoctorProfileDTO(BaseModel):
    user_id: int
    name: str
    surname: str
    email: str
    specialization: Specialization
    city: str
    hire_date: date
    licence: str


class ScheduleResponseDTO(BaseModel):
    schedule_id: int
    day: DayOfWeek
    start_time: time
    end_time: time

    class Config:
        from_attributes = True


class DoctorUpdateDTO(BaseModel):
    city: str = None
    specialization: Specialization = None


