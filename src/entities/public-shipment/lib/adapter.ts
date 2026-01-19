import type { PublicCargoApi, PublicTransportApi, PublicShipmentBase } from "../model/types";
import { formatPrice } from "@/shared/utils/formatPrice";

const toDateArray = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (raw && typeof raw === "object") return Object.values(raw).filter(Boolean) as string[];
    return raw ? [raw] : [];
};

const getMinMaxDate = (arr: string[]): { min?: string; max?: string } => {
    if (!arr.length) return {};
    const sorted = arr
        .map((d) => new Date(d))
        .filter((d) => !Number.isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
    if (!sorted.length) return {};
    const toISO = (d: Date) => d.toISOString().split("T")[0];
    return { min: toISO(sorted[0]), max: toISO(sorted[sorted.length - 1]) };
};

export function adaptCargo(a: PublicCargoApi): PublicShipmentBase {
    const dateFromArr = toDateArray(a.date_from);
    const pickupDates = toDateArray((a as any).pickup_dates);
    const loadDates = dateFromArr.length ? dateFromArr : pickupDates;

    const unloadDates = toDateArray(a.date_to);

    const loadRange = getMinMaxDate(loadDates);
    const unloadRange = getMinMaxDate(unloadDates);

    const loadWindow = (loadRange.min && loadRange.max && loadRange.min !== loadRange.max)
        ? { from: loadRange.min, to: loadRange.max }
        : undefined;

    const datesFrom = loadWindow?.from ?? loadRange.min ?? dateFromArr[0] ?? (typeof a.date_from === "string" ? a.date_from : "");
    const datesTo = unloadRange.max ?? loadWindow?.to ?? (typeof a.date_to === "string" ? a.date_to : loadRange.max ?? "");

    const metrics: string[] = [];
    if (a.weight_t) metrics.push(`${Number(a.weight_t)} t`);
    if (a.volume_m3) metrics.push(`${Number(a.volume_m3)} m³`);
    if (typeof a.cars_count === "number") metrics.push(`${a.cars_count} cars`);

    const loadTypes = Array.isArray(a.load_type) ? a.load_type : (a.load_type ? [a.load_type] : []);
    const tags = [a.vehicle_type, ...loadTypes, a.cargo_type].filter(Boolean);

    const priceVal = Number(a.price_amount);
    const price = Number.isFinite(priceVal) && priceVal !== 0 && a.price_currency
        ? `${a.price_currency} ${formatPrice(priceVal, { fractionDigits: 2 })}`
        : undefined;

    return {
        id: a.id,
        dates: { from: datesFrom, to: datesTo },
        loadWindow,
        // public API пока не отдаёт города — оставим как unknown
        routeFrom: "Unknown origin",
        routeTo: "Unknown destination",
        metrics,
        tags,
        price,
        points: a.points,
        note: a.note ?? undefined,
        createdAt: a.created_at,
        isFavorite: Boolean((a as any).is_favorite),
    };
}

export function adaptTransport(a: PublicTransportApi): PublicShipmentBase {
    const dateFromArr = toDateArray(a.date_from);
    const pickupDates = toDateArray((a as any).pickup_dates);
    const loadDates = dateFromArr.length ? dateFromArr : pickupDates;

    const unloadDates = toDateArray(a.date_to);

    const loadRange = getMinMaxDate(loadDates);
    const unloadRange = getMinMaxDate(unloadDates);

    const loadWindow = (loadRange.min && loadRange.max && loadRange.min !== loadRange.max)
        ? { from: loadRange.min, to: loadRange.max }
        : undefined;

    const datesFrom = loadWindow?.from ?? loadRange.min ?? dateFromArr[0] ?? (typeof a.date_from === "string" ? a.date_from : "");
    const datesTo = unloadRange.max ?? loadWindow?.to ?? (typeof a.date_to === "string" ? a.date_to : loadRange.max ?? "");

    const metrics: string[] = [];
    if (a.weight_t) metrics.push(`${Number(a.weight_t)} t`);
    if (a.volume_m3) metrics.push(`${Number(a.volume_m3)} m³`);
    if (typeof a.cars_count === "number") metrics.push(`${a.cars_count} cars`);

    const tags = [a.vehicle_type].filter(Boolean);

    const priceVal = Number(a.price_amount);
    const price = Number.isFinite(priceVal) && priceVal !== 0 && a.price_currency
        ? `${a.price_currency} ${formatPrice(priceVal, { fractionDigits: 2 })}`
        : undefined;

    return {
        id: a.id,
        dates: { from: datesFrom, to: datesTo },
        loadWindow,
        routeFrom: "Any origin",
        routeTo: "Any destination",
        metrics,
        tags,
        price,
        points: a.points,
        note: a.note ?? undefined,
        createdAt: a.created_at,
        isFavorite: Boolean((a as any).is_favorite),
    };
}
