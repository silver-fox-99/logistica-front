import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { tariffsApi, type TariffPlan } from "@/shared/api/tariffsApi";
import type { TFunction } from "i18next";

export const useTariffPlans = (t: TFunction) => {
    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const res = await tariffsApi.listPublicPlans();
                setPlans(res.items ?? []);
            } catch (e: any) {
                const msg =
                    e?.response?.data?.message ??
                    t("paymentsNew.errors.loadPlans", { defaultValue: "Failed to load plans." });
                toast.error(String(msg));
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        void run();
    }, [t]);

    return { plans, loading };
};
