import api from "./axios";

export interface UserNotification {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    message: string;
    metadata: Record<string, any>;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

export interface UserNotificationListResponse {
    status: boolean;
    data: {
        data: UserNotification[];
        total: number;
        page: number;
        limit: number;
    };
    message: string;
}

export const userNotificationsApi = {
    list: async (params: { page: number; limit: number; q?: string; is_read?: boolean }) => {
        const { data } = await api.get<UserNotificationListResponse>("/user-notifications", {
            params: {
                page: params.page,
                limit: params.limit,
                q: params.q?.trim() || undefined,
                is_read: params.is_read !== undefined ? params.is_read : undefined,
            },
        });
        return data;
    },

    markAsRead: async (id: string) => {
        const { data } = await api.patch<{ status: boolean; message: string }>(`/user-notifications/${id}/read`);
        return data;
    },

    markAllAsRead: async () => {
        const { data } = await api.post<{ status: boolean; message: string }>("/user-notifications/read-all");
        return data;
    },
};
