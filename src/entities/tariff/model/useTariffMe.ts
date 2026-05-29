import { useEffect } from "react";
import { useTariffStore } from "./tariff.store";

export const useTariffMe = () => {
    const { activeSubscription, effectiveEntitlements, usage, loading, loadTariff } = useTariffStore();

    useEffect(() => {
        void loadTariff();
    }, [loadTariff]);

    return {
        activeSubscription,
        effectiveEntitlements,
        usage,
        loading,
        refetch: () => loadTariff(true),
    };
};
