import type { TenderAuctionType } from "@/entities/tender/model/types";
import type { PlaceLocation } from "@/features/add-cargo-form/model/types";

export type TenderFiltersValue = {
    search?: string;
    auction_type?: TenderAuctionType;

    cargo_type?: string;
    vehicle_type?: string;
    loading_type?: string;

    pickup_date_from?: string;
    pickup_date_to?: string;
    dropoff_date_from?: string;
    dropoff_date_to?: string;

    pickup_location?: PlaceLocation | null;
    dropoff_location?: PlaceLocation | null;

    weight_t_from?: string;
    weight_t_to?: string;
    volume_m3_from?: string;
    volume_m3_to?: string;

    adr_required?: boolean;
    hydraulic_tail_lift_required?: boolean;
};