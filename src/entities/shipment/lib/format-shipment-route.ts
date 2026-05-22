import type { GeoPoint } from "@/entities/shipment/model/type";

type Lang = string | undefined;

export function formatShipmentRoute(point?: GeoPoint, lang?: Lang, withAddress = false) {
    if (!point) return "—";

   // if (point.display_name) return point.display_name;

    const normalizeLang = lang || "uz";

    const getLocalized = (
        base?: string | null,
        ru?: string | null,
        uz?: string | null,
    ) => {
        if (!base) return null;
        if (normalizeLang === "ru" && ru) return ru;
        if (normalizeLang === "uz" && uz) return uz;
        return base;
    };

    const parts: string[] = [];

    const country = getLocalized(point.country, point.country_ru, point.country_uz);
    const region = getLocalized(point.region, point.region_ru, point.region_uz);
    const city = getLocalized(point.city, point.city_ru, point.city_uz);

    if (country) parts.push(country);
    if (region) parts.push(region);
    if (city) parts.push(city);
    if (withAddress && point.address) parts.push(point.address);

    return parts.length ? parts.join(", ") : "—";
}