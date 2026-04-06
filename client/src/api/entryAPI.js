import api from './axiosInstance'

export const createEntry = (data) => api.post('/entries', data);
export const getEntries = (search = '', tag = '', sort = 'newest') =>
  api.get(`/entries?search=${search}&tag=${encodeURIComponent(tag)}&sort=${sort}`);
export const getEntry = (id) => api.get(`/entries/${id}`);
export const updateEntry = (id, data) => api.put(`/entries/${id}`, data);
export const deleteEntry = (id) => api.delete(`/entries/${id}`);