
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
    type?: string | null;
    id?: string;
};

export type ShipmentRowData = {
    id: string;
    routeFrom: string;
    routeTo: string;
    distanceKm: number;
    dates: { from: string; to: string };
    loadWindow?: { from: string; to: string };
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
    contact?: { userId?: string; name?: string; email?: string; phone1?: string; phone2?: string; telegram?: string };
    

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
};


export type CargoApiItem = {
    id: string;
    user?: { first_name?: string; last_name?: string; email?: string; phone?: string; };
    points: { 
        country?: string; 
        country_ru?: string | null;
        country_uz?: string | null;
        region?: string; 
        region_ru?: string | null;
        region_uz?: string | null;
        city?: string;
        city_ru?: string | null;
        city_uz?: string | null;
    }[];
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
    view_count: string
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
}
