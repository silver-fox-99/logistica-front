import api from "@/shared/api/axios";
import type {
    CreateTelegramNotificationConfigPayload,
    ListTelegramNotificationConfigsParams,
    ListTelegramNotificationConfigsResponse,
    TelegramNotificationConfig,
    UpdateTelegramNotificationConfigPayload,
} from "@/entities/telegram-notification/model/types";

export const telegramNotificationsApi = {
    list: async (params?: ListTelegramNotificationConfigsParams) => {
        const { data } = await api.get<ListTelegramNotificationConfigsResponse>(
            "/admin/telegram-notifications",
            { params },
        );
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<{
            status: boolean;
            data: TelegramNotificationConfig;
            message: string;
        }>(`/admin/telegram-notifications/${id}`);
        return data.data;
    },

    create: async (payload: CreateTelegramNotificationConfigPayload) => {
        const { data } = await api.post<{
            status: boolean;
            data: TelegramNotificationConfig;
            message: string;
        }>("/admin/telegram-notifications", payload);
        return data.data;
    },

    update: async (id: string, payload: UpdateTelegramNotificationConfigPayload) => {
        const { data } = await api.patch<{
            status: boolean;
            data: TelegramNotificationConfig;
            message: string;
        }>(`/admin/telegram-notifications/${id}`, payload);
        return data.data;
    },

    toggle: async (id: string) => {
        const { data } = await api.patch<{
            status: boolean;
            data: TelegramNotificationConfig;
            message: string;
        }>(`/admin/telegram-notifications/${id}/toggle`);
        return data.data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<{
            status: boolean;
            data: { id: string };
            message: string;
        }>(`/admin/telegram-notifications/${id}`);
        return data.data;
    },
};