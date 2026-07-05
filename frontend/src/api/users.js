import client from './client';

export const getAllDoctors = () =>
  client.get('/users/doctors/all').then((r) => r.data);

export const getDoctorSchedule = (doctorId) =>
  client.get(`/users/doctors/${doctorId}/schedule`).then((r) => r.data);

export const getMyDoctorProfile = () =>
  client.get('/users/doctors/profile').then((r) => r.data);

export const updateDoctorProfile = (city, specialization) =>
  client.put('/users/doctors/profile', { city, specialization }).then((r) => r.data);

export const getAllUsers = () =>
  client.get('/users/users').then((r) => r.data);

export const toggleUserActive = (id) =>
  client.patch(`/users/users/${id}/toggle-active`).then((r) => r.data);
