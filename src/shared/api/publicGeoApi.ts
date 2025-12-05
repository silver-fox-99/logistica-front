import api from "@/shared/api/axios";
import type { GeoImportItem } from "./geoImportApi";

const toImportItem = (row: any): GeoImportItem => ({
    id: String(row.id),
    name: row.name || "",
    name_ru: row.name_ru ?? null,
    name_uz: row.name_uz ?? null,
    parent_id: row.parent_id ?? null,
    code: row.code ?? null,
    iso2: row.iso2 ?? row.code ?? row.slug ?? null,
    stateCode: row.stateCode ?? row.code ?? null,
    countryCode: row.countryCode ?? null,
    type: row.type ?? null,
});

export const publicGeoApi = {
    listCountries: async (): Promise<GeoImportItem[]> => {
        const res = await api.get("/geo-location/public/list-countries");
        const data = Array.isArray(res?.data?.data) ? res.data.data : res.data || [];
        return data.map((row: any) => toImportItem({ ...row, type: row.type ?? "COUNTRY" }));
    },
    listRegions: async (countryId: string): Promise<GeoImportItem[]> => {
        const res = await api.get(`/geo-location/public/list-regions/${countryId}`);
        const data = Array.isArray(res?.data?.data) ? res.data.data : res.data || [];
        return data.map((row: any) =>
            toImportItem({
                ...row,
                parent_id: row.parent_id ?? countryId,
                countryCode: row.countryCode ?? row.iso2 ?? row.parent_iso2 ?? row.parentCode ?? null,
                stateCode: row.stateCode ?? row.code ?? row.slug ?? null,
                type: row.type ?? "REGION",
            })
        );
    },
    listCities: async (regionId: string): Promise<GeoImportItem[]> => {
        const res = await api.get(`/geo-location/public/list-cities/${regionId}`);
        const data = Array.isArray(res?.data?.data) ? res.data.data : res.data || [];
        return data.map((row: any) =>
            toImportItem({
                ...row,
                parent_id: row.parent_id ?? regionId,
                countryCode: row.countryCode ?? row.iso2 ?? row.parent_iso2 ?? row.parentCode ?? null,
                stateCode: row.stateCode ?? row.code ?? row.slug ?? null,
                type: row.type ?? "CITY",
            })
        );
    },
};
