import { create } from "zustand";
import type { TariffSubscription, Entitlements, TariffMeResponse } from "@/entities/tariff-plan/model/types";
import { tariffsApi } from "@/shared/api/tariffsApi";

interface TariffStore {
    activeSubscription: TariffSubscription | null;
    effectiveEntitlements: Entitlements | null;
    usage: TariffMeResponse["usage"];
    loading: boolean;
    error: string | null;
    loadTariff: (force?: boolean) => Promise<void>;
    clearTariff: () => void;
}

export const useTariffStore = create<TariffStore>((set, get) => ({
    activeSubscription: null,
    effectiveEntitlements: null,
    usage: null,
    loading: false,
    error: null,
    loadTariff: async (force = false) => {
        const state = get();
        // Return early if already loaded/loading and not a forced reload
        if (!force && (state.activeSubscription || state.effectiveEntitlements || state.loading)) {
            return;
        }

        set({ loading: true, error: null });
        try {
            const res = await tariffsApi.getMyTariff();
            set({
                activeSubscription: res.active_subscription ?? null,
                effectiveEntitlements: res.effective_entitlements ?? null,
                usage: res.usage ?? null,
                loading: false,
            });
        } catch (e: any) {
            set({
                error: e?.response?.data?.message || "Failed to load tariff details",
                loading: false,
            });
        }
    },
    clearTariff: () => set({
        activeSubscription: null,
        effectiveEntitlements: null,
        usage: null,
        error: null,
        loading: false,
    }),
}));
