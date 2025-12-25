export type ReviewStatus = "PENDING" | "PUBLISHED" | "REJECTED";

export type UserReview = {
    id: string;
    rating: number;
    comment: string;
    status?: ReviewStatus;
    from_user_id?: string | null;
    to_user_id?: string | null;
    order_id?: string | null;
    order_date?: string | Date | null;
    pickup_country_id?: string | null;
    pickup_region_id?: string | null;
    pickup_city_id?: string | null;
    dropoff_country_id?: string | null;
    dropoff_region_id?: string | null;
    dropoff_city_id?: string | null;
    pickup_country?: string | null;
    pickup_region?: string | null;
    pickup_city?: string | null;
    dropoff_country?: string | null;
    dropoff_region?: string | null;
    dropoff_city?: string | null;
    from_first_name?: string | null;
    from_last_name?: string | null;
    from_email?: string | null;
    from_phone?: string | null;
    to_first_name?: string | null;
    to_last_name?: string | null;
    to_email?: string | null;
    to_phone?: string | null;
    price_currency?: string | null;
    price_amount?: number | null;
    created_at?: string;
    updated_at?: string;
};

export type UserReviewList = {
    items: UserReview[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

export type UserProfileSummary = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar?: string | null;
    avatar_url?: string | null;
    email?: string | null;
    phone?: string | null;
    is_admin?: boolean;
    rating?: number | null;
    reviews_count?: number | null;
    orders_count?: number | null;
    location?: string | null;
    created_at?: string;
};
