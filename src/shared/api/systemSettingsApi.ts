import api from "./axios";

export interface SystemSetting {
    id: string;
    key: string;
    value: any;
    description: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ListSystemSettingsParams {
    q?: string;
    prefix?: string;
    limit?: number;
    offset?: number;
}

export interface ListSystemSettingsResponse {
    items: SystemSetting[];
    total: number;
    limit: number;
    offset: number;
}

export const systemSettingsApi = {
    list: async (params?: ListSystemSettingsParams) => {
        const { data } = await api.get<ListSystemSettingsResponse>("/system-settings", { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<SystemSetting>(`/system-settings/${id}`);
        return data;
    },

    getByKey: async (key: string) => {
        const { data } = await api.get<SystemSetting>(`/system-settings/by-key/${key}`);
        return data;
    },

    create: async (dto: { key: string; value: any; description?: string }) => {
        const { data } = await api.post<SystemSetting>("/system-settings", dto);
        return data;
    },

    update: async (id: string, dto: { key?: string; value?: any; description?: string }) => {
        const { data } = await api.patch<SystemSetting>(`/system-settings/${id}`, dto);
        return data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<{ ok: boolean }>(`/system-settings/${id}`);
        return data;
    },
};
