import axios from 'axios';
import {useUserStore} from "@/entities/user/model/user.store.ts";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3080',
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
    }

    const email = useUserStore.getState().user?.email;
    if (email) {
        (config.headers as any)['x-user-email'] = email;
    } else {
        if ((config.headers as any)['x-user-email']) {
            delete (config.headers as any)['x-user-email'];
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        const accessToken = response.headers['x-access-token'];
        const refreshToken = response.headers['x-refresh-token'];

        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        return response;
    },
    (error) => Promise.reject(error)
);

export default api;
