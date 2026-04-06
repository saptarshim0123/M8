import api from './axiosInstance';

export const getChatRoom = (roomId) => api.get(`/therapist-chat/${roomId}`);
export const sendChatMessage = (roomId, text) => api.post(`/therapist-chat/${roomId}`, { text });
