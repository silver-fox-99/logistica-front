import api from "@/shared/api/axios";
import type {
    BillingPeriod,
    CheckoutResponse,
    Entitlements,
    IssueSubscriptionPayload,
    TariffInvoice,
    TariffMeResponse,
    TariffPlan,
    TariffPlansQuery,
    TariffSubscription,
    TariffsInitData,
    UpdateEntitlementsPayload,
    UpsertTariffPlanPayload,
} from "@/entities/tariff-plan/model/types";

type ListEnvelope<T> = {
    data?: {
        items?: T[];
        total?: number;
        page?: number;
        pages?: number;
        limit?: number;
        offset?: number;
    };
    items?: T[];
    total?: number;
    page?: number;
    pages?: number;
    limit?: number;
    offset?: number;
};

const getPayload = <T = any>(data: any): T => {
    return (data?.data ?? data ?? {}) as T;
};

const getListPayload = <T>(data: any) => {
    const payload = getPayload<ListEnvelope<T>>(data);
    const nested = payload?.data;

    const items = (nested?.items ?? payload?.items ?? []) as T[];
    const total = nested?.total ?? payload?.total ?? items.length;
    const page = nested?.page ?? payload?.page ?? 1;
    const pages = nested?.pages ?? payload?.pages ?? 1;
    const limit = nested?.limit ?? payload?.limit ?? items.length;
    const offset = nested?.offset ?? payload?.offset ?? 0;

    return { items, total, page, pages, limit, offset };
};

const toNullableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
    if (typeof value === "boolean") return value;
    if (value === null || value === undefined) return fallback;
    return Boolean(value);
};

const extractEntitlements = (raw: any): Entitlements => {
    const nested = raw?.entitlements && typeof raw.entitlements === "object" ? raw.entitlements : {};

    return {
        cargo_limit: raw?.cargo_limit ?? nested?.cargo_limit ?? null,
        vehicle_limit: raw?.vehicle_limit ?? nested?.vehicle_limit ?? null,
        can_view_order_details: toBoolean(
            raw?.can_view_order_details ?? nested?.can_view_order_details,
            false,
        ),
        order_details_views_per_day_limit:
            raw?.order_details_views_per_day_limit ??
            nested?.order_details_views_per_day_limit ??
            null,
        can_auto_bump: toBoolean(raw?.can_auto_bump ?? nested?.can_auto_bump, false),
        can_create_companies: toBoolean(
            raw?.can_create_companies ?? nested?.can_create_companies,
            false,
        ),
        active_tenders: raw?.active_tenders ?? nested?.active_tenders,
        can_view_tenders: toBoolean(
            raw?.can_view_tenders ?? nested?.can_view_tenders,
        ),
        company_limit: raw?.company_limit ?? nested?.company_limit ?? null,
        members_per_company_limit:
            raw?.members_per_company_limit ?? nested?.members_per_company_limit ?? null,
    };
};

const normalizePlan = (raw: any): TariffPlan => {
    const entitlements = extractEntitlements(raw);
    console.log(entitlements)
    return {
        id: raw?.id ?? "",
        code: raw?.code ?? "",
        name: raw?.name ?? "",
        description: raw?.description ?? null,
        is_active: toBoolean(raw?.is_active ?? raw?.isActive, false),
        is_default: toBoolean(raw?.is_default ?? raw?.isDefault, false),
        can_auto_bump: toBoolean(raw?.can_auto_bump ?? entitlements.can_auto_bump, false),
        can_view_tenders: toBoolean(raw?.can_view_tenders ?? entitlements.can_view_tenders, false),
        active_tenders: toNullableNumber(entitlements.active_tenders),
        priority: toNullableNumber(raw?.priority),
        price:
            raw?.price === null || raw?.price === undefined || raw?.price === ""
                ? null
                : String(raw.price),
        currency: raw?.currency ?? null,
        billing_period: (raw?.billing_period ?? raw?.billingPeriod ?? null) as BillingPeriod | null,
        days: toNullableNumber(raw?.days) ?? 0,

        cargo_limit: entitlements.cargo_limit ?? null,
        vehicle_limit: entitlements.vehicle_limit ?? null,
        can_view_order_details: entitlements.can_view_order_details ?? false,
        order_details_views_per_day_limit:
            entitlements.order_details_views_per_day_limit ?? null,
        can_create_companies: entitlements.can_create_companies ?? false,
        company_limit: entitlements.company_limit ?? null,
        members_per_company_limit: entitlements.members_per_company_limit ?? null,

        meta: raw?.meta ?? null,
        entitlements,
        created_at: raw?.created_at ?? raw?.createdAt ?? null,
        updated_at: raw?.updated_at ?? raw?.updatedAt ?? null,
    };
};

