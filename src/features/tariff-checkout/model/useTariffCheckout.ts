import { useState } from "react";
import { toast } from "react-toastify";
import { tariffsApi } from "@/shared/api/tariffsApi";
import type { TFunction } from "i18next";
import type {TariffPlan} from "@/entities/tariff-plan/model/types.ts";

export const useTariffCheckout = (t: TFunction) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const checkout = async (plan: TariffPlan) => {
        if (!plan?.id) return;

        try {
            setLoadingId(plan.id);

            const res = await tariffsApi.checkout(plan.id);
            const url = res.checkout_url || res.short_link;

            if (!url) {
                toast.error(
                    String(t("paymentsNew.errors.checkoutNoUrl", { defaultValue: "Checkout URL was not returned." }))
                );
                return;
            }

            window.open(url, "_blank", "noopener,noreferrer");
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ??
                t("paymentsNew.errors.checkout", { defaultValue: "Failed to create invoice." });
            toast.error(String(msg));
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    return { checkout, loadingId };
};
