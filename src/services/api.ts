import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        config.headers['x-user-id'] = user.id;
        config.headers['x-user-role'] = user.role;
    }
    return config;
});