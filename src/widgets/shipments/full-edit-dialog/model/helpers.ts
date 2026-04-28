import type { GeoPoint } from "@/entities/shipment/model/type";
import type { EditPoint, FormState, InitialData, Kind } from "./types";
import { POINT_TYPES } from "./types";

export const createEmptyPoint = (type: string): EditPoint => ({
    clientKey: crypto.randomUUID(),
    type,

    location: null,

    country: "",
    region: null,
    city: null,

    address: "",
    display_name: null,
    latitude: null,
    longitude: null,
    geocode_source: null,
});

export const toStr = (v: unknown, fallback = ""): string =>
    v == null ? fallback : String(v);

export const toBool = (v: unknown, fallback = false): boolean => {
    if (typeof v === "boolean") return v;

    if (typeof v === "string") {
        if (v === "true") return true;
        if (v === "false") return false;
    }

    return fallback;
};

export const toOptionalNumber = (v: unknown): number | null => {
    if (v == null) return null;
    if (typeof v === "string" && v.trim() === "") return null;

    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
};

export const toNumberOr = (v: unknown, d: number): number => {
    const n = toOptionalNumber(v);
    return n == null ? d : n;
};

export const toDateInput = (v?: string | null): string => {
    if (!v) return "";

    const s = String(v).trim();
    if (!s) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const dotMatch = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

    if (dotMatch) {
        return `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
    }

    const d = new Date(s);

    if (!Number.isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return "";
};

export const splitInitialLoadRange = (v?: string | string[] | null) => {
    if (Array.isArray(v)) {
        const from = toDateInput(v[0] ?? "");
        const to = toDateInput((v[1] ?? v[0]) ?? "");

        return { from, to: to || from };
    }

    const from = toDateInput(v ?? "");

    return { from, to: from };
};

export const normalizeLoadRange = (
    from?: string,
    to?: string
): string[] | undefined => {
    const f = (from || "").trim();
    const t = (to || "").trim();

    if (!f && !t) return undefined;

    const start = f || t;
    const end = t || f;

    if (!start) return undefined;

    if (end && end < start) {
        throw new Error("date_from range is invalid");
    }

    return start === end ? [start] : [start, end];
};

const pickString = (...values: unknown[]): string | null => {
    const hit = values.find(
        (value): value is string => typeof value === "string" && value.trim().length > 0
    );

    return hit?.trim() ?? null;
};

const pickNumber = (...values: unknown[]): number | null => {
    for (const value of values) {
        if (value == null || value === "") continue;

        const num = Number(value);

        if (Number.isFinite(num)) return num;
    }

    return null;
};

export const buildInitialForm = (initial?: InitialData): FormState => {
    const initLoad = splitInitialLoadRange(initial?.dateFrom);

    return {
        loadFrom: initLoad.from,
        loadTo: initLoad.to,
        unloadDate: toDateInput(initial?.dateTo),

        vehicleType: initial?.vehicleType || "ANY",
        carsCount: toStr(initial?.carsCount ?? ""),

        weightT: toStr(initial?.weightT),
        volumeM3: toStr(initial?.volumeM3),
        hasDimensions: toBool(initial?.hasDimensions, false),
        lengthM: toStr(initial?.lengthM),
        widthM: toStr(initial?.widthM),
        heightM: toStr(initial?.heightM),

        priceCurrency: initial?.priceCurrency || "USD",
        priceAmount: toStr(initial?.priceAmount),
        note: toStr(initial?.note),

        loadType: Array.isArray(initial?.loadType)
            ? initial.loadType
            : initial?.loadType
                ? [initial.loadType as any]
                : ["ANY"],

        cargoType: initial?.cargoType || "GENERAL",
        allowPartialLoad: toBool(initial?.allowPartialLoad, false),
        palletsCount: toStr(initial?.palletsCount),

        bargain: initial?.bargain || "ALLOWED",
    };
};

export const buildInitialPoint = (
    point: GeoPoint | undefined,
    type: string
): EditPoint => {
    const country = pickString(
        (point as any)?.country,
        (point as any)?.country_ru,
        (point as any)?.country_uz
    );

    const region = pickString(
        (point as any)?.region,
        (point as any)?.region_ru,
        (point as any)?.region_uz
    );

    const city = pickString(
        (point as any)?.city,
        (point as any)?.city_ru,
        (point as any)?.city_uz
    );

    const displayName = pickString(
        (point as any)?.display_name,
        [city, region, country].filter(Boolean).join(", ")
    );

    const latitude = pickNumber((point as any)?.latitude, (point as any)?.lat);
    const longitude = pickNumber((point as any)?.longitude, (point as any)?.lng, (point as any)?.lon);

    return {
        clientKey: point?.id ?? crypto.randomUUID(),
        id: point?.id,
        type,

        location: displayName
            ? ({
                country: country ?? "",
                region,
                city,
                address: point?.address ?? "",
                display_name: displayName,
                latitude,
                longitude,
                geocode_source: (point as any)?.geocode_source ?? null,
            } as any)
            : null,

        country: country ?? "",
        region,
        city,

        address: point?.address ?? "",
        display_name: displayName,
        latitude,
        longitude,
        geocode_source: (point as any)?.geocode_source ?? null,

        order: (point as any)?.order ?? null,
    };
};

export const buildInitialPoints = (
    kind: Kind,
    initial: InitialData | undefined
) => {
    const types = POINT_TYPES[kind];
    const sorted = [...(initial?.points ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const rawFrom = sorted.filter((p) => p?.type === types.from);
    const rawTo = sorted.filter((p) => p?.type === types.to);

    return {
        fromPoints: rawFrom.length
            ? rawFrom.map((p) => buildInitialPoint(p, types.from))
            : [createEmptyPoint(types.from)],

        toPoints: rawTo.length
            ? rawTo.map((p) => buildInitialPoint(p, types.to))
            : [createEmptyPoint(types.to)],
    };
};