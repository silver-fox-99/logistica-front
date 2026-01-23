import { useEffect, useState } from "react";
import { tariffsApi, type Entitlements, type TariffMeResponse } from "@/shared/api/tariffsApi";

export const useTariffMe = () => {
    const [effectiveEntitlements, setEffectiveEntitlements] = useState<Entitlements | null>(null);
    const [usage, setUsage] = useState<TariffMeResponse["usage"]>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const res = await tariffsApi.getMyTariff();
                setEffectiveEntitlements(res.effective_entitlements ?? null);
                setUsage(res.usage ?? null);
            } catch (e) {
                console.error("Failed to load tariff details", e);
            } finally {
                setLoading(false);
            }
        };
        void run();
    }, []);

    return { effectiveEntitlements, usage, loading };
};
