import client from './client';

export const login = (data) => client.post('/users/login', data);

export const registerPatient = (data) => client.post('/users/register/patient', data);
export const registerDoctor = (data) => client.post('/users/register/doctor', data);
export const registerAdmin = (data) => client.post('/users/register/admin', data);
