import api from "@/shared/api/axios.ts";
import type {GeoItem, LookupOpt} from "@/shared/api/cargoApi.ts";

/** ----- /transport/init ----- */
export type TransportInitData = {
    geos: GeoItem[];
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

export const transportApi = {
    async init() {
        const { data } = await api.get<TransportInitResponse>("/transport/init");
        return data.data;
    },

    /** ----- POST /transport ----- */
    async create(payload: CreateTransportDto) {
        const { data } = await api.post("/transport/create", payload);
        return data;
    },
    async viewCount(id: string) {
        const { data } = await api.get(`/transport/${id}/view-count`);
        return data;
    },
};

/** ----- DTO из бек-описания ----- */
export type TransportPointDto = {
    type: "DEPARTURE" | "ARRIVAL";
    country: string;
    region?: string | null;
    city?: string | null;
    address?: string | null;
};

export type CreateTransportDto = {
    images?: string[];
    date_from: string | null;
    date_to: string | null;
    vehicle_type: "ANY" | "TENT" | "REFRIGERATOR" | "VAN" | "PLATFORM"; // из init.vehicleType
    cars_count: number | null;
    weight_t: number | null;
    volume_m3: number | null;
    has_dimensions: boolean;
    length_m?: number;
    width_m?: number;
    height_m?: number;
    price_currency: string; // из init.currency ключ (USD/EUR/…)
    price_amount: number;
    payment_method: "CASH" | "BANK_TRANSFER" | "CARD" | null;
    payment_term: "PREPAID" | "ON_LOAD" | "ON_UNLOAD" | "POSTPAID" | null;
    bargain: "ALLOWED" | "NOT_ALLOWED";
    contact_extra_phone?: string | null;
    extra_phone_as_main: boolean;
    note?: string | null;
    points: TransportPointDto[]; // минимум 2 (DEPARTURE, ARRIVAL)
};
