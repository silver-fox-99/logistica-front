import api from "@/shared/api/axios.ts";

export type ListResponse<T> = {
    status: boolean;
    data: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    message: string;
};

// Опционально: единый хелпер для GET со стандартной обработкой ошибок
async function getList<T>(url: string, params?: Record<string, any>) {
    try {
        const resp = await api.get<ListResponse<T>>(url, { params });
        return resp.data; // Всегда возвращаем payload API
    } catch (err: any) {
        // Нормализуем ошибку
        const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Request failed";
        throw new Error(msg);
    }
}

export const publicShipmentsApi = {
    // Публичные грузы
    async listCargo<T = any>(page = 1, limit = 10, extraParams?: Record<string, any>) {
        return getList<T>("/cargo/public/list", { page, limit, ...(extraParams || {}) });
    },

    // Публичный транспорт
    async listTransport<T = any>(page = 1, limit = 10, extraParams?: Record<string, any>) {
        return getList<T>("/transport/public/list", { page, limit, ...(extraParams || {}) });
    },
};
