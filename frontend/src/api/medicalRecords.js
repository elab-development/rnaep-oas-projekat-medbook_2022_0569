import client from './client';

export const addExamination = (data) =>
  client.post('/medical-records/examinations', data).then((r) => r.data);

export const getPatientExaminations = (patientId) =>
  client.get(`/medical-records/examinations/patient/${patientId}`).then((r) => r.data);

export const getPatientRecord = (patientId) =>
  client.get(`/medical-records/records/${patientId}`).then((r) => r.data);

export const createPatientRecord = (patientId) =>
  client.post('/medical-records/records', { patient_id: patientId }).then((r) => r.data);

export const updatePatientRecord = (patientId, data) =>
  client.patch(`/medical-records/records/${patientId}`, data).then((r) => r.data);
