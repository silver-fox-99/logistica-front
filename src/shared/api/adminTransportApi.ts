import api from "@/shared/api/axios";

export type TransportUser = {
    id: string;
    is_admin: boolean;
    avatar: string | null;
    phone: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
};

export type TransportPoint = { country: string; region: string; city: string };

export type TransportItem = {
    id: string;
    user_id: string;
    user: TransportUser;
    images: string[];
    date_from: string;
    date_to: string;
    vehicle_type: string;
    cars_count: number;
    weight_t: string;      // "22.000"
    volume_m3: string;     // "85.000"
    has_dimensions: boolean;
    length_m: string | null;
    width_m: string | null;
    height_m: string | null;
    price_currency: string;
    price_amount: string;  // "500.00"
    payment_method: string;
    payment_term: string;
    bargain: string;
    contact_extra_phone: string | null;
    note: string | null;
    points: TransportPoint[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type TransportListResponse = {
    status: boolean;
    data: {
        data: TransportItem[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
};

export type TransportQuery = { search?: string; page?: number; limit?: number };

const LIST_URL = "/transport/admin/list";
const DELETE_PREFIX = "/transport";

export const adminTransportApi = {
    list: async (params: TransportQuery) => {
        const { data } = await api.get<TransportListResponse>(LIST_URL, { params });
        return data.data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete(`${DELETE_PREFIX}/${id}/admin`);
        return data;
    },
};
