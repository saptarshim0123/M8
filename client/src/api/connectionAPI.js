import api from './axiosInstance';

export const connectWithCode = (practiceCode) => api.post('/connection/connect', { practiceCode });
export const getMyTherapist = () => api.get('/connection/my-therapist');
export const disconnectTherapist = (id) => api.delete(`/connection/${id}`);
export const toggleShareJournals = () => api.put('/connection/toggle-share');
