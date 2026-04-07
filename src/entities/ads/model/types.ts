export type Id = string;

export type AdPlacement = {
    id: Id;
    page: string;
    placement_key: string;
    title: string | null;
    is_active: boolean;
    rotation_enabled: boolean;
    rotation_interval_sec: number;
    created_at?: string;
    updated_at?: string;
    banners_count?: number;
    banners?: AdBanner[];
};

export type AdBanner = {
    id: Id;
    placement_id: Id;
    title: string;
    image_url: string;
    mobile_image_url: string | null;
    target_url: string | null;
    open_in_new_tab: boolean;
    is_active: boolean;
    sort_order: number;
    start_at: string | null;
    end_at: string | null;
    alt: string | null;
    button_label: string | null;
    created_at?: string;
    updated_at?: string;
};

export type AdsListMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type AdPlacementsListQuery = {
    search?: string;
    page_path?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
};

export type AdPlacementsListResponse = {
    items: AdPlacement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type CreateAdPlacementPayload = {
    page: string;
    placement_key: string;
    title?: string | null;
    is_active?: boolean;
    rotation_enabled?: boolean;
    rotation_interval_sec?: number;
};

export type UpdateAdPlacementPayload = Partial<CreateAdPlacementPayload>;

export type CreateAdBannerPayload = {
    title: string;
    image_url: string;
    mobile_image_url?: string | null;
    target_url?: string | null;
    open_in_new_tab?: boolean;
    is_active?: boolean;
    sort_order?: number;
    start_at?: string | null;
    end_at?: string | null;
    alt?: string | null;
    button_label?: string | null;
};

export type UpdateAdBannerPayload = Partial<CreateAdBannerPayload>;

export type ReorderAdBannersPayload = {
    items: Array<{
        id: string;
        sort_order: number;
    }>;
};