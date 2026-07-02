import client from './client';

export const getMySchedule = () =>
  client.get('/users/doctors/schedule').then((r) => r.data);

export const addSchedule = (day, start_time, end_time) =>
  client.post('/users/doctors/schedule', { day, start_time, end_time }).then((r) => r.data);

export const removeSchedule = (id) =>
  client.delete(`/users/doctors/schedule/${id}`).then((r) => r.data);
