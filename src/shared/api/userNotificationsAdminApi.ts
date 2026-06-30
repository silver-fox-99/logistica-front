import api from "@/shared/api/axios.ts";

export type AdminBroadcast = {
    id: string;
    type: string;
    title: string | null;
    message: string;
    metadata: Record<string, any>;
    created_at: string;
    creator: {
        id: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
};

export type CreateBroadcastDto = {
    type?: string;
    title?: string;
    message: string;
    metadata?: Record<string, any>;
};

export const userNotificationsAdminApi = {
    listBroadcasts: async (params?: { page?: number; limit?: number; q?: string }) => {
        const { data } = await api.get("/user-notifications-admin", { params });
        return data as {
            status: boolean;
            data: {
                data: AdminBroadcast[];
                total: number;
                limit: number;
                page: number;
            };
            message: string;
        };
    },

    createBroadcast: async (payload: CreateBroadcastDto) => {
        const { data } = await api.post("/user-notifications-admin", payload);
        return data;
    },

    deleteBroadcast: async (id: string) => {
        const { data } = await api.delete(`/user-notifications-admin/${id}`);
        return data;
    }
};
