import api from './axiosInstance';

export const getPatients = () => api.get('/therapist/patients');
export const getPatientDetail = (userId) => api.get(`/therapist/patients/${userId}`);
export const getPatientSummary = (userId) => api.get(`/therapist/patients/${userId}/summary`);
export const getConnectionRequests = () => api.get('/therapist/requests');
export const acceptRequest = (id) => api.put(`/therapist/requests/${id}/accept`);
export const rejectRequest = (id) => api.put(`/therapist/requests/${id}/reject`);
