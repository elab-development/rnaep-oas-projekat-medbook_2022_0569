import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser = (data) => api.post('/users/login', data);
export const registerPatient = (data) => api.post('/users/register/patient', data);
export const registerDoctor = (data) => api.post('/users/register/doctor', data);
export const registerAdmin = (data) => api.post('/users/register/admin', data);

export default api;
