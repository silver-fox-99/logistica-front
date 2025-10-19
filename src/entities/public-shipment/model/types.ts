export type PublicShipmentBase = {
    id: string;
    dates: { from: string; to: string };
    // краткое представление маршрута — пока без геокодинга (можно дополнить позже)
    routeFrom?: string;
    routeTo?: string;
    metrics?: string[]; // например: ["22 t", "96 m3", "2 cars"]
    tags?: string[];    // ["ANY", "FULL", "PALLETS"]
    price?: string;     // "USD 500.00"
    note?: string;
    createdAt?: string;
};

export type PublicCargoApi = {
    id: string;
    user_id: string;
    images: string[];
    date_from: string;
    date_to: string;
    vehicle_type: string;
    load_type: string;
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
    date_from: string;
    date_to: string;
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
    contact_extra_phone: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};
