import api from "./axios";
import type { ListNotificationsParams, ListNotificationsResponse } from "@/entities/notification/model/types";

export const notificationsApi = {
    list: async (params: ListNotificationsParams) => {
        const { data } = await api.get<ListNotificationsResponse>("/notifications", {
            params: {
                type: params.type,
                q: params.q?.trim() || undefined,
                offset: params.offset ?? 0,
                limit: params.limit ?? 50,
            },
        });
        return data;
    },
};
