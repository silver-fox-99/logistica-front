import api from "@/shared/api/axios";
import type {
    AutoBumpTargetType,
    ListingAutoBump,
    ListingAutoBumpResponse,
    UpsertListingAutoBumpDto,
} from "@/entities/listing-auto-bump/model/types";

export async function getListingAutoBump(
    targetType: AutoBumpTargetType,
    targetId: string
) {
    const { data } = await api.get<ListingAutoBumpResponse<ListingAutoBump | null>>(
        `/listing-auto-bumps/${targetType}/${targetId}`
    );

    return data;
}

export async function upsertListingAutoBump(dto: UpsertListingAutoBumpDto) {
    const { data } = await api.post<ListingAutoBumpResponse<ListingAutoBump>>(
        `/listing-auto-bumps`,
        dto
    );

    return data;
}

export async function deleteListingAutoBump(
    targetType: AutoBumpTargetType,
    targetId: string
) {
    const { data } = await api.delete<
        ListingAutoBumpResponse<{ deleted: number }>
    >(`/listing-auto-bumps/${targetType}/${targetId}`);

    return data;
}

export async function toggleListingAutoBump(
    targetType: AutoBumpTargetType,
    targetId: string
) {
    const { data } = await api.patch<ListingAutoBumpResponse<ListingAutoBump>>(
        `/listing-auto-bumps/${targetType}/${targetId}/toggle`
    );

    return data;
}