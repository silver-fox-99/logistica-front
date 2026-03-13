import type { GeoPoint } from "@/entities/shipment/model/type";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import type { EditPoint, FormState, InitialData, Kind } from "./types";
import { POINT_TYPES } from "./types";

export const createEmptyPoint = (type: string): EditPoint => ({
    clientKey: crypto.randomUUID(),
    type,
    countryId: "",
    regionId: "",
    cityId: "",
    address: "",
    rawCountryName: null,
    rawRegionName: null,
    rawCityName: null,
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

    // уже нормальная date-only строка
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return s;
    }

    // dd.mm.yyyy
    const dotMatch = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dotMatch) {
        return `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
    }

    // ISO datetime -> локальная дата
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

export const normalizeText = (v?: string | null) =>
    (v || "").trim().toLowerCase();

export const eqLoose = (a?: string | null, b?: string | null) => {
    const A = normalizeText(a);
    const B = normalizeText(b);

    if (!A || !B) return false;

    return A === B || A.startsWith(B) || B.startsWith(A) || A.includes(B) || B.includes(A);
};

export const collectPointNames = (
    point?: Partial<GeoPoint> | null,
    baseKey?: "country" | "region" | "city"
) => {
    if (!point || !baseKey) return [];

    const keys = [baseKey, `${baseKey}_ru`, `${baseKey}_uz`] as const;

    const values = keys
        .map((key) => (point as any)?.[key])
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

    return Array.from(new Set(values));
};

export const findGeoIdLoose = (items: GeoImportItem[], names: string[]) => {
    if (!items.length || !names.length) return "";

    const hit = items.find((item) => {
        const candidates = [item.name, item.name_ru, item.name_uz].filter(
            (v): v is string => typeof v === "string" && v.trim().length > 0
        );

        return names.some((needle) =>
            candidates.some((candidate) => eqLoose(candidate, needle))
        );
    });

    return hit?.id ?? "";
};

export const hasMeaningfulRegion = (p: EditPoint) => !!normalizeText(p.rawRegionName);
export const hasMeaningfulCity = (p: EditPoint) => !!normalizeText(p.rawCityName);

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
    type: string,
    countries: GeoImportItem[]
): EditPoint => {
    const countryNames = collectPointNames(point, "country");
    const regionNames = collectPointNames(point, "region");
    const cityNames = collectPointNames(point, "city");

    const countryId = findGeoIdLoose(countries, countryNames);

    return {
        clientKey: point?.id ?? crypto.randomUUID(),
        id: point?.id,
        type,
        countryId,
        regionId: "",
        cityId: "",
        address: point?.address ?? "",
        rawCountryName: countryNames[0] ?? null,
        rawRegionName: regionNames[0] ?? null,
        rawCityName: cityNames[0] ?? null,
    };
};

export const buildInitialPoints = (
    kind: Kind,
    initial: InitialData | undefined,
    countries: GeoImportItem[]
) => {
    const types = POINT_TYPES[kind];
    const sorted = [...(initial?.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const rawFrom = sorted.filter((p) => p?.type === types.from);
    const rawTo = sorted.filter((p) => p?.type === types.to);

    return {
        fromPoints: rawFrom.length
            ? rawFrom.map((p) => buildInitialPoint(p, types.from, countries))
            : [createEmptyPoint(types.from)],
        toPoints: rawTo.length
            ? rawTo.map((p) => buildInitialPoint(p, types.to, countries))
            : [createEmptyPoint(types.to)],
    };
};