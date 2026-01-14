import api from "@/shared/api/axios";
import type { UserProfileSummary, UserReview, UserReviewList } from "@/entities/user-reviews/model/types";

type ReviewsQuery = {
    page?: number;
    limit?: number;
    sort?: "new" | "top" | "critical";
    rating?: number;
    created_from?: string;
    created_to?: string;
};

type AdminReviewsQuery = ReviewsQuery & {
    status?: "PENDING" | "PUBLISHED" | "REJECTED";
    to_user_id?: string;
    from_user_id?: string;
    has_order?: boolean;
    q?: string;
    date_from?: string;
    date_to?: string;
};

type CreateReviewDto = {
    rating: number;
    comment: string;
    order_id?: string;
    order_date?: string | Date;
    pickup_country_id?: string;
    pickup_region_id?: string;
    pickup_city_id?: string;
    dropoff_country_id?: string;
    dropoff_region_id?: string;
    dropoff_city_id?: string;
    price_currency?: string;
    price_amount?: number;
};

const compact = (params?: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    Object.entries(params ?? {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        out[k] = v;
    });
    return out;
};

const normalizeProfile = (raw: any): UserProfileSummary => {
    const user = raw?.user ?? raw;
    const ratingBlock = raw?.rating ?? {};

    return {
        id: user?.id ?? "",
        first_name: user?.first_name ?? user?.firstName ?? null,
        last_name: user?.last_name ?? user?.lastName ?? null,
        avatar: user?.avatar ?? null,
        avatar_url: user?.avatar_url ?? user?.avatarUrl ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        is_admin: user?.is_admin ?? user?.isAdmin ?? false,
        rating: user?.rating ?? ratingBlock?.avg_rating ?? user?.rating_value ?? user?.reviews_rating ?? null,
        reviews_count: user?.reviews_count ?? ratingBlock?.reviews_count ?? user?.reviews ?? user?.review_count ?? user?.reviewsCount ?? null,
        orders_count:
            user?.orders_count ??
            user?.orders ??
            user?.order_count ??
            user?.ordersCount ??
            (Array.isArray(raw?.transports) || Array.isArray(raw?.cargos)
                ? (raw?.transports?.length || 0) + (raw?.cargos?.length || 0)
                : null),
        location: user?.location ?? user?.meta?.geo ?? user?.meta?.location ?? null,
        created_at: user?.created_at ?? user?.createdAt ?? null,
    };
};

export const userReviewsApi = {
    async getUserProfile(userId: string) {
        const { data } = await api.get<{ data: UserProfileSummary }>(`/profile/user/${userId}`);
        return normalizeProfile((data as any).data ?? data);
    },

    async list(userId: string, params?: ReviewsQuery) {
        const { data } = await api.get<any>(`/profile/user/${userId}/reviews`, { params: compact(params) });
        const raw: any = data;
        const payload: any = raw?.data ?? raw;
        const items = payload?.items ?? raw?.items ?? [];
        const total = payload?.total ?? raw?.total ?? items.length;
        const limit = payload?.limit ?? raw?.limit ?? params?.limit ?? (items.length || 1);
        const page = payload?.page ?? raw?.page ?? 1;
        const pages = payload?.pages ?? raw?.pages ?? (limit ? Math.max(1, Math.ceil(total / limit)) : 1);
        return { items, total, page, pages, limit } as UserReviewList;
    },

    async create(userId: string, payload: CreateReviewDto) {
        const { data } = await api.post<{ data: UserReview }>(`/profile/user/${userId}/reviews`, payload);
        return data.data;
    },

    async remove(reviewId: string) {
        const { data } = await api.delete<{ data?: unknown }>(`/profile/reviews/${reviewId}`);
        return data?.data ?? null;
    },

    
    async adminList(params?: AdminReviewsQuery) {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
        const finalParams = compact({
            ...params,
            status: params?.status,
        });
        const { data } = await api.get<any>(`/users/reviews`, {
            params: finalParams,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const raw: any = data;
        const payload: any = raw?.data ?? raw;
        const items = payload?.items ?? raw?.items ?? [];
        const total = payload?.total ?? raw?.total ?? items.length;
        const limit = payload?.limit ?? raw?.limit ?? params?.limit ?? (items.length || 1);
        const page = payload?.page ?? raw?.page ?? 1;
        const pages = payload?.pages ?? raw?.pages ?? (limit ? Math.max(1, Math.ceil(total / limit)) : 1);
        return { items, total, page, pages, limit } as UserReviewList;
    },

    async adminUpdate(userId: string, reviewId: string, payload: Partial<CreateReviewDto> & { status?: string }) {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
        const { data } = await api.patch<{ data: UserReview }>(`/users/${userId}/reviews/${reviewId}`, payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return (data as any).data ?? data;
    },

    async adminRemove(userId: string, reviewId: string) {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
        const { data } = await api.delete<{ data?: unknown }>(`/users/${userId}/reviews/${reviewId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return data?.data ?? null;
    },
};
