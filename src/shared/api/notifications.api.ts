import api from "./axios";
import type { ListNotificationsParams, ListNotificationsResponse, Notification } from "@/entities/notification/model/types";

export const notificationsApi = {
    list: async (params: ListNotificationsParams) => {
        const { data } = await api.get<ListNotificationsResponse>("/notifications", {
            params: {
                type: params.type,
                q: params.q?.trim() || undefined,
                is_read: params.is_read,
                offset: params.offset ?? 0,
                limit: params.limit ?? 50,
            },
        });
        return data;
    },

    markAsRead: async (id: string) => {
        const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
        return data;
    },

    markAllAsRead: async () => {
        const { data } = await api.post<{ ok: boolean }>("/notifications/read-all");
        return data;
    },
};
