import api from "@/shared/api/axios";

export type BillingPeriod = string;

export type EntitlementKey =
    | "cargo_limit"
    | "vehicle_limit"
    | "can_view_order_details"
    | "order_details_views_per_day_limit"
    | "can_create_companies"
    | "company_limit"
    | "members_per_company_limit";

export type Entitlements = Partial<Record<Extract<EntitlementKey, string>, number | boolean | null>>;

const ENTITLEMENT_KEYS: EntitlementKey[] = [
    "cargo_limit",
    "vehicle_limit",
    "can_view_order_details",
    "order_details_views_per_day_limit",
    "can_create_companies",
    "company_limit",
    "members_per_company_limit",
];

const extractEntitlements = (payload: any): Entitlements => {
    const out: Entitlements = {};
    ENTITLEMENT_KEYS.forEach((key) => {
        if (payload && payload[key] !== undefined) {
            out[key] = payload[key] as any;
        }
    });
    if (Array.isArray(payload?.entitlements)) {
        payload.entitlements.forEach((item: any) => {
            const rawKey = (item?.key ?? item?.entitlement_key ?? "").toString().toLowerCase();
            const match = ENTITLEMENT_KEYS.find((k) => k === rawKey);
            if (!match) return;
            const boolVal =
                typeof item?.bool_value === "boolean"
                    ? item.bool_value
                    : typeof item?.value === "boolean"
                        ? item.value
                        : undefined;
            const intVal =
                typeof item?.int_value === "number"
                    ? item.int_value
                    : typeof item?.value === "number"
                        ? item.value
                        : undefined;
            if (boolVal !== undefined) {
                out[match] = boolVal;
            } else if (intVal !== undefined) {
                out[match] = intVal;
            } else {
                out[match] = null;
            }
        });
    }
    return out;
};

