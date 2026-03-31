import api from './axiosInstance'

export const runAnalysis = (entryId) => api.post(`/analyze/${entryId}`);
export const getAnalysis = (entryId) => api.get(`/analyze/${entryId}`);
export const getAllAnalyses = () => api.get(`/analyze`);