export type LookupOpt = {
    slug: string;
    label: string;
    label_ru?: string | null;
    label_uz?: string | null;
};

export type LookupDict = Record<string, string>;

export type CargoInitData = {
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

export type CargoPointDto = {
    type: "PICKUP" | "DROPOFF";
    country: string;
    region?: string | null;
    city?: string | null;
    address?: string | null;
    display_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    geocode_source?: string | null;
    order?: number | null;
};

export type CreateCargoDto = {
    date_from: string[];
    date_to: string;
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
    images?: string[];
};