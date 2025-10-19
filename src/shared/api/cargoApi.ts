import api from "@/shared/api/axios";

/** ---------- INIT types (то, что приходит с /cargo/init) ---------- */
export type GeoItem = {
    id: string;
    parent_id: string | null;
    type: "COUNTRY" | "REGION" | "CITY";
    name: string;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Dict<T extends string = string> = Record<T, T>;

export type CargoInitData = {
    geos: GeoItem[];
    currency: Dict;          // "USD": "USD", ...
    bargainOptions: Dict;    // "ALLOWED" | "NOT_ALLOWED"
    paymentTerms: Dict;      // "PREPAID" | "ON_LOAD" | "ON_UNLOAD" | "POSTPAID"
    paymentMethods: Dict;    // "CASH" | "BANK_TRANSFER" | "CARD"
    cargoTypes: Dict;        // "GENERAL" | "PALLETS" | ...
    cargoPoints: Dict;       // "PICKUP" | "DROPOFF"
    vehicleType: Dict;       // "ANY" | "TENT" | ...
    loadType: Dict;          // "FULL" | "PARTIAL" | "ANY"
};

type InitResponse = {
    status: boolean;
    data: CargoInitData;
    message: string;
};

/** ---------- CREATE DTO (то, что мы шлём на /cargo/create) ---------- */
export type CargoPointDto = {
    type: "PICKUP" | "DROPOFF";
    country: string;
    region: string | null;
    city: string | null;
    address: string | null;
};

export type CreateCargoDto = {
    date_from: string | null;
    date_to: string | null;

    // ⬇️ добавили
    country_from: string;   // ОБЯЗАТЕЛЬНО, строка

    vehicle_type: keyof CargoInitData["vehicleType"] | "ANY";
    load_type: keyof CargoInitData["loadType"] | "FULL";
    cargo_type: keyof CargoInitData["cargoTypes"] | "GENERAL";
    allow_partial_load: boolean;

    weight_t: number | null;
    volume_m3: number | null;
    cars_count: number | null;
    pallets_count: number | null; // у тебя в DTO nullable

    has_dimensions: boolean;
    length_m?: number;
    width_m?: number;
    height_m?: number;

    price_currency: keyof CargoInitData["currency"] | "USD";
    price_amount: number;

    // ⚠️ обязательно заполнить на форме
    payment_method: keyof CargoInitData["paymentMethods"];
    // опционально
    payment_term: keyof CargoInitData["paymentTerms"] | null;

    bargain: "ALLOWED" | "NOT_ALLOWED";

    contact_extra_phone: string | null;
    note: string | null;

    points: CargoPointDto[];
};

type CreateResponse<T = unknown> = {
    status: boolean;
    data: T;
    message: string;
};

/** ---------- API ---------- */
export const cargoApi = {
    /** Получить данные и словари для формы создания */
    async init() {
        const { data } = await api.get<InitResponse>("/cargo/init");
        return data.data;
    },

    /** Создать груз */
    async create(payload: CreateCargoDto) {
        const { data } = await api.post<CreateResponse>("/cargo/create", payload);
        return data;
    },
};
