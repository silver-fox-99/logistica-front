import api from "@/shared/api/axios";

import type {
    CreateIntegrationTokenPayload,
    IntegrationTokenItem,
    IntegrationStatus,
    UpdateIntegrationTokenPayload,
} from "@/entities/integration/model/types";

export type IntegrationTokenListQuery = {
    search?: string;
    status?: IntegrationStatus;
    is_active?: "true" | "false";
    user_id?: string;
    page?: number;
    limit?: number;
};

export type IntegrationTokenListResult = {
    items: IntegrationTokenItem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
};

export type IntegrationTokenListResponse = {
    status: boolean;
    items: IntegrationTokenItem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    message?: string;
};

export type IntegrationTokenSingleResponse = {
    status: boolean;
    data: IntegrationTokenItem;
    message?: string;
};

export type IntegrationTokenCreateResult = {
    token: IntegrationTokenItem;
    rawToken: string;
};

export type IntegrationTokenCreateResponse = {
    status: boolean;
    data: IntegrationTokenCreateResult;
    message?: string;
};

export type IntegrationTokenDeleteResponse = {
    status: boolean;
    data: {
        id: string;
    };
    message?: string;
};

const BASE = "/admin/integrations/tokens";

export const integrationsApi = {
    list: async (params: IntegrationTokenListQuery) => {
        const { data } = await api.get<IntegrationTokenListResponse>(BASE, { params });

        return {
            items: data.items,
            total: data.total,
            page: data.page,
            limit: data.limit,
            pages: data.pages,
        } satisfies IntegrationTokenListResult;
    },

    getById: async (id: string) => {
        const { data } = await api.get<IntegrationTokenSingleResponse>(`${BASE}/${id}`);
        return data.data;
    },

    create: async (payload: CreateIntegrationTokenPayload) => {
        const { data } = await api.post<IntegrationTokenCreateResponse>(BASE, payload);
        return data.data;
    },

    update: async (id: string, payload: UpdateIntegrationTokenPayload) => {
        const { data } = await api.patch<IntegrationTokenSingleResponse>(`${BASE}/${id}`, payload);
        return data.data;
    },

    toggle: async (id: string) => {
        const { data } = await api.patch<IntegrationTokenSingleResponse>(`${BASE}/${id}/toggle`);
        return data.data;
    },

    regenerate: async (id: string) => {
        const { data } = await api.post<IntegrationTokenCreateResponse>(`${BASE}/${id}/regenerate`);
        return data.data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<IntegrationTokenDeleteResponse>(`${BASE}/${id}`);
        return data.data;
    },
};