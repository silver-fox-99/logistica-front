import type { GeoPoint } from "@/entities/shipment/model/type";

export type Kind = "cargo" | "transport";

export type VehicleTypeOpt = {
    value: string;
    label: string;
};

export type InitialData = {
    id?: string;
    dateFrom?: string | string[] | null;
    dateTo?: string | null;

    vehicleType?: string | null;

    loadType?: string[] | null;
    cargoType?: string | null;
    allowPartialLoad?: boolean | null;
    palletsCount?: number | string | null;

    carsCount?: number | string | null;

    weightT?: number | string | null;
    volumeM3?: number | string | null;
    hasDimensions?: boolean | null;
    lengthM?: number | string | null;
    widthM?: number | string | null;
    heightM?: number | string | null;
    priceCurrency?: string | null;
    priceAmount?: number | string | null;
    note?: string | null;

    bargain?: string | null;

    points?: GeoPoint[];
};

export type EditPoint = {
    clientKey: string;
    id?: string;
    type: string;

    countryId: string;
    regionId: string;
    cityId: string;
    address: string;

    rawCountryName?: string | null;
    rawRegionName?: string | null;
    rawCityName?: string | null;
};

export type FormState = {
    loadFrom: string;
    loadTo: string;
    unloadDate: string;

    vehicleType: string;
    carsCount: string;

    weightT: string;
    volumeM3: string;
    hasDimensions: boolean;
    lengthM: string;
    widthM: string;
    heightM: string;

    priceCurrency: string;
    priceAmount: string;
    note: string;

    loadType: string[];
    cargoType: string;
    allowPartialLoad: boolean;
    palletsCount: string;

    bargain: string;
};

export const POINT_TYPES = {
    cargo: { from: "PICKUP", to: "DROPOFF" },
    transport: { from: "DEPARTURE", to: "ARRIVAL" },
} as const;