import { useEffect, useState } from "react";
import { tariffsApi } from "@/shared/api/tariffsApi";
import type { TFunction } from "i18next";
import type {TariffSubscription} from "@/entities/tariff-plan/model/types.ts";

export const useTariffHistory = (t: TFunction) => {
    const [items, setItems] = useState<TariffSubscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await tariffsApi.listMyHistory();
                setItems(res.items ?? []);
            } catch (e: any) {
                const msg =
                    e?.response?.data?.message ??
                    t("paymentsNew.errors.history", { defaultValue: "History unavailable." });
                setError(String(msg));
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        void run();
    }, [t]);

    return { history: items, loading, error };
};
