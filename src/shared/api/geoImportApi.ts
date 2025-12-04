import api from "@/shared/api/axios";

export type GeoImportItem = {
    id: string;
    name: string;
    name_ru?: string | null;
    name_uz?: string | null;
    parent_id?: string | null;
    code?: string | null;
    iso2?: string | null;
    stateCode?: string | null;
    countryCode?: string | null;
    type?: string | null;
};

const normalizeRow = (row: Record<string, any>): GeoImportItem => {
    const baseId = row.id ?? row.stateCode ?? row.code ?? row.iso2 ?? row.slug ?? row.name ?? "unknown";
    const name = row.name ?? row.name_ru ?? row.name_uz ?? String(baseId);
    return {
        id: String(baseId),
        name: String(name),
        name_ru: row.name_ru ?? null,
        name_uz: row.name_uz ?? null,
        parent_id: row.parent_id ?? null,
        code: row.code ?? null,
        iso2: row.iso2 ?? null,
        stateCode: row.stateCode ?? null,
        countryCode: row.countryCode ?? null,
        type: row.type ?? null,
    };
};

function takeData<T extends Record<string, any>>(res: any): T[] {
    if (Array.isArray(res?.data?.data)) return res.data.data as T[];
    if (Array.isArray(res?.data)) return res.data as T[];
    if (Array.isArray(res)) return res as T[];
    return [];
}

export const geoImportApi = {
    async importCountries(): Promise<GeoImportItem[]> {
        let res;
        try {
            res = await api.get("/geo-location/dataset/countries");
        } catch {
            res = await api.post("/geo-location/import/countries", {});
        }
        return takeData<Record<string, any>>(res).map(normalizeRow);
    },
    async importStates(countryCode: string): Promise<GeoImportItem[]> {
        let res;
        try {
            res = await api.get(`/geo-location/dataset/${countryCode}/states`);
        } catch {
            res = await api.post(`/geo-location/import/${countryCode}/states`, {});
        }
        return takeData<Record<string, any>>(res).map(normalizeRow).map((r) => ({
            ...r,
            countryCode: r.countryCode || countryCode,
            stateCode: r.stateCode || r.code || r.id,
            parent_id: r.parent_id ?? null,
        }));
    },
    async importCities(countryCode: string, stateCode: string): Promise<GeoImportItem[]> {
        let res;
        try {
            res = await api.get(`/geo-location/dataset/${countryCode}/states/${stateCode}/cities`);
        } catch {
            res = await api.post(`/geo-location/import/${countryCode}/states/${stateCode}/cities`, { parentId: undefined });
        }
        return takeData<Record<string, any>>(res).map(normalizeRow).map((r) => ({
            ...r,
            countryCode: r.countryCode || countryCode,
            stateCode: r.stateCode || stateCode,
            parent_id: r.parent_id ?? null,
        }));
    },
};
