import type {TariffPlan} from "@/entities/tariff-plan/model/types.ts";

export const priceLabel = (plan: TariffPlan) => {
    if (plan.price === undefined || plan.price === null || plan.price === "") return "—";
    if (!plan.currency || !plan.billing_period) return "—";

    if (plan.billing_period === "CUSTOM") {
        const daysCount = plan.days ?? 0;
        const mod10 = daysCount % 10;
        const mod100 = daysCount % 100;
        let suffix = "дней";
        if (mod100 < 11 || mod100 > 19) {
            if (mod10 === 1) suffix = "день";
            else if (mod10 >= 2 && mod10 <= 4) suffix = "дня";
        }
        return `${plan.price} ${plan.currency} / ${daysCount} ${suffix}`;
    }

    return `${plan.price} ${plan.currency} / ${plan.billing_period}`;
};

export const normalizeValueDisplay = (val: string) => (val === "—" ? "∞" : val);
