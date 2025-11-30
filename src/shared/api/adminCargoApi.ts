import api from "@/shared/api/axios";

export type CargoUser = {
    id: string;
    is_admin: boolean;
    avatar: string | null;
    phone: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
};

export type CargoPoint = { country: string; region: string; city: string };

export type CargoItem = {
    id: string;
    user_id: string;
    user: CargoUser;
    images: string[];
    date_from: string;        // "2025-10-18"
    date_to: string;          // "2025-10-21"
    vehicle_type: string;     // "ANY" ...
    load_type: string[];      // ["FULL", "PARTIAL"] ...
    cargo_type: string;       // "PALLETS" ...
    allow_partial_load: boolean;
    weight_t: string;         // "21.000"
    volume_m3: string;        // "96.000"
    cars_count: number;
    pallets_count: number;
    has_dimensions: boolean;
    length_m: string | null;
    width_m: string | null;
    height_m: string | null;
    price_currency: string;   // "USD"
    price_amount: string;     // "200.00"
    payment_method: string;   // "BANK_TRANSFER"
    payment_term: string;     // "PREPAID"
    bargain: string;          // "ALLOWED"
    contact_extra_phone: string | null;
    note: string | null;
    points: CargoPoint[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type CargoListResponse = {
    status: boolean;
    data: {
        data: CargoItem[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
    message?: string;
};

export type CargoQuery = {
    search?: string;
    page?: number;   // 1-based
    limit?: number;
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
};
