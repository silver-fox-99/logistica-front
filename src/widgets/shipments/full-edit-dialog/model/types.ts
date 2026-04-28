import type { MapsLocationSuggestion } from "@/entities/maps/model/types";

export type Kind = "cargo" | "transport";

export type EditPoint = {
    clientKey: string;
    id?: string;
    type: string;

    location: MapsLocationSuggestion | null;

    country: string;
    region: string | null;
    city: string | null;

    address: string;
    display_name: string | null;
    latitude: number | null;
    longitude: number | null;
    geocode_source: string | null;

    order?: number | null;
};

export type FormState = {
    loadFrom: string;
    loadTo: string;
    unloadDate: string;

    vehicleType: string;
    loadType: string[];
    cargoType: string;
    allowPartialLoad: boolean;

    palletsCount: string;
    carsCount: string;

    bargain: string;

    weightT: string;
    volumeM3: string;

    hasDimensions: boolean;
    lengthM: string;
    widthM: string;
    heightM: string;

    priceCurrency: string;
    priceAmount: string;

    note: string;
};

export type InitialData = {
    id: string;
    dateFrom?: string[] | string | null;
    dateTo?: string | null;

    vehicleType?: string | null;
    loadType?: string[] | null;
    cargoType?: string | null;
    allowPartialLoad?: boolean | null;

    palletsCount?: number | string | null;
    carsCount?: number | string | null;

    bargain?: string | null;

    weightT?: number | string | null;
    volumeM3?: number | string | null;

    hasDimensions?: boolean | null;
    lengthM?: number | string | null;
    widthM?: number | string | null;
    heightM?: number | string | null;

    priceCurrency?: string | null;
    priceAmount?: number | string | null;

    note?: string | null;

    points?: any[];
};

export type VehicleTypeOpt = {
    value: string;
    label: string;
};

export const POINT_TYPES = {
    cargo: {
        from: "PICKUP",
        to: "DROPOFF",
    },
    transport: {
        from: "DEPARTURE",
        to: "ARRIVAL",
    },
} as const;