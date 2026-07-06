import type {
    PublicCargoApi,
    PublicTransportApi,
    PublicShipmentBase,
    PublicPoint,
    PublicPointType,
} from "../model/types";
import { formatPrice } from "@/shared/utils/formatPrice";

const toDateArray = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw.filter(Boolean) as string[];
    if (raw && typeof raw === "object") return Object.values(raw).filter(Boolean) as string[];
    return raw ? [String(raw)] : [];
};

const getMinMaxDate = (arr: string[]): { min?: string; max?: string } => {
    if (!arr.length) return {};

    const sorted = arr
        .map((d) => new Date(d))
        .filter((d) => !Number.isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

    if (!sorted.length) return {};

    const toISO = (d: Date) => d.toISOString().split("T")[0];

    return {
        min: toISO(sorted[0]),
        max: toISO(sorted[sorted.length - 1]),
    };
};

const normalizePointType = (type?: string | null): PublicPointType => {
    if (
        type === "DEPARTURE" ||
        type === "ARRIVAL" ||
        type === "PICKUP" ||
        type === "DROPOFF" ||
        type === "WAYPOINT"
    ) {
        return type;
    }

    return "WAYPOINT";
};

const adaptBase = (
    a: PublicCargoApi | PublicTransportApi,
    tags: string[]
): PublicShipmentBase => {
    const dateFromArr = toDateArray(a.date_from);
    const pickupDates = toDateArray((a as any).pickup_dates);
    const loadDates = dateFromArr.length ? dateFromArr : pickupDates;
    const unloadDates = toDateArray(a.date_to);

    const loadRange = getMinMaxDate(loadDates);
    const unloadRange = getMinMaxDate(unloadDates);

    const loadWindow =
        loadRange.min && loadRange.max && loadRange.min !== loadRange.max
            ? { from: loadRange.min, to: loadRange.max }
            : undefined;

    const datesFrom =
        loadWindow?.from ??
        loadRange.min ??
        dateFromArr[0] ??
        (typeof a.date_from === "string" ? a.date_from : "");

    const datesTo =
        unloadRange.max ??
        loadWindow?.to ??
        (typeof a.date_to === "string" ? a.date_to : loadRange.max ?? "");

    const metrics: string[] = [];
    if (a.weight_t) metrics.push(`${Number(a.weight_t)} t`);
    if (a.volume_m3) metrics.push(`${Number(a.volume_m3)} m³`);
    if (typeof a.cars_count === "number") metrics.push(`${a.cars_count} cars`);

    const priceVal = Number(a.price_amount);
    const price =
        Number.isFinite(priceVal) && priceVal !== 0 && a.price_currency
            ? `${a.price_currency} ${formatPrice(priceVal, { fractionDigits: 2 })}`
            : undefined;

    const points: PublicPoint[] = (a.points ?? [])
        .map((point, index) => ({
            id: point.id,
            type: normalizePointType(point.type),
            order: typeof point.order === "number" ? point.order : index,
            country: point.country ?? null,
            country_ru: point.country_ru ?? null,
            country_uz: point.country_uz ?? null,
            region: point.region ?? null,
          //  display_name: point.display_name ?? null,
            region_ru: point.region_ru ?? null,
            region_uz: point.region_uz ?? null,
            city: point.city ?? null,
            city_ru: point.city_ru ?? null,
            city_uz: point.city_uz ?? null,
            address: point.address ?? null,
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  //  const fromPoints = points.filter(
  //      (point) => point.type === "PICKUP" || point.type === "DEPARTURE"
  //  );
  //  const toPoints = points.filter(
  //      (point) => point.type === "DROPOFF" || point.type === "ARRIVAL"
  //  );

  //  const primaryFrom = fromPoints[0] ?? points[0];
  //  const primaryTo = toPoints[0] ?? points[points.length - 1];
//
  //  const toRouteLabel = (point?: PublicPoint) => {
  //      if (!point) return "—";
  //    //  if (point.display_name) return point.display_name;
  //      const parts = [point.country, point.region, point.city].filter(Boolean);
  //      return parts.length ? parts.join(", ") : "—";
  //  };

    return {
        id: a.id,
        dates: {
            from: datesFrom,
            to: datesTo,
        },
        loadWindow,
     //   routeFrom: toRouteLabel(primaryFrom),
     //   routeTo: toRouteLabel(primaryTo),
        points,
        metrics,
        tags,
        price,
        note: a.note ?? undefined,
        createdAt: a.created_at,
        isFavorite: Boolean((a as any).is_favorite),
        display_type: a?.display_type
    };
};

export function adaptCargo(a: PublicCargoApi): PublicShipmentBase {
    const loadTypes = Array.isArray(a.load_type) ? a.load_type : a.load_type ? [a.load_type] : [];
    const tags = [a.vehicle_type, ...loadTypes, a.cargo_type].filter(Boolean) as string[];

    return adaptBase(a, tags);
}

export function adaptTransport(a: PublicTransportApi): PublicShipmentBase {
    const tags = [a.vehicle_type].filter(Boolean) as string[];

    return adaptBase(a, tags);
}