export type TariffPlan = {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    is_default: boolean;
    priority?: number | null;
    price?: number | string | null;
    currency?: string | null;
    billing_period?: BillingPeriod | null;
    entitlements?: Entitlements | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type UpsertTariffPlanPayload = {
    code: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
    is_default?: boolean;
    priority?: number | null;
    price?: number | string | null;
    currency?: string | null;
    billing_period?: BillingPeriod | null;
    entitlements?: Entitlements;
};

export type TariffPlansQuery = {
    q?: string;
    is_active?: boolean;
    is_default?: boolean;
    billing_period?: BillingPeriod;
    currency?: string;
    limit?: number;
    offset?: number;
};

export type TariffSubscription = {
    id: string;
    user_id: string;
    plan_id: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    lifetime?: boolean;
    source?: string | null;
    note?: string | null;
    plan?: TariffPlan | null;
    entitlements?: Entitlements | null;
    entitlements_overrides?: {
        id?: string;
        key: string;
        int_value?: number | null;
        bool_value?: boolean | null;
        reason?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
    }[] | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type TariffsInitDictItem = { name?: string | null; value: string };
export type TariffsInitData = {
    billing_period?: TariffsInitDictItem[];
    subscription_status?: TariffsInitDictItem[];
    subscription_source?: TariffsInitDictItem[];
    element_key?: TariffsInitDictItem[];
};

const normalizePlan = (raw: any): TariffPlan => ({
    id: raw?.id ?? "",
    code: raw?.code ?? "",
    name: raw?.name ?? "",
    description: raw?.description ?? null,
    is_active: raw?.is_active ?? raw?.isActive ?? false,
    is_default: raw?.is_default ?? raw?.isDefault ?? false,
    priority: raw?.priority ?? null,
    price: raw?.price ?? null,
    currency: raw?.currency ?? null,
    billing_period: raw?.billing_period ?? raw?.billingPeriod ?? null,
    entitlements: extractEntitlements(raw),
    created_at: raw?.created_at ?? raw?.createdAt ?? null,
    updated_at: raw?.updated_at ?? raw?.updatedAt ?? null,
});

const normalizeSubscription = (raw: any): TariffSubscription => ({
    id: raw?.id ?? "",
    user_id: raw?.user_id ?? raw?.userId ?? "",
    plan_id: raw?.plan_id ?? raw?.planId ?? raw?.plan?.id ?? "",
    status: raw?.status ?? "",
    starts_at: raw?.starts_at ?? raw?.startsAt ?? null,
    ends_at: raw?.ends_at ?? raw?.endsAt ?? null,
    lifetime: raw?.lifetime ?? raw?.is_lifetime ?? raw?.isLifetime ?? undefined,
    source: raw?.source ?? null,
    note: raw?.note ?? null,
    plan: raw?.plan ? normalizePlan(raw.plan) : raw?.plan ?? null,
    entitlements: extractEntitlements(raw),
    entitlements_overrides: Array.isArray(raw?.entitlements)
        ? raw.entitlements.map((e: any) => ({
            id: e?.id,
            key: e?.key ?? "",
            int_value: e?.int_value ?? null,
            bool_value: e?.bool_value ?? null,
            reason: e?.reason ?? null,
            created_at: e?.created_at ?? null,
            updated_at: e?.updated_at ?? null,
        }))
        : null,
    created_at: raw?.created_at ?? raw?.createdAt ?? null,
    updated_at: raw?.updated_at ?? raw?.updatedAt ?? null,
});

export type TariffMeResponse = {
    effective_entitlements: Entitlements;
    active_subscription: TariffSubscription | null;
    usage?: {
        monthKey?: string;
        dayKey?: string;
        cargo_creates_used?: number | string;
        vehicle_creates_used?: number | string;
        order_details_views_used?: number | string;
    } | null;
    raw?: any;
};

const serializePlanPayload = (payload: UpsertTariffPlanPayload) => {
    const base: Record<string, unknown> = {
        code: payload.code,
        name: payload.name,
        description: payload.description,
        is_active: payload.is_active,
        is_default: payload.is_default,
        priority: payload.priority,
        price: payload.price,
        currency: payload.currency,
        billing_period: payload.billing_period,
    };

    ENTITLEMENT_KEYS.forEach((key) => {
        if (payload.entitlements && key in payload.entitlements) {
            base[key] = payload.entitlements[key as keyof Entitlements] as any;
        }
    });

    return base;
};

export type IssueSubscriptionPayload = {
    plan_id: string;
    starts_at?: string | null;
    ends_at?: string | null;
    lifetime?: boolean;
    note?: string | null;
    source?: string | null;
    cancel_previous?: boolean;
    entitlements?: {
        key: string;
        int_value?: number | null;
        bool_value?: boolean | null;
        reason?: string | null;
    }[];
};

export type SubscriptionEntitlementInput = {
    key: string;
    int_value?: number | null;
    bool_value?: boolean | null;
    reason?: string | null;
};

export type UpdateEntitlementsPayload = {
    entitlements: SubscriptionEntitlementInput[];
    replace?: boolean;
};

type ListResponse<T> = {
    data?: {
        items?: T[];
        total?: number;
        page?: number;
        pages?: number;
        limit?: number;
    };
    items?: T[];
    total?: number;
    page?: number;
    pages?: number;
    limit?: number;
};

const extractList = <T>(raw: any) => {
    const payload: ListResponse<T> = raw?.data ?? raw;
    const items = (payload?.data?.items ?? payload?.items ?? []) as T[];
    const total = payload?.data?.total ?? payload?.total ?? items.length;
    const page = payload?.data?.page ?? payload?.page ?? 1;
    const pages = payload?.data?.pages ?? payload?.pages ?? 1;
    const limit = payload?.data?.limit ?? payload?.limit ?? (items.length || 10);
    return { items, total, page, pages, limit };
};

export const tariffsApi = {
    async adminListPlans(params?: TariffPlansQuery) {
        const { data } = await api.get<any>("/admin/tariffs/plans", { params });
        const payload = (data as any)?.data ?? data ?? {};
        const itemsRaw = payload?.items ?? [];
        const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizePlan) : [];
        const total = payload?.total ?? items.length;
        const limit = payload?.limit ?? params?.limit ?? items.length;
        const offset = payload?.offset ?? params?.offset ?? 0;
        return { items, total, limit, offset };
    },

    async adminGetPlan(id: string) {
        const { data } = await api.get<any>(`/admin/tariffs/plans/${id}`);
        const payload = (data as any)?.data ?? data ?? {};
        return normalizePlan(payload);
    },

    async adminCreatePlan(payload: UpsertTariffPlanPayload) {
        const { data } = await api.post<{ data: TariffPlan }>(
            "/admin/tariffs/plans",
            serializePlanPayload(payload)
        );
        const payloadData = (data as any)?.data ?? data ?? {};
        return normalizePlan(payloadData);
    },

    async adminUpdatePlan(id: string, payload: UpsertTariffPlanPayload) {
        const { data } = await api.patch<{ data: TariffPlan }>(
            `/admin/tariffs/plans/${id}`,
            serializePlanPayload(payload)
        );
        const payloadData = (data as any)?.data ?? data ?? {};
        return normalizePlan(payloadData);
    },

    async adminDeactivatePlan(id: string) {
        const { data } = await api.delete<{ data?: unknown }>(`/admin/tariffs/plans/${id}`);
        const payload = (data as any)?.data ?? data ?? {};
        return payload;
    },

    async adminHardDeletePlan(id: string) {
        const { data } = await api.delete<{ data?: unknown }>(`/admin/tariffs/plans/${id}/hard`);
        const payload = (data as any)?.data ?? data ?? {};
        return payload;
    },

    async adminInit(): Promise<TariffsInitData> {
        const { data } = await api.get<any>("/admin/tariffs/init");
        const payload = (data as any)?.data ?? data ?? {};
        return payload as TariffsInitData;
    },

    async adminListUserSubscriptions(userId: string) {
        const { data } = await api.get<any>(`/admin/tariffs/users/${userId}/subscriptions`);
        const payload = (data as any)?.data ?? data ?? {};
        const itemsRaw = payload?.items ?? [];
        const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeSubscription) : [];
        const total = payload?.total ?? items.length;
        const limit = payload?.limit ?? items.length;
        const offset = payload?.offset ?? 0;
        return { items, total, limit, offset };
    },

    async adminGetActiveSubscription(userId: string) {
        const { data } = await api.get<any>(`/admin/tariffs/users/${userId}/subscriptions/active`);
        const payload = (data as any)?.data ?? data ?? null;
        return payload ? normalizeSubscription(payload) : null;
    },

    async adminGetEffectiveEntitlements(userId: string): Promise<TariffMeResponse> {
        const { data } = await api.get<any>(`/admin/tariffs/users/${userId}/effective-entitlements`);
        const payload = (data as any)?.data ?? data ?? {};
        const entitlements = extractEntitlements(payload);
        const activeRaw = payload?.active_subscription ?? null;
        const active = activeRaw ? normalizeSubscription(activeRaw) : null;
        return {
            effective_entitlements: entitlements,
            active_subscription: active,
            usage: payload?.usage ?? null,
            raw: payload,
        };
    },

    async adminIssueSubscription(userId: string, payload: IssueSubscriptionPayload) {
        const body: Record<string, unknown> = {
            plan_id: payload.plan_id,
            source: payload.source,
            starts_at: payload.starts_at,
            ends_at: payload.lifetime ? null : payload.ends_at,
            is_lifetime: payload.lifetime,
            note: payload.note,
            cancel_previous: payload.cancel_previous,
        };

        if (payload.entitlements) {
            body.entitlements = payload.entitlements.map((e) => ({
                key: e.key,
                int_value: e.int_value,
                bool_value: e.bool_value,
                reason: e.reason,
            }));
        }

        const { data } = await api.post<{ data: TariffSubscription }>(
            `/admin/tariffs/users/${userId}/subscriptions`,
            body
        );
        const payloadData = (data as any)?.data ?? data ?? {};
        return normalizeSubscription(payloadData);
    },

    async adminCancelSubscription(id: string) {
        const { data } = await api.patch<{ data: TariffSubscription }>(
            `/admin/tariffs/subscriptions/${id}/cancel`
        );
        const payload = (data as any)?.data ?? data ?? {};
        return payload;
    },

    async adminUpdateSubscriptionEntitlements(id: string, payload: UpdateEntitlementsPayload) {
        const body = {
            entitlements: payload.entitlements,
            replace: payload.replace ?? false,
        };
        const { data } = await api.put<any>(`/admin/tariffs/subscriptions/${id}/entitlements`, body);
        const payloadData = (data as any)?.data ?? data ?? {};
        return payloadData;
    },

    async listPublicPlans(params?: TariffPlansQuery) {
        const { data } = await api.get<any>("/tariff-plans", { params });
        const payload = (data as any)?.data ?? data ?? {};
        const itemsRaw = payload?.items ?? [];
        const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizePlan) : [];
        const total = payload?.total ?? items.length;
        const limit = payload?.limit ?? params?.limit ?? items.length;
        const offset = payload?.offset ?? params?.offset ?? 0;
        return { items, total, limit, offset };
    },

    async listMySubscriptions() {
        const { data } = await api.get<ListResponse<TariffSubscription>>("/tariffs/subscriptions");
        return extractList<TariffSubscription>(data);
    },

    async listMyHistory() {
        const { data } = await api.get<any>("/tariffs/history");
        const payload = (data as any)?.data ?? data ?? {};
        const itemsRaw = payload?.items ?? [];
        const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeSubscription) : [];
        const total = payload?.total ?? items.length;
        const limit = payload?.limit ?? items.length;
        const offset = payload?.offset ?? 0;
        return { items, total, limit, offset };
    },

    async getMyTariff(): Promise<TariffMeResponse> {
        const { data } = await api.get<any>("/tariffs/me");
        const payload = (data as any)?.data ?? data ?? {};
        const entitlements = extractEntitlements(payload);
        const activeRaw = payload?.active_subscription ?? null;
        const active = activeRaw ? normalizeSubscription(activeRaw) : null;
        return {
            effective_entitlements: entitlements,
            active_subscription: active,
            raw: payload,
        };
    },

    async adminAssignDefaultSubscription(userId: string) {
        const { data } = await api.post<any>(`/admin/tariffs/users/${userId}/assign-default`);
        const payload = (data as any)?.data ?? data ?? {};
        return payload;
    },
};
