import type { CargoApiItem, TransportApiItem, ShipmentRowData, GeoPoint } from "../model/type";

import { formatPrice } from "@/shared/utils/formatPrice";

const money = (cur: string, amt: string | number) => {
    const num = Number(amt);
    if (!cur || !Number.isFinite(num) || num === 0) return undefined;
    const formatted = formatPrice(num);
    return formatted ? `${formatted} ${cur}` : undefined;
};

function toNum(value: unknown): number | null {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function adaptRoute(raw: any) {
    if (!raw) return null;

    const points = Array.isArray(raw.points)
        ? raw.points
            .map((point: any) => {
                const lat = toNum(point?.lat);
                const lon = toNum(point?.lon);

                if (lat == null || lon == null) return null;

                return {
                    id: point?.id,
                    type: point?.type,
                    label: point?.label,
                    lat,
                    lon,
                    order: point?.order ?? 0,
                };
            })
            .filter(Boolean)
        : [];

    return {
        points,
        center: Array.isArray(raw.center) ? raw.center : null,
        bounds: Array.isArray(raw.bounds) ? raw.bounds : null,
        geometry: Array.isArray(raw.geometry) ? raw.geometry : [],
        distance_m: toNum(raw.distance_m),
        duration_s: toNum(raw.duration_s),
    };
}

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

function asRouteString(p?: GeoPoint): string {
    if (!p) return "—";
    return [p.country, p.region, p.city].filter(Boolean).join(", ") || "—";
}

export function adaptCargo(i: CargoApiItem): any {
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
    const dateFromArr = toDateArray(i.date_from);
    const pickupDates = toDateArray((i as any).pickup_dates);
    const loadDates = dateFromArr.length ? dateFromArr : pickupDates;

  //  const unloadDates = toDateArray(i.date_to);

    const loadRange = getMinMaxDate(loadDates);
  //  const unloadRange = getMinMaxDate(unloadDates);

    const df = i.date_from;

    const loadWindow = (() => {
        if (!df) return { from: undefined, to: undefined };

        if (Array.isArray(df)) {
            const dates = df.filter(Boolean);

            if (dates.length >= 2) return { from: dates[0], to: dates[1] };
            if (dates.length === 1) return { from: dates[0], to: undefined  };

            return { from: undefined, to: undefined };
        }

        return { from: df, to: undefined };
    })();



    const datesFrom = loadWindow?.from ?? loadRange.min ?? dateFromArr[0] ?? (typeof i.date_from === "string" ? i.date_from : "");
    const datesTo = i.date_to ?? "";

    return {
        id: i.id,

        /** прежние поля для текущей таблицы */
        routeFrom: asRouteString(from),
        routeTo: asRouteString(to),

        /** новый массив точек — теперь доступен потребителям */
        points: pointsAll.length ? pointsAll : fallbackPoints,

        distanceKm: 0, // при необходимости посчитаешь позже
        dates: { from: datesFrom, to: datesTo },
        loadWindow,
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
            userId: (i as any)?.user?.id,
            name,
            company: (i as any)?.user?.company,
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
        updated_at: i.updated_at ?? undefined,
        sort_updated_at: i.sort_updated_at ?? undefined,
        up_count: i.up_count ?? undefined,
        images: i.images ?? [],
        route: adaptRoute((i as any).route),
    };
}

export const adaptTransport = adaptCargo as (i: TransportApiItem) => ShipmentRowData;
