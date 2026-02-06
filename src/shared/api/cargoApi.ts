import api from "@/shared/api/axios";
export type GeoItem = {
    id: string;
    parent_id: string | null;
    type: "COUNTRY" | "REGION" | "CITY";
    name: string;
    name_ru?: string | null;
    name_uz?: string | null;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};

export type LookupOpt = { slug: string; label: string; label_ru?: string | null; label_uz?: string | null; };

export type LookupDict = Record<string, string>;

export type CargoInitData = {
    geos: GeoItem[];
    cargoPoints: LookupDict;
    lookups: {
        vehicleType: LookupOpt[];
        cargoTypes: LookupOpt[];
        loadType: LookupOpt[];
        paymentMethods: LookupOpt[];
        paymentTerms: LookupOpt[];
        bargainOptions: LookupOpt[];
        currency: LookupOpt[];
    };
    maps: {
        vehicleType: LookupDict;
        cargoTypes: LookupDict;
        loadType: LookupDict;
        paymentMethods: LookupDict;
        paymentTerms: LookupDict;
        bargainOptions: LookupDict;
        currency: LookupDict;
    };
};

type InitResponse = {
    status: boolean;
    data: CargoInitData;
    message: string;
};

export type CargoPointDto = {
    type: "PICKUP" | "DROPOFF";
    country: string;
    region: string;
    city: string;
    address: string;
};

export type CreateCargoDto = {
    date_from: string;
    date_to: string;
    pickup_dates?: string[];

    country_from: string;

    vehicle_type: string;
    load_type: string[];
    cargo_type: string;
    allow_partial_load: boolean;

    weight_t: number;
    volume_m3: number;
    cars_count: number;
    pallets_count: number;

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

    points: CargoPointDto[];
};

type CreateResponse<T = unknown> = {
    status: boolean;
    data: T;
    message: string;
};

export const cargoApi = {
    async init() {
        const { data } = await api.get<InitResponse>("/cargo/init");
        return data.data;
    },
    async create(payload: CreateCargoDto) {
        const { data } = await api.post<CreateResponse>("/cargo/create", payload);
        return data;
    },
    async info(id: string) {
        const { data } = await api.get<CreateResponse>(`/cargo/${id}/info`);
        return data?.data ?? data;
    },
    async viewCount(id: string) {
        const { data } = await api.get<CreateResponse>(`/cargo/${id}/view-count`);
        return data;
    },
};
