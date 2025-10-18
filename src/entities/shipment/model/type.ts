
export type ShipmentsKind = "cargo" | "transport";

export type ShipmentRowData = {
    id: string;
    routeFrom: string;
    routeTo: string;
    distanceKm: number;
    dates: { from: string; to: string };
    dims?: string;
    typeTags: string[];
    badges?: string[];
    paymentType?: "Cash" | "Bank" | "Card";
    price?: string;
    pricePerKm?: string;
    timeAgo?: string;
    repeats?: number;
    views?: number;
    contact?: { name?: string; email?: string; phone1?: string; phone2?: string; telegram?: string };
};


export type CargoApiItem = {
    id: string;
    user?: { first_name?: string; last_name?: string; email?: string; phone?: string; };
    points: { country?: string; region?: string; city?: string }[];
    date_from: string;
    date_to: string;
    has_dimensions: boolean;
    length_m: string | number | null;
    width_m: string | number | null;
    height_m: string | number | null;
    weight_t: string | number | null;
    volume_m3: string | number | null;
    price_currency: string;
    price_amount: string | number;
    payment_method?: "BANK_TRANSFER" | "CASH" | "CARD";
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
