import api from './axiosInstance';

export const sendChatMessage = (message, sessionId = null) =>
    api.post('/chat/message', { message, sessionId });

export const getChatSessions = () =>
    api.get('/chat/sessions');

export const getChatSession = (id) =>
    api.get(`/chat/session/${id}`);

export const deleteChatSession = (id) =>
    api.delete(`/chat/session/${id}`);
