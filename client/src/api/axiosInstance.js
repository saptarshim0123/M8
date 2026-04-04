import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
})

api.interceptors.response.use((res) => res, (err) => {
    if (err.res?.status === 401) {
        localStorage.removeItem('user')
        window.location.href = '/login'
    }
    return Promise.reject(err)
})

export default api