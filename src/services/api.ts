import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Garante que o navegador envie e receba cookies HttpOnly automaticamente
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se receber 401 (Não Autorizado) e não estiver na tela inicial/login, redireciona
        if (error.response && error.response.status === 401) {
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);