import { create } from 'zustand';
import { commonInitApi, type CommonInitData } from "@/shared/api/commonInitApi";
import type { GeoItem } from "@/shared/api/cargoApi";
import type { LookupOpt } from "@/shared/utils/lookupUtils";

interface InitStore {
    geos: GeoItem[] | null;
    lookups: CommonInitData["lookups"] | null;
    cargoPoints: CommonInitData["cargoPoints"] | null;
    transportPoints: CommonInitData["transportPoints"] | null;
    loading: boolean;
    error: string | null;
    loadInit: () => Promise<void>;
    getLookup: (type: keyof CommonInitData["lookups"], slug: string) => LookupOpt | undefined;
}

const normalizeLookupOpt = (opt: any): LookupOpt => {
    if (!opt) return opt;
    return {
        slug: opt.slug,
        label: opt.label,
        label_ru: opt.label_ru ?? opt.ru ?? null,
        label_uz: opt.label_uz ?? opt.uz ?? null,
    };
};

export const useInitStore = create<InitStore>((set, get) => ({
    geos: null,
    lookups: null,
    cargoPoints: null,
    transportPoints: null,
    loading: false,
    error: null,
    loadInit: async () => {
        const state = get();
        if (state.lookups || state.loading) return;

        set({ loading: true, error: null });
        try {
            const data = await commonInitApi.load();
            const normalizedLookups: CommonInitData["lookups"] = {
                vehicleType: data.lookups.vehicleType.map(normalizeLookupOpt),
                paymentMethods: data.lookups.paymentMethods.map(normalizeLookupOpt),
                paymentTerms: data.lookups.paymentTerms.map(normalizeLookupOpt),
                bargainOptions: data.lookups.bargainOptions.map(normalizeLookupOpt),
                currency: data.lookups.currency.map(normalizeLookupOpt),
                cargoTypes: data.lookups.cargoTypes?.map(normalizeLookupOpt),
                loadType: data.lookups.loadType?.map(normalizeLookupOpt),
            };
            set({
                geos: data.geos,
                lookups: normalizedLookups,
                cargoPoints: data.cargoPoints,
                transportPoints: data.transportPoints,
                loading: false,
            });
        } catch (error: any) {
            set({
                error: error?.response?.data?.message || "Failed to load init data",
                loading: false,
            });
        }
    },
    getLookup: (type, slug) => {
        const { lookups } = get();
        if (!lookups || !lookups[type]) return undefined;
        return lookups[type]?.find(opt => opt.slug === slug);
    },
}));


