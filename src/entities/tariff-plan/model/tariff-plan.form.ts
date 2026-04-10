import type { TariffPlanFormValues, TariffPlanLike } from "./tariff-plan.types";
import type {BillingPeriod, TariffPlan, UpsertTariffPlanPayload} from "@/entities/tariff-plan/model/types.ts";

export const FALLBACK_BILLING_PERIODS: { value: BillingPeriod; label: string }[] = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "ONE_TIME", label: "One-time" },
];

export const createEmptyTariffPlanForm = (
    defaultPeriod?: BillingPeriod | null,
): TariffPlanFormValues => ({
    code: "",
    name: "",
    description: "",
    is_active: true,
    is_default: false,
    priority: 0,
    price_text: "",
    currency: "",
    billing_period: defaultPeriod ?? "",

    cargo_limit: null,
    vehicle_limit: null,
    can_view_order_details: false,
    order_details_views_per_day_limit: null,
    can_auto_bump: false,
    can_create_companies: false,
    company_limit: null,
    members_per_company_limit: null,
});

const toNullableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value: unknown): boolean => Boolean(value);

export const mapPlanToFormValues = (plan: TariffPlanLike): TariffPlanFormValues => {
    const ent = plan.entitlements ?? {};

    return {
        code: plan.code ?? "",
        name: plan.name ?? "",
        description: plan.description ?? "",
        is_active: !!plan.is_active,
        is_default: !!plan.is_default,
        priority: plan.priority ?? 0,
        price_text:
            plan.price === null || plan.price === undefined || plan.price === ""
                ? ""
                : String(plan.price),
        currency: plan.currency ?? "",
        billing_period: (plan.billing_period as BillingPeriod | null) ?? "",

        cargo_limit: toNullableNumber(ent.cargo_limit),
        vehicle_limit: toNullableNumber(ent.vehicle_limit),
        can_view_order_details: toBoolean(ent.can_view_order_details),
        order_details_views_per_day_limit: toNullableNumber(ent.order_details_views_per_day_limit),

        // Важно: корневое значение приоритетнее, потому что DTO бека именно такое
        can_auto_bump:
            typeof plan.can_auto_bump === "boolean"
                ? plan.can_auto_bump
                : toBoolean(ent.can_auto_bump),

        can_create_companies: toBoolean(ent.can_create_companies),
        company_limit: toNullableNumber(ent.company_limit),
        members_per_company_limit: toNullableNumber(ent.members_per_company_limit),
    };
};

export const validateTariffPlanForm = (
    values: TariffPlanFormValues,
    plans: TariffPlan[],
    editingId?: string | null,
): string | null => {
    const code = values.code.trim();

    if (!code) return "Code is required.";
    if (!values.name.trim()) return "Name is required.";

    const duplicate = plans.some(
        (plan) =>
            plan.code.toLowerCase() === code.toLowerCase() &&
            (!editingId || plan.id !== editingId),
    );

    if (duplicate) return "Plan code must be unique.";

    const priceNumber = values.price_text ? Number(values.price_text) : 0;
    const priorityValue = values.priority ?? 0;

    if (priorityValue === 0 && priceNumber > 0) {
        return "Priority cannot be 0 for a paid plan.";
    }

    if (values.currency && values.currency.trim().length !== 3) {
        return "Currency must contain 3 characters.";
    }

    return null;
};

export const buildTariffPlanPayload = (
    values: TariffPlanFormValues,
): UpsertTariffPlanPayload => {
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim() || null,
        is_active: values.is_active,
        is_default: values.is_default,
        priority: values.priority === null ? undefined : values.priority,
        price: values.price_text.trim() ? values.price_text.trim() : null,
        currency: values.currency.trim() ? values.currency.trim().toUpperCase() : null,
        billing_period: values.billing_period || null,

        cargo_limit: values.cargo_limit,
        vehicle_limit: values.vehicle_limit,
        can_view_order_details: values.can_view_order_details,
        order_details_views_per_day_limit: values.order_details_views_per_day_limit,
        can_auto_bump: values.can_auto_bump,
        can_create_companies: values.can_create_companies,
        company_limit: values.company_limit,
        members_per_company_limit: values.members_per_company_limit,
    };
};

export const formatTariffPrice = (plan: TariffPlan) => {
    if (plan.price === undefined || plan.price === null || plan.price === "") return "—";
    if (!plan.currency || !plan.billing_period) return "—";

    return `${plan.price} ${plan.currency} / ${plan.billing_period}`;
};

export const formatTariffDate = (value?: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
    });
};

export const sanitizeDigits = (value: string) => value.replace(/\D/g, "");