import api from './axiosInstance'

export const updateProfile = (data) => api.put('/user/profile', data)
export const changePassword = (data) => api.put('/user/password', data)
export const deleteAccount = () => api.delete('/user/account')