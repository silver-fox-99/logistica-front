import api from "@/shared/api/axios";

export type ActivityItem = {
    id: string;
    user: string;              // "Anonymous (-)" или "Name (id)"
    method: string;            // GET/POST/...
    endpoint: string;          // "/auth/login"
    description?: string;
    ip: string;
    time: string;              // ISO
    statusCode: number;
    durationMs: number;
    body?: unknown;
    query?: unknown;
    params?: unknown;
    userAgent?: string;
};

export type ActivityListData = {
    data: ActivityItem[];
    total: number;
    page: number;
    limit: number;
    pages?: number; // может не прийти, посчитаем на клиенте
};

export type ActivityListResponse = {
    status: boolean;
    data: ActivityListData;
    message?: string;
};

export type ActivityQuery = {
    search?: string;
    method?: string;
    endpoint?: string;
    statusCode?: number;
    dateFrom?: string;   // ISO
    dateTo?: string;     // ISO
    userId?: string;     // UUID
    includeAnonymous?: "true" | "false";
    page?: number;
    limit?: number;
};

const BASE = "/activity-logs";

export const adminActivityApi = {
    list: async (params: ActivityQuery) => {
        const { data } = await api.get<ActivityListResponse>(BASE, { params });
        return data.data;
    },
};
