from sqlalchemy import Column, Integer, String, Boolean, Enum, Date, Time, ForeignKey, UniqueConstraint
import enum
from database import Base


class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class DayOfWeek(str, enum.Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"



class User(Base):
    __tablename__="users"

    user_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), nullable=False)


class Patient(Base):
    __tablename__="patients"

    lbo = Column(String, primary_key=True)
    telephon = Column(Integer, nullable=False)
    adress = Column(String, nullable=False)
    dateOfBirth = Column(Date, nullable=False)
    users_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)

class Admin(Base):
    __tablename__="admins"

    badge_number = Column(String, primary_key=True)
    users_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)


class Doctor(Base):
    __tablename__="doctors"

    licence = Column(String, primary_key=True)
    city = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    hireDate = Column(Date, nullable=False)
    users_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)

class Schedule(Base):
    __tablename__="schedule"

    schedule_id = Column(Integer, primary_key=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    day = Column(Enum(DayOfWeek), nullable=False)
    doctor_licence = Column(String, ForeignKey("doctors.licence", ondelete="CASCADE"))

    __table_args__ = (
        UniqueConstraint("doctor_licence", "day", name="uq_doctor_day"),
    )

