import api from "@/shared/api/axios";

export type SiteReview = {
    id: string;
    user_id: string;
    user: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        avatar: string | null;
        phone?: string;
        email?: string | null;
    } | null;
    rating: number;
    comment: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejection_reason: string | null;
    moderated_at: string | null;
    moderated_by_id: string | null;
    moderated_by?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
    created_at: string;
    updated_at: string;
};

export type SiteReviewList = {
    items: SiteReview[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

export type SiteReviewsQuery = {
    page?: number;
    limit?: number;
    rating?: number;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    created_from?: string;
    created_to?: string;
};

const compact = (params?: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.entries(params ?? {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        out[k] = v;
    });
    return out;
};

export const siteReviewsApi = {
    async list(params?: SiteReviewsQuery) {
        const { data } = await api.get<any>("/site-reviews", { params: compact(params) });
        const raw = data.data ?? data;
        const items = raw.items ?? [];
        const total = raw.total ?? items.length;
        const limit = raw.limit ?? params?.limit ?? 20;
        const page = raw.page ?? 1;
        const pages = Math.max(1, Math.ceil(total / limit));
        return { items, total, page, pages, limit } as SiteReviewList;
    },

    async getStats() {
        const { data } = await api.get<any>("/site-reviews/stats");
        return data.data ?? data;
    },

    async create(payload: { rating: number; comment?: string }) {
        const { data } = await api.post<any>("/site-reviews", payload);
        return data.data ?? data;
    },

    async adminList(params?: SiteReviewsQuery) {
        const { data } = await api.get<any>("/admin/site-reviews", { params: compact(params) });
        const raw = data.data ?? data;
        const items = raw.items ?? [];
        const total = raw.total ?? items.length;
        const limit = raw.limit ?? params?.limit ?? 20;
        const page = raw.page ?? 1;
        const pages = Math.max(1, Math.ceil(total / limit));
        return { items, total, page, pages, limit } as SiteReviewList;
    },

    async adminModerate(reviewId: string, payload: { status: "APPROVED" | "REJECTED"; rejection_reason?: string }) {
        const { data } = await api.patch<any>(`/admin/site-reviews/${reviewId}/moderate`, {
            status: payload.status,
            rejection_reason: payload.rejection_reason,
        });
        return data.data ?? data;
    },

    async adminRemove(reviewId: string) {
        const { data } = await api.delete<any>(`/admin/site-reviews/${reviewId}`);
        return data.data ?? data;
    },
};