const normalizeSubscription = (raw: any): TariffSubscription => {
    const entitlements = extractEntitlements(raw);

    return {
        id: raw?.id ?? "",
        user_id: raw?.user_id ?? raw?.userId ?? "",
        plan_id: raw?.plan_id ?? raw?.planId ?? raw?.plan?.id ?? "",
        status: raw?.status ?? "",
        starts_at: raw?.starts_at ?? raw?.startsAt ?? null,
        ends_at: raw?.ends_at ?? raw?.endsAt ?? null,
        lifetime: raw?.lifetime ?? raw?.is_lifetime ?? raw?.isLifetime ?? undefined,
        source: raw?.source ?? null,
        note: raw?.note ?? null,
        plan: raw?.plan ? normalizePlan(raw.plan) : null,
        entitlements,
        entitlements_overrides: Array.isArray(raw?.entitlements_overrides)
            ? raw.entitlements_overrides.map((item: any) => ({
                id: item?.id,
                key: item?.key ?? "",
                int_value: item?.int_value ?? null,
                bool_value: item?.bool_value ?? null,
                reason: item?.reason ?? null,
                created_at: item?.created_at ?? null,
                updated_at: item?.updated_at ?? null,
            }))
            : Array.isArray(raw?.entitlements)
                ? raw.entitlements.map((item: any) => ({
                    id: item?.id,
                    key: item?.key ?? item?.entitlement_key ?? "",
                    int_value: item?.int_value ?? null,
                    bool_value: item?.bool_value ?? null,
                    reason: item?.reason ?? null,
                    created_at: item?.created_at ?? null,
                    updated_at: item?.updated_at ?? null,
                }))
                : null,
        created_at: raw?.created_at ?? raw?.createdAt ?? null,
        updated_at: raw?.updated_at ?? raw?.updatedAt ?? null,
    };
};

const normalizeInvoice = (raw: any): TariffInvoice => {
    return {
        id: raw?.id ?? "",
        user_id: raw?.user_id ?? raw?.userId,
        plan_id: raw?.plan_id ?? raw?.planId,
        plan_name: raw?.plan_name ?? raw?.planName,
        plan_code: raw?.plan_code ?? raw?.planCode,
        currency: raw?.currency,
        subscription_id: raw?.subscription_id ?? raw?.subscriptionId,
        invoice_id: raw?.invoice_id ?? raw?.invoiceId,
        provider: raw?.provider,
        provider_uuid: raw?.provider_uuid ?? raw?.providerUuid,
        status: raw?.status,
        provider_status: raw?.provider_status ?? raw?.providerStatus,
        amount: raw?.amount ?? null,
        checkout_url: raw?.checkout_url ?? raw?.checkoutUrl ?? null,
        short_link: raw?.short_link ?? raw?.shortLink ?? null,
        created_at: raw?.created_at ?? raw?.createdAt ?? null,
        updated_at: raw?.updated_at ?? raw?.updatedAt ?? null,
    };
};

const normalizeMeResponse = (data: any): TariffMeResponse => {
    const payload = getPayload<any>(data);
    const activeRaw = payload?.active_subscription ?? null;

    return {
        effective_entitlements: extractEntitlements(
            payload?.effective_entitlements ?? payload,
        ),
        active_subscription: activeRaw ? normalizeSubscription(activeRaw) : null,
        usage: payload?.usage ?? null,
        raw: payload,
    };
};

