// entities/shipment/lib/adapter.ts
import type { CargoApiItem, TransportApiItem, ShipmentRowData, GeoPoint } from "../model/type";

const money = (cur: string, amt: string | number) => `${amt} ${cur}`;

const dimStr = (l?: any, w?: any, h?: any) => {
    if (l == null || w == null || h == null) return undefined;
    return `${Number(l)}m × ${Number(w)}m × ${Number(h)}m`;
};

const tagsFromPayload = (p: { weight_t?: any; volume_m3?: any }): string[] => {
    const t: string[] = [];
    if (p.weight_t != null && Number(p.weight_t) > 0) t.push(`${Number(p.weight_t)}t`);
    if (p.volume_m3 != null && Number(p.volume_m3) > 0) t.push(`${Number(p.volume_m3)}m³`);
    return t;
};

const paymentMap: Record<string, "Cash" | "Bank" | "Card" | undefined> = {
    BANK_TRANSFER: "Bank",
    CASH: "Cash",
    CARD: "Card",
};

function asRouteString(p?: GeoPoint): string {
    if (!p) return "—";
    return [p.country, p.region, p.city].filter(Boolean).join(", ") || "—";
}

export function adaptCargo(i: CargoApiItem): ShipmentRowData {
    // Нормализуем массив points
    const pointsAll: GeoPoint[] = Array.isArray(i.points) ? i.points.slice() : [];
    const pickups = pointsAll.filter((p: any) => p?.type === "PICKUP");
    const dropoffs = pointsAll.filter((p: any) => p?.type === "DROPOFF");

    const fallbackPoints: GeoPoint[] = pointsAll.slice(0, 2);
    while (fallbackPoints.length < 2) fallbackPoints.push({});

    const from = pickups[0] || fallbackPoints[0];
    const to = dropoffs[0] || (fallbackPoints[1] ?? {});

    const dims = i.has_dimensions ? dimStr(i.length_m, i.width_m, i.height_m) : undefined;
    const name = [i.user?.first_name, i.user?.last_name].filter(Boolean).join(" ");

    return {
        id: i.id,

        /** прежние поля для текущей таблицы */
        routeFrom: asRouteString(from),
        routeTo: asRouteString(to),

        /** новый массив точек — теперь доступен потребителям */
        points: pointsAll.length ? pointsAll : fallbackPoints,

        distanceKm: 0, // при необходимости посчитаешь позже
        dates: { from: i.date_from, to: i.date_to },
        dims,
        typeTags: tagsFromPayload(i),
        badges: undefined,

        paymentType: paymentMap[i.payment_method ?? ""],
        price: money(i.price_currency, i.price_amount),
        pricePerKm: undefined,
        timeAgo: undefined,
        repeats: undefined,
        views: undefined,

        contact: {
            name,
            email: i.user?.email,
            phone1: i.user?.phone,
            phone2: i.contact_extra_phone ?? undefined,
        },

        // Дополнительные поля
        vehicleType: i.vehicle_type,
        loadType: Array.isArray(i.load_type) ? i.load_type : (i.load_type ? [i.load_type] : undefined),
        cargoType: i.cargo_type,
        allowPartialLoad: i.allow_partial_load ?? undefined,
        carsCount: i.cars_count ?? undefined,
        palletsCount: i.pallets_count ?? undefined,
        weightT: i.weight_t != null ? Number(i.weight_t) : undefined,
        volumeM3: i.volume_m3 != null ? Number(i.volume_m3) : undefined,
        paymentTerm: i.payment_term,
        bargain: i.bargain,
        note: i.note ?? undefined,
        contactExtraPhone: i.contact_extra_phone ?? undefined,
        extraPhoneAsMain: i.extra_phone_as_main ?? false,
        viewCount: i.view_count ?? '0',
        isFavorite: Boolean((i as any).is_favorite),
    };
}

export const adaptTransport = adaptCargo as (i: TransportApiItem) => ShipmentRowData;
