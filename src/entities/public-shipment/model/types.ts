export type PublicPointType =
    | "DEPARTURE" | "ARRIVAL"
    | "PICKUP" | "DROPOFF"
    | "WAYPOINT";
export type PublicPoint = {
    id?: string;
    type: PublicPointType;
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
};

export type PublicFilters = {
    pickup_country?: string;
    pickup_region?: string;
    pickup_city?: string;
    dropoff_country?: string;
    dropoff_region?: string;
    dropoff_city?: string;
    pickup_date_from?: string;
    pickup_date_to?: string;
    dropoff_date_from?: string;
    dropoff_date_to?: string;
    vehicle_type?: string;
    q?: string;
    weight_min?: number;
    weight_max?: number;
    volume_min?: number;
    volume_max?: number;
    favorites_only?: boolean;
};

export type PublicShipmentBase = {
    id: string;
    dates: { from: string; to: string };
    loadWindow?: { from: string; to: string };
    // краткое представление маршрута — пока без геокодинга (можно дополнить позже)
    routeFrom?: string;
    routeTo?: string;
    points: PublicPoint[];
    metrics?: string[]; // например: ["22 t", "96 m3", "2 cars"]
    tags?: string[];    // ["ANY", "FULL", "PALLETS"]
    price?: string;     // "USD 500.00"
    note?: string;
    createdAt?: string;
    isFavorite?: boolean;
};

export type PublicCargoApi = {
    id: string;
    user_id: string;
    images: string[];
    date_from: string | string[];
    date_to: string | string[];
    pickup_dates?: string[];
    vehicle_type: string;
    load_type: string[];
    cargo_type: string;
    allow_partial_load: boolean;
    weight_t: string;
    volume_m3: string;
    cars_count: number;
    pallets_count: number;
    has_dimensions: boolean;
    length_m: string | null;
    width_m: string | null;
    height_m: string | null;
    price_currency: string;
    price_amount: string;
    payment_method: string;
    payment_term: string;
    bargain: string;
    points: PublicPoint[];
    contact_extra_phone: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type PublicTransportApi = {
    id: string;
    user_id: string;
    images: string[];
    date_from: string | string[];
    date_to: string | string[];
    pickup_dates?: string[];
    vehicle_type: string;
    cars_count: number;
    weight_t: string;
    volume_m3: string;
    has_dimensions: boolean;
    length_m: string | null;
    width_m: string | null;
    height_m: string | null;
    price_currency: string;
    price_amount: string;
    payment_method: string;
    payment_term: string;
    bargain: string;
    points: PublicPoint[];
    contact_extra_phone: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};
