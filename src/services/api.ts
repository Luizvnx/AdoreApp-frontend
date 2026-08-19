import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Envia e recebe cookies HttpOnly automaticamente quando o navegador suportar
});

// Interceptor de requisições: injeta o Bearer token e o x-override-role (se selecionado no login para teste)
api.interceptors.request.use((config) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    if (sessionToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${sessionToken}`;
    }

    const overrideRole = sessionStorage.getItem('overrideRole');
    if (overrideRole) {
        config.headers['x-override-role'] = overrideRole;
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