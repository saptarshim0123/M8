import api from './axiosInstance'

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) => api.put('/auth/change-password', data)
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/auth/reset-password', data)
export const verify2FA = (data) => api.post('/auth/verify-2fa', data)
export const resendOTP = (data) => api.post('/auth/resend-otp', data)