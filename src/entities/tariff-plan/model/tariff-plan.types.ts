import type {BillingPeriod, TariffPlan, UpsertTariffPlanPayload} from "@/entities/tariff-plan/model/types.ts";

export type TariffPlanFormValues = {
    code: string;
    name: string;
    description: string;
    is_active: boolean;
    is_default: boolean;
    priority: number | null;
    price_text: string;
    currency: string;
    billing_period: BillingPeriod | "";

    cargo_limit: number | null;
    vehicle_limit: number | null;
    can_view_order_details: boolean;
    order_details_views_per_day_limit: number | null;
    can_auto_bump: boolean;
    can_create_companies: boolean;
    company_limit: number | null;
    members_per_company_limit: number | null;
};

export type BillingPeriodOption = {
    value: BillingPeriod;
    label: string;
};

export type TariffPlanSubmitPayload = UpsertTariffPlanPayload;

export type TariffPlanLike = TariffPlan & {
    entitlements?: Partial<Record<string, unknown>>;
};