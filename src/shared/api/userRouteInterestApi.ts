import api from "./axios";

export interface UserRouteInterest {
    id: string;
    user_id: string;
    origin_city: string;
    origin_country: string;
    destination_city: string;
    destination_country: string;
    match_percentage: number;
    manual: boolean;
    updated_at: string;
}

export interface CreateRouteInterestPayload {
    origin_city?: string;
    origin_country?: string;
    destination_city?: string;
    destination_country?: string;
    manual: boolean;
    match_percentage?: number;
}

export interface UserRouteInterestResponse {
    status: boolean;
    data: UserRouteInterest;
    message: string;
}

export interface UserRouteInterestListResponse {
    status: boolean;
    data: UserRouteInterest[] | UserRouteInterest;
    message: string;
}

export const userRouteInterestApi = {
    list: async () => {
        const { data } = await api.get<UserRouteInterestListResponse>("/user-route-interests");
        return data;
    },

    create: async (payload: CreateRouteInterestPayload) => {
        const { data } = await api.post<UserRouteInterestResponse>("/user-route-interests", payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<{ status: boolean; message: string }>(`/user-route-interests/${id}`);
        return data;
    },
};
