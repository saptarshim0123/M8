import api from './axiosInstance';

export const getAdminStats = () => api.get('/admin/stats');
export const getUserGrowth = (days = 30) => api.get(`/admin/user-growth?days=${days}`);
export const getUserDeletions = (days = 30) => api.get(`/admin/user-deletions?days=${days}`);
export const getAggregatedInsights = () => api.get('/admin/insights');
export const getAdminUsers = () => api.get('/admin/users');
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);
