import client from './client';

export const getDoctorAppointments = () =>
  client.get('/appointments/appointments/doctor').then((r) => r.data);

export const getPatientAppointments = () =>
  client.get('/appointments/appointments/patient').then((r) => r.data);

export const bookAppointment = (doctor_id, date, description = null) =>
  client.post('/appointments/appointments', { doctor_id, date, description }).then((r) => r.data);

export const cancelAppointment = (id) =>
  client.delete(`/appointments/appointments/${id}`).then((r) => r.data);

export const completeAppointment = (id) =>
  client.patch(`/appointments/appointments/${id}/complete`).then((r) => r.data);

export const getAvailableSlots = (doctorId, targetDate) =>
  client
    .get(`/appointments/doctors/${doctorId}/slots`, { params: { target_date: targetDate } })
    .then((r) => r.data);

export const getUpcomingSlots = (doctorId, weeks = 3) =>
  client
    .get(`/appointments/doctors/${doctorId}/upcoming-slots`, { params: { weeks } })
    .then((r) => r.data);
