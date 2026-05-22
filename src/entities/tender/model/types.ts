export enum TenderStatus {
    ACTIVE = "ACTIVE",
    WAITING_CONFIRMATION = "WAITING_CONFIRMATION",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED",
    FINISHED = "FINISHED",
}

export enum TenderAuctionType {
    DECREASING = "DECREASING",
    INCREASING = "INCREASING",
}

export enum TenderPointType {
    PICKUP = "PICKUP",
    DROPOFF = "DROPOFF",
}

export type TenderPoint = {
    id?: string;
    tender_id?: string;
    type: TenderPointType;
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
    latitude?: string | null;
    longitude?: string | null;
    order?: number | string | null;
};

export type TenderBidUser = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone?: string | null;
};

export type TenderBid = {
    id: string;
    tender_id: string;
    bidder_id: string;
    bidder?: TenderBidUser;
    amount: string;
    transport_details: string | null;
    last_changed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Tender = {
    id: string;
    owner_id: string;

    title: string;
    cargo_description: string | null;
    cargo_type: string;

    weight_t: string | null;
    volume_m3: string | null;
    places_count: number | null;

    temperature_mode: string | null;
    packaging_type: string | null;
    images: string[];

    pickup_date: string | null;
    dropoff_date: string | null;
    pickup_time: string | null;
    dropoff_time: string | null;

    vehicle_data_transfer_method: string | null;

    customs_clearance_point: string | null;
    customs_discharge_point: string | null;
    border_crossing_point: string | null;
    carrier_documents: string | null;

    vehicle_type: string;
    vehicle_capacity_t: string | null;
    vehicle_body_length_m: string | null;
    loading_type: string | null;
    adr_required: boolean;
    hydraulic_tail_lift_required: boolean;

    auction_type: TenderAuctionType;
    start_price: string;
    buyout_price: string | null;
    min_bid_step: string;
    currency: string;

    payment_method: string | null;
    payment_term: string | null;
    vat_type: string | null;

    starts_at: string;
    ends_at: string;

    status: TenderStatus;
    current_winner_id: string | null;
    confirmed_winner_id: string | null;
    final_price: string | null;
    has_bids: boolean;

    points: TenderPoint[];
    bids?: TenderBid[];

    phone: string;

    created_at: string;
    updated_at: string;
};

export type TenderListParams = {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    city?: string;
    vehicle_type?: string;
    cargo_type?: string;
    auction_type?: TenderAuctionType;
};

export type TenderListResponse = {
    data: Tender[];
    total: number;
    page: number;
    limit: number;
    message?: string;
    status?: boolean;
};

export type CreateTenderPayload = {
    title: string;
    cargo_description?: string | null;
    cargo_type?: string;

    weight_t?: string | null;
    volume_m3?: string | null;
    places_count?: number | null;

    temperature_mode?: string | null;
    packaging_type?: string | null;
    images?: string[];

    pickup_date?: string | null;
    dropoff_date?: string | null;
    pickup_time?: string | null;
    dropoff_time?: string | null;

    vehicle_data_transfer_method?: string | null;

    customs_clearance_point?: string | null;
    customs_discharge_point?: string | null;
    border_crossing_point?: string | null;
    carrier_documents?: string | null;

    vehicle_type?: string;
    vehicle_capacity_t?: string | null;
    vehicle_body_length_m?: string | null;
    loading_type?: string | null;
    adr_required?: boolean;
    hydraulic_tail_lift_required?: boolean;

    auction_type: TenderAuctionType;
    start_price: string;
    buyout_price?: string | null;
    min_bid_step?: string;
    currency?: string;

    payment_method?: string | null;
    payment_term?: string | null;
    vat_type?: string | null;

    starts_at: string;
    ends_at: string;

    phone: string;

    points: TenderPoint[];
};

export type UpdateTenderPayload = Partial<CreateTenderPayload>;

export type CreateTenderBidPayload = {
    amount: string;
    transport_details?: string | null;
};

export type ConfirmTenderCodePayload = {
    code: string;
};

export type AddTenderBlacklistPhonePayload = {
    phone: string;
    reason?: string | null;
};
