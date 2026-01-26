import axios from 'axios';
import {useUserStore} from "@/entities/user/model/user.store.ts";
import i18n from "@/app/providers/i18n/i18n";
import qs from "qs";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3080',
    withCredentials: false,
    paramsSerializer: (params) =>
        qs.stringify(params, {
            arrayFormat: "repeat",
            skipNulls: true,
        }),
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
    const phone = useUserStore.getState().user?.phone;
    if (email) {
        (config.headers as any)['x-user-email'] = email;
    } else if (phone) {
        (config.headers as any)['x-user-phone'] = phone;
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
    (error) => {
        try {
            const code = error?.response?.data?.code;
            const serverMessage = error?.response?.data?.message;
            if (code) {
                const translated = i18n.t(`apiErrors.${code}`, serverMessage);
                if (translated) {
                    error.response.data.message = translated;
                }
            }
        } catch {
            // ignore translation issues
        }
        return Promise.reject(error);
    }
);

export default api;
