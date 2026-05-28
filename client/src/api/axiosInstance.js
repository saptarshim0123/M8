import axios from 'axios'

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
})

api.interceptors.response.use((res) => res, (err) => {
    if (err.response?.status === 401) {
        console.error('401 Unauthorized intercepted:', err.response?.data);
        localStorage.removeItem('user')
        // Commenting out hard reload to prevent silent loops
        // window.location.href = '/login'
    }
    return Promise.reject(err)
})

export default api