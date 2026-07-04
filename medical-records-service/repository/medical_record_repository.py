from model.medical_record import MedicalRecord, Examination


async def get_record_by_patient(patient_id: int):
    return await MedicalRecord.find_one(MedicalRecord.patient_id == patient_id)


async def create_record(record: MedicalRecord) -> MedicalRecord:
    await record.insert()
    return record


async def get_examinations_by_patient(patient_id: int) -> list[Examination]:
    return await Examination.find(Examination.patient_id == patient_id).sort(-Examination.date).to_list()


async def get_examination_by_appointment(appointment_id: int):
    return await Examination.find_one(Examination.termin_id == appointment_id)


async def create_examination(examination: Examination) -> Examination:
    await examination.insert()
    return examination


async def update_record(record: MedicalRecord, fields: dict) -> MedicalRecord:
    await record.set(fields)
    return record
