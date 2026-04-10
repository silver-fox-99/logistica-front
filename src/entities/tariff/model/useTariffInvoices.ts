import { useEffect, useState } from "react";
import { tariffsApi } from "@/shared/api/tariffsApi";
import type { TFunction } from "i18next";
import type {TariffInvoice} from "@/entities/tariff-plan/model/types.ts";

export const useTariffInvoices = (t: TFunction) => {
    const [items, setItems] = useState<TariffInvoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await tariffsApi.listMyInvoices();
                setItems(res.items ?? []);
            } catch (e: any) {
                const msg =
                    e?.response?.data?.message ??
                    t("paymentsNew.errors.invoices", { defaultValue: "Invoices unavailable." });
                setError(String(msg));
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        void run();
    }, [t]);

    return { invoices: items, loading, error };
};
