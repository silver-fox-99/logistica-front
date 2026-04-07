import api from "@/shared/api/axios";
import type {
    AdPlacement,
    AdPlacementsListQuery,
    AdPlacementsListResponse,
    CreateAdBannerPayload,
    CreateAdPlacementPayload,
    ReorderAdBannersPayload,
    UpdateAdBannerPayload,
    UpdateAdPlacementPayload,
    AdBanner,
} from "@/entities/ads/model/types";

type ApiResponse<T> = {
    status: boolean;
    data: T;
    message: string;
    user_id?: string;
};

export const adminAdsApi = {
    listPlacements(params: AdPlacementsListQuery) {
        return api.get<ApiResponse<AdPlacementsListResponse>>("/admin/ads/placements", {
            params,
        });
    },

    getPlacement(id: string) {
        return api.get<ApiResponse<AdPlacement>>(`/admin/ads/placements/${id}`);
    },

    createPlacement(data: CreateAdPlacementPayload) {
        return api.post<ApiResponse<AdPlacement>>("/admin/ads/placements", data);
    },

    updatePlacement(id: string, data: UpdateAdPlacementPayload) {
        return api.patch<ApiResponse<AdPlacement>>(`/admin/ads/placements/${id}`, data);
    },

    deletePlacement(id: string) {
        return api.delete<ApiResponse<{ id: string }>>(`/admin/ads/placements/${id}`);
    },

    createBanner(placementId: string, data: CreateAdBannerPayload) {
        return api.post<ApiResponse<AdBanner>>(
            `/admin/ads/placements/${placementId}/banners`,
            data,
        );
    },

    updateBanner(
        placementId: string,
        bannerId: string,
        data: UpdateAdBannerPayload,
    ) {
        return api.patch<ApiResponse<AdBanner>>(
            `/admin/ads/placements/${placementId}/banners/${bannerId}`,
            data,
        );
    },

    deleteBanner(placementId: string, bannerId: string) {
        return api.delete<ApiResponse<{ id: string }>>(
            `/admin/ads/placements/${placementId}/banners/${bannerId}`,
        );
    },

    reorderBanners(placementId: string, data: ReorderAdBannersPayload) {
        return api.patch<ApiResponse<AdBanner[]>>(
            `/admin/ads/placements/${placementId}/banners/reorder`,
            data,
        );
    },
};