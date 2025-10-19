import api from "@/shared/api/axios";

export type LocationType = "COUNTRY" | "REGION" | "CITY" | "DISTRICT" | "OTHER";

export type GeoLocation = {
    id: string;
    type: LocationType;
    name: string;
    parent_id?: string | null;
    code?: string | null;
    iso2?: string | null;
    slug?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};

export type GeoListResponse = {
    status: boolean;
    data: GeoLocation[];
    message?: string;
};

export type CreateLocationDto = {
    type: LocationType;
    name: string;
    parent_id?: string;
    code?: string;
    iso2?: string; // только для стран (2 буквы)
    slug?: string;
};

export type UpdateLocationDto = Partial<{
    type: LocationType;
    name: string;
    parent_id: string | null;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    is_active: boolean;
}>;

const BASE = "/geo-location";

export const adminGeoApi = {
    list: async () => {
        const { data } = await api.get<GeoListResponse>(BASE);
        return data.data;
    },
    create: async (dto: CreateLocationDto) => {
        const { data } = await api.post(`${BASE}`, dto);
        return data.data as GeoLocation;
    },
    update: async (id: string, dto: UpdateLocationDto) => {
        const { data } = await api.patch(`${BASE}/${id}`, dto);
        return data.data as GeoLocation;
    },
    remove: async (id: string) => {
        const { data } = await api.delete(`${BASE}/${id}`);
        return data.data as { id: string };
    },
};
