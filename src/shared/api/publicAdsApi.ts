import api from "@/shared/api/axios";
import type { AdPlacement } from "@/entities/ads/model/types";

type ResolveAdPlacementParams = {
    page: string;
    placement_key: string;
};

type ApiResponse<T> = {
    status: boolean;
    data: T;
    message: string;
};

export const publicAdsApi = {
    resolvePlacement(params: ResolveAdPlacementParams) {
        return api.get<ApiResponse<AdPlacement>>("/ads/resolve", {
            params,
        });
    },
};