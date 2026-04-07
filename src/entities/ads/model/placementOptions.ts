export type PlacementOption = {
    page: string;
    pageLabel: string;
    placementKey: string;
    placementLabel: string;
    defaultTitle: string;
    defaultRotationEnabled: boolean;
    defaultRotationIntervalSec: number;
};

export const AVAILABLE_AD_PLACEMENTS: PlacementOption[] = [
    {
        page: "/dashboard/search",
        pageLabel: "Поиск в дашборде",
        placementKey: "top-list",
        placementLabel: "Блок над списком",
        defaultTitle: "Баннер над результатами поиска",
        defaultRotationEnabled: false,
        defaultRotationIntervalSec: 5,
    },
];