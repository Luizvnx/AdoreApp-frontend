import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Envia e recebe cookies HttpOnly automaticamente quando o navegador suportar
});

// Interceptor de requisições: injeta o Bearer token armazenado na sessão caso o navegador (ex: Safari no iOS) bloqueie cookies de terceiros
api.interceptors.request.use((config) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    if (sessionToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${sessionToken}`;
    }
    return config;
});

// Interceptor de respostas: redireciona para login em caso de 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('sessionToken');
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);