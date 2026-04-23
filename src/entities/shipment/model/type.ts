export type ShipmentsKind = "cargo" | "transport";

export type GeoPoint = {
    country?: string | null;
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
    latitude?: string | number | null;
    longitude?: string | number | null;
    geocoded?: boolean;
    geocoded_at?: string | null;
    geocode_source?: string | null;

    type?: string | null;
    order?: number | null;
    id?: string;
};

export type ShipmentRoutePoint = {
    id?: string;
    type?: string;
    label?: string;
    lat: number;
    lon: number;
    order?: number | null;
};

export type ShipmentRoute = {
    points: ShipmentRoutePoint[];
    center?: [number, number] | null;
    bounds?: [[number, number], [number, number]] | null;
    geometry?: [number, number][];
    distance_m?: number | null;
    duration_s?: number | null;
};

export type ShipmentRowData = {
    id: string;
    routeFrom: string;
    routeTo: string;
    distanceKm: number;
    dates: { from: string; to?: string };
    loadWindow?: { from: string; to?: string };
    dims?: string;
    typeTags: string[];
    badges?: string[];
    paymentType?: "Cash" | "Bank" | "Card";
    price?: string;
    pricePerKm?: string;
    timeAgo?: string;
    repeats?: number;
    views?: number;
    points?: GeoPoint[];
    route?: ShipmentRoute | null;
    contact?: {
        userId?: string;
        name?: string;
        email?: string;
        phone1?: string;
        phone2?: string;
        telegram?: string;
        company?: {
            id?: string;
            name?: string;
            legal_name?: string | null;
            logo?: string | null;
            country?: string | null;
            region?: string | null;
            city?: string | null;
            status?: string;
            member_role?: string;
            member_status?: string;
            joined_at?: string;
        } | null;
    };

    vehicleType?: string;
    loadType?: string[];
    cargoType?: string;
    allowPartialLoad?: boolean;
    carsCount?: number;
    palletsCount?: number;
    weightT?: number;
    volumeM3?: number;
    paymentTerm?: string;
    bargain?: string;
    note?: string;
    contactExtraPhone?: string;
    extraPhoneAsMain?: boolean;
    viewCount?: string;
    isFavorite?: boolean;
    images?: string[];
};

export type CargoApiItem = {
    id: string;
    user?: {
        id?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        company?: {
            id?: string;
            name?: string;
            legal_name?: string | null;
            logo?: string | null;
            country?: string | null;
            region?: string | null;
            city?: string | null;
            status?: string;
            member_role?: string;
            member_status?: string;
            joined_at?: string;
        } | null;
    };
    points: {
        id?: string;
        country?: string;
        country_ru?: string | null;
        country_uz?: string | null;
        region?: string;
        region_ru?: string | null;
        region_uz?: string | null;
        city?: string;
        city_ru?: string | null;
        city_uz?: string | null;
        address?: string | null;
        display_name?: string | null;
        latitude?: string | number | null;
        longitude?: string | number | null;
        geocoded?: boolean;
        geocoded_at?: string | null;
        geocode_source?: string | null;
        type?: string | null;
        order?: number | null;
    }[];
    route?: {
        points?: Array<{
            id?: string;
            type?: string;
            label?: string;
            lat?: number | string | null;
            lon?: number | string | null;
            order?: number | null;
        }>;
        center?: [number, number] | null;
        bounds?: [[number, number], [number, number]] | null;
        geometry?: [number, number][];
        distance_m?: number | null;
        duration_s?: number | null;
    } | null;
    images?: string[];

    date_from: string | string[];
    date_to: string | string[];
    pickup_dates?: string[];

    has_dimensions: boolean;
    length_m: string | number | null;
    width_m: string | number | null;
    height_m: string | number | null;
    weight_t: string | number | null;
    volume_m3: string | number | null;

    price_currency: string;
    price_amount: string | number;
    payment_method?: "BANK_TRANSFER" | "CASH" | "CARD";

    vehicle_type?: string;
    load_type?: string[];
    cargo_type?: string;
    allow_partial_load?: boolean;
    cars_count?: number;
    pallets_count?: number;
    payment_term?: string;
    bargain?: string;
    note?: string;
    contact_extra_phone?: string;
    extra_phone_as_main?: boolean;
    view_count: string;
    updated_at: string;
    sort_updated_at: string;
    up_count: string;
};

export type TransportApiItem = CargoApiItem;

export type ListResponse<T> = {
    status?: boolean;
    data: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    message?: string;
};