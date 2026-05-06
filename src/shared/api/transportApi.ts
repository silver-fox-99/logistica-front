import api from "@/shared/api/axios";
import type { LookupOpt } from "@/entities/cargo/model/types";

export type TransportInitData = {
    transportPoints: Record<string, string>;
    lookups: {
        vehicleType: LookupOpt[];
        paymentMethods: LookupOpt[];
        paymentTerms: LookupOpt[];
        bargainOptions: LookupOpt[];
        currency: LookupOpt[];
    };
    maps: {
        vehicleType: Record<string, string>;
        paymentMethods: Record<string, string>;
        paymentTerms: Record<string, string>;
        bargainOptions: Record<string, string>;
        currency: Record<string, string>;
    };
};

export type TransportInitResponse = {
    status: boolean;
    data: TransportInitData;
    message: string;
};

export type TransportPointDto = {
    type: "DEPARTURE" | "ARRIVAL";

    geo_location_id?: string | null;
    geo_location_type?: "COUNTRY" | "REGION" | "CITY" | null;

    country: string;
    country_ru?: string | null;
    country_uz?: string | null;

    region?: string | null;
    region_ru?: string | null;
    region_uz?: string | null;

    city?: string | null;
    city_ru?: string | null;
    city_uz?: string | null;

    address?: string | null;
    display_name?: string | null;

    latitude?: number | null;
    longitude?: number | null;

    geocode_source?: string | null;
    order?: number | null;
};

export type CreateTransportDto = {
    images?: string[];
    date_from: string[];
    date_to: string;
    vehicle_type: string;
    cars_count: number;
    weight_t: number;
    volume_m3: number;
    has_dimensions: boolean;
    length_m?: number;
    width_m?: number;
    height_m?: number;
    price_currency: string;
    price_amount: number;
    payment_method: string;
    payment_term: string;
    bargain: "ALLOWED" | "NOT_ALLOWED";
    contact_extra_phone?: string;
    extra_phone_as_main: boolean;
    note?: string;
    points: TransportPointDto[];
};

export const transportApi = {
    async init() {
        const { data } = await api.get<TransportInitResponse>("/transport/init");
        return data.data;
    },

    async create(payload: CreateTransportDto) {
        const { data } = await api.post("/transport/create", payload);
        return data;
    },

    async info(id: string) {
        const { data } = await api.get(`/transport/${id}/info`);
        return (data as any)?.data ?? data;
    },

    async viewCount(id: string) {
        const { data } = await api.get(`/transport/${id}/view-count`);
        return data;
    },

    async publicInfo(id: string) {
        const { data } = await api.get(`/transport/public/${id}/info`);
        return (data as any)?.data ?? data;
    },
};