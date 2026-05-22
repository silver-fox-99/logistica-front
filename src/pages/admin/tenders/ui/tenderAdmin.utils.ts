import type { Tender } from "@/entities/tender/model/types";

export const LIMIT = 20;

export const pointLabel = (point?: Tender["points"][number]) => {
    return point?.city || point?.region || point?.country || "-";
};

export function routeLabel(tender: Tender) {
    const pickups = tender.points?.filter(point => point.type === "PICKUP") ?? [];
    const dropoffs = tender.points?.filter(point => point.type === "DROPOFF") ?? [];

    return `${pointLabel(pickups[0])} -> ${pointLabel(dropoffs[dropoffs.length - 1])}`;
}

export function formatDate(value?: string | null, language = "en", empty = "-") {
    if (!value) return empty;

    return new Date(value).toLocaleString(language, {
        dateStyle: "short",
        timeStyle: "short",
        hour12: false,
    });
}