from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from model.user import Specialization


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
