import api from "@/shared/api/axios";

export type TransportUser = {
    id: string;
    is_admin?: boolean;
    avatar: string | null;
    phone: string | null;
    email?: string | null;
    first_name: string | null;
    last_name: string | null;
};

export type PointType = "ARRIVAL" | "DEPARTURE";

export type TransportPoint = {
    id?: string;
    country?: string | null;
    region?: string | null;
    city?: string | null;
    address?: string | null;
    type: PointType;
};

export type TransportItem = {
    id: string;
    user_id: string;
    user?: TransportUser | null;
    images: string[];
    date_from: string[] | string | null;
    date_to: string | null;
    vehicle_type: string;
    cars_count: number | null;
    weight_t: string | null;
    volume_m3: string | null;
    has_dimensions: boolean;
    length_m: string | null;
    width_m: string | null;
    height_m: string | null;
    price_currency: string;
    price_amount: string | null;
    payment_method: string | null;
    payment_term: string | null;
    bargain: string | null;
    contact_extra_phone: string | null;
    note: string | null;
    points: TransportPoint[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    sort_updated_at?: string | null;
    up_count?: number;
    view_count?: number;
};

export type AdminTransportListData = {
    data: TransportItem[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

export type TransportListResponse = {
    status: boolean;
    data: AdminTransportListData;
    message?: string;
};

export type TransportAdminStatus = "all" | "active" | "deleted";

export type TransportQuery = {
    search?: string;
    page?: number;
    limit?: number;
    status?: TransportAdminStatus;
};

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

    restore: async (id: string) => {
        const { data } = await api.patch(`${DELETE_PREFIX}/${id}/admin/restore`);
        return data;
    },
};