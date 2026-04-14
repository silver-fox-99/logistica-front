export type BillingPeriod = "MONTHLY" | "YEARLY" | "ONE_TIME" | string;

export type TariffLimitKey =
    | "cargo_limit"
    | "vehicle_limit"
    | "order_details_views_per_day_limit"
    | "company_limit"
    | "members_per_company_limit";

export type TariffBooleanKey =
    | "can_view_order_details"
    | "can_auto_bump"
    | "can_create_companies";

export type EntitlementKey = TariffLimitKey | TariffBooleanKey;

export type Entitlements = {
    cargo_limit?: number | null;
    vehicle_limit?: number | null;
    can_view_order_details?: boolean;
    order_details_views_per_day_limit?: number | null;
    can_auto_bump?: boolean;
    can_create_companies?: boolean;
    company_limit?: number | null;
    members_per_company_limit?: number | null;
};

export type TariffPlan = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    is_default: boolean;
    can_auto_bump: boolean;
    priority: number | null;
    price: string | null;
    currency: string | null;
    billing_period: BillingPeriod | null;

    cargo_limit?: number | null;
    vehicle_limit?: number | null;
    can_view_order_details?: boolean;
    order_details_views_per_day_limit?: number | null;
    can_create_companies?: boolean;
    company_limit?: number | null;
    members_per_company_limit?: number | null;

    meta?: Record<string, any> | null;

    /**
     * Временная совместимость со старым форматом ответа.
     * На запись больше не используем.
     */
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
    can_auto_bump?: boolean;
    priority?: number | null;
    price?: string | null;
    currency?: string | null;
    billing_period?: BillingPeriod | null;

    cargo_limit?: number | null;
    vehicle_limit?: number | null;
    can_view_order_details?: boolean;
    order_details_views_per_day_limit?: number | null;
    can_create_companies?: boolean;
    company_limit?: number | null;
    members_per_company_limit?: number | null;

    meta?: Record<string, any>;
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

export type TariffSubscriptionEntitlementOverride = {
    id?: string;
    key: string;
    int_value?: number | null;
    bool_value?: boolean | null;
    reason?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
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
    entitlements_overrides?: TariffSubscriptionEntitlementOverride[] | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type TariffsInitDictItem = {
    name?: string | null;
    value: string;
};

export type TariffsInitData = {
    billing_period?: TariffsInitDictItem[];
    subscription_status?: TariffsInitDictItem[];
    subscription_source?: TariffsInitDictItem[];
    element_key?: TariffsInitDictItem[];
};

export type TariffInvoice = {
    id: string;
    user_id?: string;
    plan_id?: string;
    plan_name?: string;
    plan_code?: string;
    currency?: string;
    subscription_id?: string;
    invoice_id?: string;
    provider?: string;
    provider_uuid?: string;
    status?: string;
    provider_status?: string;
    amount?: string | number | null;
    checkout_url?: string | null;
    short_link?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type TariffMeResponse = {
    effective_entitlements: Entitlements;
    active_subscription: TariffSubscription | null;
    usage?: {
        monthKey?: string;
        dayKey?: string;
        cargo_creates_used?: number | string;
        vehicle_creates_used?: number | string;
        can_auto_bump?: boolean;
        order_details_views_used?: number | string;
    } | null;
    raw?: any;
};

export type CheckoutResponse = {
    invoice_id: string;
    subscription_id: string;
    checkout_url: string | null;
    short_link?: string | null;
};

export type ApiEntitlementKey =
    | "CARGO_LIMIT"
    | "VEHICLE_LIMIT"
    | "CAN_AUTO_BUMP"
    | "CAN_VIEW_ORDER_DETAILS"
    | "ORDER_DETAILS_VIEWS_PER_DAY_LIMIT"
    | "CAN_CREATE_COMPANIES"
    | "COMPANY_LIMIT"
    | "MEMBERS_PER_COMPANY_LIMIT";

export type SubscriptionEntitlementInput = {
    key: ApiEntitlementKey;
    int_value?: number | null;
    bool_value?: boolean | null;
    reason?: string | null;
};

export type IssueSubscriptionPayload = {
    plan_id: string;
    starts_at?: string | null;
    ends_at?: string | null;
    lifetime?: boolean;
    note?: string | null;
    source?: string | null;
    cancel_previous?: boolean;
    entitlements?: SubscriptionEntitlementInput[];
};

export type UpdateEntitlementsPayload = {
    entitlements: SubscriptionEntitlementInput[];
    replace?: boolean;
};