import type { PlacementOption } from "./placementOptions";
import { AVAILABLE_AD_PLACEMENTS } from "./placementOptions";

export function getUniquePages() {
    const map = new Map<string, string>();

    AVAILABLE_AD_PLACEMENTS.forEach((item) => {
        map.set(item.page, item.pageLabel);
    });

    return Array.from(map.entries()).map(([value, label]) => ({
        value,
        label,
    }));
}

export function getPlacementsByPage(page: string): PlacementOption[] {
    return AVAILABLE_AD_PLACEMENTS.filter((item) => item.page === page);
}

export function findPlacementOption(page: string, placementKey: string) {
    return AVAILABLE_AD_PLACEMENTS.find(
        (item) => item.page === page && item.placementKey === placementKey,
    );
}