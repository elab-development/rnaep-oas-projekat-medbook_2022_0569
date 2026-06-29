from sqlalchemy import Column, Integer, String, Boolean, Enum, Date, Time, DateTime,ForeignKey, UniqueConstraint
import enum
from database import Base


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Appointment(Base):
    __tablename__="appointments"

    id = Column(Integer, primary_key=True)
    doctor_id = Column(Integer, nullable=False)
    patient_id = Column(Integer, nullable=False)
    status = Column(Enum(AppointmentStatus), nullable=False)
    description = Column(String, nullable=True)
    date = Column(DateTime, nullable=False)