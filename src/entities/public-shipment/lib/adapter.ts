import type { PublicCargoApi, PublicTransportApi, PublicShipmentBase } from "../model/types";

export function adaptCargo(a: PublicCargoApi): PublicShipmentBase {
    const metrics: string[] = [];
    if (a.weight_t) metrics.push(`${Number(a.weight_t)} t`);
    if (a.volume_m3) metrics.push(`${Number(a.volume_m3)} m³`);
    if (typeof a.cars_count === "number") metrics.push(`${a.cars_count} cars`);

    const loadTypes = Array.isArray(a.load_type) ? a.load_type : (a.load_type ? [a.load_type] : []);
    const tags = [a.vehicle_type, ...loadTypes, a.cargo_type].filter(Boolean);

    const price = a.price_amount && a.price_currency
        ? `${a.price_currency} ${Number(a.price_amount).toFixed(2)}`
        : undefined;

    return {
        id: a.id,
        dates: { from: a.date_from, to: a.date_to },
        // public API пока не отдаёт города — оставим как unknown
        routeFrom: "Unknown origin",
        routeTo: "Unknown destination",
        metrics,
        tags,
        price,
        points: a.points,
        note: a.note ?? undefined,
        createdAt: a.created_at,
    };
}

export function adaptTransport(a: PublicTransportApi): PublicShipmentBase {
    const metrics: string[] = [];
    if (a.weight_t) metrics.push(`${Number(a.weight_t)} t`);
    if (a.volume_m3) metrics.push(`${Number(a.volume_m3)} m³`);
    if (typeof a.cars_count === "number") metrics.push(`${a.cars_count} cars`);

    const tags = [a.vehicle_type].filter(Boolean);

    const price = a.price_amount && a.price_currency
        ? `${a.price_currency} ${Number(a.price_amount).toFixed(2)}`
        : undefined;

    return {
        id: a.id,
        dates: { from: a.date_from, to: a.date_to },
        routeFrom: "Any origin",
        routeTo: "Any destination",
        metrics,
        tags,
        price,
        points: a.points,
        note: a.note ?? undefined,
        createdAt: a.created_at,
    };
}
