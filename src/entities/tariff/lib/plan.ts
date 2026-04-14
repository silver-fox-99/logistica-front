import type {TariffPlan} from "@/entities/tariff-plan/model/types.ts";

export const priceLabel = (plan: TariffPlan) => {
    if (plan.price === undefined || plan.price === null || plan.price === "") return "—";
    if (!plan.currency || !plan.billing_period) return "—";
    return `${plan.price} ${plan.currency} / ${plan.billing_period}`;
};

export const normalizeValueDisplay = (val: string) => (val === "—" ? "∞" : val);
