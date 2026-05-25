import type { TenderEditValues } from "./types";
import type { UpdateTenderPayload } from "@/entities/tender/model/types";

export const toDateTimeInput = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0, 16);
};

export const toNullableNumberString = (value: string) => {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) return null;

    const n = Number(normalized);

    return Number.isFinite(n) ? String(n) : null;
};

export const toNullableInteger = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return null;

    const n = Number(normalized);

    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
};

export const getTenderEditInitialValues = (tender: any): TenderEditValues => ({
    title: tender.title ?? "",
    cargoDescription: tender.cargo_description ?? "",
    pickupDate: tender.pickup_date ?? "",
    dropoffDate: tender.dropoff_date ?? "",
    pickupTime: tender.pickup_time ?? "",
    dropoffTime: tender.dropoff_time ?? "",
    cargoType: tender.cargo_type ?? "",
    vehicleType: tender.vehicle_type ?? "",
    loadingType: tender.loading_type ?? "",
    weightTons: tender.weight_t ?? "",
    volumeM3: tender.volume_m3 ?? "",
    placesCount: tender.places_count == null ? "" : String(tender.places_count),
  //  vehicleCapacityTons: tender.vehicle_capacity_t ?? "",
    vehicleBodyLengthM: tender.vehicle_body_length_m ?? "",
    startPrice: tender.start_price ?? "",
    buyoutPrice: tender.buyout_price ?? "",
    minBidStep: tender.min_bid_step ?? "",
    startsAt: toDateTimeInput(tender.starts_at),
    endsAt: toDateTimeInput(tender.ends_at),
    phone: tender.phone ?? "",
    payment_deferment_days: tender.payment_deferment_days ?? "",
});

export const buildTenderUpdatePayload = (values: TenderEditValues): UpdateTenderPayload => ({
    title: values.title.trim(),
    cargo_description: values.cargoDescription.trim() || null,
    pickup_date: values.pickupDate || null,
    dropoff_date: values.dropoffDate || null,
    pickup_time: values.pickupTime || null,
    dropoff_time: values.dropoffTime || null,
    cargo_type: values.cargoType || "GENERAL",
    vehicle_type: values.vehicleType || "ANY",
    loading_type: values.loadingType || null,
    weight_t: toNullableNumberString(values.weightTons),
    volume_m3: toNullableNumberString(values.volumeM3),
    places_count: toNullableInteger(values.placesCount),
 //   vehicle_capacity_t: toNullableNumberString(values.vehicleCapacityTons),
    vehicle_body_length_m: toNullableNumberString(values.vehicleBodyLengthM),
    start_price: toNullableNumberString(values.startPrice) || "0",
    buyout_price: toNullableNumberString(values.buyoutPrice),
    min_bid_step: toNullableNumberString(values.minBidStep) || "0",
    starts_at: new Date(values.startsAt).toISOString(),
    ends_at: new Date(values.endsAt).toISOString(),
    payment_deferment_days: toNullableNumberString(values.payment_deferment_days),
    phone: values.phone,
});