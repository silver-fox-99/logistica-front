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
    return [p.city, p.region, p.country].filter(Boolean).join(", ") || "—";
}

export function adaptCargo(i: CargoApiItem): ShipmentRowData {
    // Нормализуем массив points (минимум 2 элемента, чтобы было From/To)
    const points: GeoPoint[] = Array.isArray(i.points) ? i.points.slice(0, 2) : [];
    if (points.length < 2) {
        // дозаполним, чтобы всегда было 2
        while (points.length < 2) points.push({});
    }

    const from = points[0];
    const to = points[1];

    const dims = i.has_dimensions ? dimStr(i.length_m, i.width_m, i.height_m) : undefined;
    const name = [i.user?.first_name, i.user?.last_name].filter(Boolean).join(" ");

    return {
        id: i.id,

        /** прежние поля для текущей таблицы */
        routeFrom: asRouteString(from),
        routeTo: asRouteString(to),

        /** новый массив точек — теперь доступен потребителям */
        points,

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
        loadType: i.load_type,
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
    };
}

export const adaptTransport = adaptCargo as (i: TransportApiItem) => ShipmentRowData;
