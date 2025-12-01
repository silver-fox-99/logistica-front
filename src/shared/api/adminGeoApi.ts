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
    order?: number;
    name_ru?: string;
    name_uz?: string;
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
    name_ru?: string | null;
    name_uz?: string | null;
    parent_id?: string;
    code?: string;
    iso2?: string;
    slug?: string;
    order?: number;
};

export type UpdateLocationDto = Partial<{
    type: LocationType;
    name: string;
    name_ru: string | null;
    name_uz: string | null;
    parent_id: string | null;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    is_active: boolean;
    order: number;
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
    datasetCountries: async () => {
        const res = await api.get("/geo-location/dataset/countries");
        return res.data.data as { iso2: string; name: string; region?: string; subregion?: string }[];
    },

    datasetStates: async (countryCode: string) => {
        const res = await api.get(`/geo-location/dataset/${countryCode}/states`);
        return res.data.data as { countryCode: string; stateCode: string; name: string; type: string | null }[];
    },

    datasetCities: async (countryCode: string, stateCode: string) => {
        const res = await api.get(`/geo-location/dataset/${countryCode}/states/${stateCode}/cities`);
        return res.data.data as { countryCode: string; stateCode: string; name: string; latitude?: string; longitude?: string }[];
    },

    importCountries: async () => {
        const res = await api.post("/geo-location/import/countries", {});
        return res.data;
    },

    importStates: async (countryCode: string, parentId: string) => {
        const res = await api.post(`/geo-location/import/${countryCode}/states`, { parentId });
        return res.data;
    },

    importCities: async (countryCode: string, stateCode: string, parentId: string) => {
        const res = await api.post(
            `/geo-location/import/${countryCode}/states/${stateCode}/cities`,
            { parentId },
        );
        return res.data;
    },
};
