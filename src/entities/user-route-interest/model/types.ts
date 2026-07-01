export interface UserRouteInterest {
    id: string;
    user_id: string;
    origin_city: string;
    origin_country: string;
    destination_city: string;
    destination_country: string;
    match_percentage: number;
    manual: boolean;
    updated_at: string;
}

export interface CreateRouteInterestPayload {
    origin_city?: string;
    origin_country?: string;
    destination_city?: string;
    destination_country?: string;
    manual: boolean;
    match_percentage?: number;
}