export const tariffsApi = {
    adminListPlans: async (params?: TariffPlansQuery) => {
        const { data } = await api.get("/admin/tariffs/plans", { params });
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizePlan),
            total: payload.total,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    adminGetPlan: async (id: string) => {
        const { data } = await api.get(`/admin/tariffs/plans/${id}`);
        return normalizePlan(getPayload(data));
    },

    adminCreatePlan: async (payload: UpsertTariffPlanPayload) => {
        const { data } = await api.post(
            "/admin/tariffs/plans",
            payload,
        );
        return normalizePlan(getPayload(data));
    },

    adminUpdatePlan: async (id: string, payload: UpsertTariffPlanPayload) => {
        const { data } = await api.patch(
            `/admin/tariffs/plans/${id}`,
            payload,
        );
        return normalizePlan(getPayload(data));
    },

    adminDeactivatePlan: async (id: string) => {
        const { data } = await api.delete(`/admin/tariffs/plans/${id}`);
        return getPayload(data);
    },

    adminHardDeletePlan: async (id: string) => {
        const { data } = await api.delete(`/admin/tariffs/plans/${id}/hard`);
        return getPayload(data);
    },

    adminInit: async (): Promise<TariffsInitData> => {
        const { data } = await api.get("/admin/tariffs/init");
        return getPayload<TariffsInitData>(data);
    },

    adminListUserSubscriptions: async (userId: string) => {
        const { data } = await api.get(`/admin/tariffs/users/${userId}/subscriptions`);
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizeSubscription),
            total: payload.total,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    adminGetActiveSubscription: async (userId: string) => {
        const { data } = await api.get(
            `/admin/tariffs/users/${userId}/subscriptions/active`,
        );
        const payload = getPayload<any>(data);
        return payload ? normalizeSubscription(payload) : null;
    },

    adminGetEffectiveEntitlements: async (
        userId: string,
    ): Promise<TariffMeResponse> => {
        const { data } = await api.get(
            `/admin/tariffs/users/${userId}/effective-entitlements`,
        );
        return normalizeMeResponse(data);
    },

    adminIssueSubscription: async (
        userId: string,
        payload: IssueSubscriptionPayload,
    ) => {
        const { data } = await api.post(
            `/admin/tariffs/users/${userId}/subscriptions`,
            {
                plan_id: payload.plan_id,
                source: payload.source,
                starts_at: payload.starts_at,
                ends_at: payload.lifetime ? null : payload.ends_at,
                is_lifetime: payload.lifetime,
                note: payload.note,
                cancel_previous: payload.cancel_previous,
                entitlements: payload.entitlements?.map((item) => ({
                    key: item.key,
                    int_value: item.int_value,
                    bool_value: item.bool_value,
                    reason: item.reason,
                })),
            },
        );

        return normalizeSubscription(getPayload(data));
    },

    adminCancelSubscription: async (id: string) => {
        const { data } = await api.patch(
            `/admin/tariffs/subscriptions/${id}/cancel`,
        );
        return getPayload(data);
    },

    adminUpdateSubscriptionEntitlements: async (
        id: string,
        payload: UpdateEntitlementsPayload,
    ) => {
        const { data } = await api.put(
            `/admin/tariffs/subscriptions/${id}/entitlements`,
            {
                entitlements: payload.entitlements,
                replace: payload.replace ?? false,
            },
        );

        return getPayload(data);
    },

    adminListInvoices: async (userId: string) => {
        const { data } = await api.get(`/admin/tariffs/invoices/${userId}/list`);
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizeInvoice),
            total: payload.total,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    adminDeleteInvoice: async (id: string) => {
        const { data } = await api.delete(`/admin/tariffs/invoices/${id}`);
        return getPayload(data);
    },

    listPublicPlans: async (params?: TariffPlansQuery) => {
        const { data } = await api.get("/tariff-plans", { params });
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizePlan),
            total: payload.total,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    listMySubscriptions: async () => {
        const { data } = await api.get("/tariffs/subscriptions");
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizeSubscription),
            total: payload.total,
            page: payload.page,
            pages: payload.pages,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    listMyHistory: async () => {
        const { data } = await api.get("/tariffs/history");
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizeSubscription),
            total: payload.total,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    listMyInvoices: async () => {
        const { data } = await api.get("/tariffs/invoices");
        const payload = getListPayload<any>(data);

        return {
            items: payload.items.map(normalizeInvoice),
            total: payload.total,
            limit: payload.limit,
            offset: payload.offset,
        };
    },

    getMyTariff: async (): Promise<TariffMeResponse> => {
        const { data } = await api.get("/tariffs/me");
        return normalizeMeResponse(data);
    },

    adminAssignDefaultSubscription: async (userId: string) => {
        const { data } = await api.post(
            `/admin/tariffs/users/${userId}/assign-default`,
        );
        return getPayload(data);
    },

    checkout: async (plan_id: string): Promise<CheckoutResponse> => {
        const { data } = await api.post("/tariffs/checkout", { plan_id });
        const payload = getPayload<any>(data);

        return {
            invoice_id: payload?.invoice_id ?? payload?.id ?? "",
            subscription_id: payload?.subscription_id ?? "",
            checkout_url: payload?.checkout_url ?? null,
            short_link: payload?.short_link ?? null,
        };
    },
};