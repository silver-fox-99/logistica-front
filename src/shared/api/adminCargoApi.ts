import api from "@/shared/api/axios";

export type CargoUser = {
    id: string;
    is_admin?: boolean;
    avatar: string | null;
    phone: string | null;
    email?: string | null;
    first_name: string | null;
    last_name: string | null;
};

export type PointType = "PICKUP" | "DROPOFF";

export type CargoPoint = {
    id?: string;
    country?: string | null;
    region?: string | null;
    city?: string | null;
    address?: string | null;
    type: PointType;
};

export type CargoItem = {
    id: string;
    user_id: string;
    user?: CargoUser | null;
    images: string[];
    date_from: string[] | string | null;
    date_to: string | null;
    vehicle_type: string;
    load_type: string[];
    cargo_type: string;
    allow_partial_load: boolean;
    weight_t: string | null;
    volume_m3: string | null;
    cars_count: number | null;
    pallets_count: number | null;
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
    points: CargoPoint[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    sort_updated_at?: string | null;
    up_count?: number;
    view_count?: number;
};

export type AdminCargoListData = {
    data: CargoItem[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

export type CargoListResponse = {
    status: boolean;
    data: AdminCargoListData;
    message?: string;
};

export type CargoAdminStatus = "all" | "active" | "deleted";

export type CargoQuery = {
    search?: string;
    page?: number;
    limit?: number;
    status?: CargoAdminStatus;
};

const BASE = "/cargo/admin/list";

export const adminCargoApi = {
    list: async (params: CargoQuery) => {
        const { data } = await api.get<CargoListResponse>(BASE, { params });
        return data.data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete(`/cargo/${id}/admin`);
        return data;
    },

    restore: async (id: string) => {
        const { data } = await api.patch(`/cargo/${id}/admin/restore`);
        return data;
    },
};