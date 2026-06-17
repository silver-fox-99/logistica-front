import { create } from 'zustand';
import { systemSettingsApi } from '@/shared/api/systemSettingsApi';

export interface FilterConfig {
    pickup_geo_location_name?: string;
    pickup_geo_location_type?: string;
    dropoff_geo_location_name?: string;
    dropoff_geo_location_type?: string;
    pickup_date_from?: string;
    pickup_date_to?: string;
    dropoff_date_from?: string;
    dropoff_date_to?: string;
    weight_min?: number;
    weight_max?: number;
    volume_min?: number;
    volume_max?: number;
    vehicle_type?: string[];
    favorites_only?: boolean;
}

export interface PageFilterSettings {
    default: FilterConfig;
    reset: FilterConfig;
}

export interface FilterSettings {
    search: PageFilterSettings;
    my: PageFilterSettings;
    home: PageFilterSettings;
}

export const FALLBACK_SETTINGS: FilterSettings = {
    search: {
        default: { pickup_date_from: "today" },
        reset: { pickup_date_from: "today" }
    },
    my: {
        default: {},
        reset: {}
    },
    home: {
        default: { pickup_date_from: "today" },
        reset: { pickup_date_from: "today" }
    }
};

interface FilterSettingsStore {
    settings: FilterSettings | null;
    loading: boolean;
    error: string | null;
    loadSettings: () => Promise<FilterSettings>;
    saveSettings: (newSettings: FilterSettings) => Promise<void>;
}

export const useFilterSettingsStore = create<FilterSettingsStore>((set, get) => ({
    settings: null,
    loading: false,
    error: null,
    loadSettings: async () => {
        const state = get();
        if (state.settings && !state.loading) return state.settings;

        set({ loading: true, error: null });
        try {
            const data = await systemSettingsApi.getByKey("filters.settings");
            const settings = (data.value as FilterSettings) || FALLBACK_SETTINGS;
            set({ settings, loading: false });
            return settings;
        } catch (e: any) {
            // Если 404 или другая ошибка, возвращаем FALLBACK_SETTINGS
            set({ settings: FALLBACK_SETTINGS, loading: false });
            return FALLBACK_SETTINGS;
        }
    },
    saveSettings: async (newSettings: FilterSettings) => {
        set({ loading: true, error: null });
        try {
            let existing: any = null;
            try {
                existing = await systemSettingsApi.getByKey("filters.settings");
            } catch {}

            if (existing) {
                await systemSettingsApi.update(existing.id, {
                    value: newSettings,
                });
            } else {
                await systemSettingsApi.create({
                    key: "filters.settings",
                    value: newSettings,
                    description: "Admin configured defaults and reset filters for Search, My Requests, and Home Page",
                });
            }

            set({ settings: newSettings, loading: false });
        } catch (error: any) {
            set({
                error: error?.response?.data?.message || "Failed to save settings",
                loading: false,
            });
            throw error;
        }
    }
}));
