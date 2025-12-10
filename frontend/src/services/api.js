import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-end-asah.vercel.app/api';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const userSess = JSON.parse(localStorage.getItem('user_sess'));

    if (userSess && userSess.token) {
        config.headers.Authorization = `Bearer ${userSess.token}`;
    }
    return config;
});

export default api;