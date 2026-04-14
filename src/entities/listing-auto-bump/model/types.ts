export type AutoBumpTargetType = "cargo" | "transport";

export type ListingAutoBump = {
    id: string;
    user_id: string;
    target_type: AutoBumpTargetType;
    target_id: string;
    is_enabled: boolean;
    interval_minutes: number;
    duration_days: number;
    starts_at: string;
    next_run_at: string;
    expires_at: string;
    last_error: string | null;
    created_at?: string;
    updated_at?: string;
};

export type UpsertListingAutoBumpDto = {
    targetType: AutoBumpTargetType;
    targetId: string;
    intervalMinutes: number;
    durationDays: number;
    startsAt?: string;
};

export type ListingAutoBumpResponse<T = ListingAutoBump | null> = {
    status: boolean;
    data: T;
    message: string;
};