import { useCallback, useMemo, useRef, useState } from "react";
import { publicGeoApi } from "@/shared/api/publicGeoApi";
import { adminGeoApi, type GeoLocation } from "@/shared/api/adminGeoApi";
import type { GeoImportItem } from "@/shared/api/geoImportApi";

type LoadingState = {
    countries: boolean;
    regionsFor?: string | null;
    citiesFor?: string | null;
};

const sortByName = (a: GeoImportItem, b: GeoImportItem) => a.name.localeCompare(b.name);

const preferLocalized = (prev: GeoImportItem, next: GeoImportItem) => {
    const hasRu = (v?: string | null) => v && v.trim().length > 0;
    const hasUz = (v?: string | null) => v && v.trim().length > 0;
    if (!hasRu(prev.name_ru) && hasRu(next.name_ru)) prev = { ...prev, name_ru: next.name_ru };
    if (!hasUz(prev.name_uz) && hasUz(next.name_uz)) prev = { ...prev, name_uz: next.name_uz };
    if (!prev.name && next.name) prev = { ...prev, name: next.name };
    return prev;
};

const dedupCountries = (items: GeoImportItem[]) => {
    const map = new Map<string, GeoImportItem>();
    items.forEach((item) => {
        const key = (item.iso2 || item.code || item.name || item.id).toLowerCase();
        if (!map.has(key)) {
            map.set(key, item);
        } else {
            map.set(key, preferLocalized(map.get(key)!, item));
        }
    });
    return Array.from(map.values());
};

const dedupRegions = (items: GeoImportItem[]) => {
    const map = new Map<string, GeoImportItem>();
    items.forEach((item) => {
        const countryKey = (item.countryCode || item.parent_id || "").toLowerCase();
        const codeKey = (item.stateCode || item.code || item.name || item.id).toLowerCase();
        const key = `${countryKey}|${codeKey}`;
        if (!map.has(key)) {
            map.set(key, item);
        } else {
            map.set(key, preferLocalized(map.get(key)!, item));
        }
    });
    return Array.from(map.values());
};

const dedupCities = (items: GeoImportItem[]) => {
    const map = new Map<string, GeoImportItem>();
    items.forEach((item) => {
        const countryKey = (item.countryCode || item.parent_id || "").toLowerCase();
        const regionKey = (item.stateCode || item.code || "").toLowerCase();
        const cityKey = (item.name || item.id).toLowerCase();
        const key = `${countryKey}|${regionKey}|${cityKey}`;
        if (!map.has(key)) {
            map.set(key, item);
        } else {
            map.set(key, preferLocalized(map.get(key)!, item));
        }
    });
    return Array.from(map.values());
};

type AdminGeoIndex = {
    mapById: Map<string, GeoLocation>;
    countriesByIso: Map<string, GeoLocation>;
    countriesByName: Map<string, GeoLocation[]>;
    regionsByKey: Map<string, GeoLocation>;
    citiesByKey: Map<string, GeoLocation>;
    regionsByName: Map<string, GeoLocation[]>;
    citiesByName: Map<string, GeoLocation[]>;
};

const buildAdminIndexes = (list: GeoLocation[]): AdminGeoIndex => {
    const mapById = new Map<string, GeoLocation>(list.map((g) => [g.id, g]));
    const countriesByIso = new Map<string, GeoLocation>();
    const countriesByName = new Map<string, GeoLocation[]>();
    const regionsByKey = new Map<string, GeoLocation>();
    const citiesByKey = new Map<string, GeoLocation>();
    const regionsByName = new Map<string, GeoLocation[]>();
    const citiesByName = new Map<string, GeoLocation[]>();

    const findCountryIso = (id?: string | null) => {
        let current = id ? mapById.get(id) : undefined;
        let guard = 0;
        while (current && guard < 6) {
            if (current.type === "COUNTRY") return (current.iso2 || "").toUpperCase();
            current = current.parent_id ? mapById.get(current.parent_id) : undefined;
            guard += 1;
        }
        return "";
    };

    list.forEach((g) => {
        if (g.type === "COUNTRY" && g.iso2) {
            countriesByIso.set(g.iso2.toUpperCase(), g);
        }
        if (g.type === "COUNTRY" && g.name) {
            const key = g.name.trim().toLowerCase();
            const bucket = countriesByName.get(key) || [];
            bucket.push(g);
            countriesByName.set(key, bucket);
        }
    });

    list.forEach((g) => {
        if (g.type === "REGION") {
            const countryIso = findCountryIso(g.parent_id);
            const code = (g.code || g.slug || g.name || g.id).toLowerCase();
            const key = `${countryIso}|${code}`;
            if (countryIso && code) regionsByKey.set(key, g);
            if (countryIso && g.name) {
                const bucket = regionsByName.get(countryIso) || [];
                bucket.push(g);
                regionsByName.set(countryIso, bucket);
            }
        }
        if (g.type === "CITY") {
            const region = g.parent_id ? mapById.get(g.parent_id) : undefined;
            const countryIso = findCountryIso(region?.id ?? g.parent_id);
            const regionCode = (region?.code || region?.slug || "").toLowerCase();
            const cityCode = (g.code || g.slug || g.name || g.id).toLowerCase();
            const key = `${countryIso}|${regionCode}|${cityCode}`;
            if (countryIso && regionCode && cityCode) citiesByKey.set(key, g);
            if (countryIso && g.name) {
                const bucket = citiesByName.get(countryIso) || [];
                bucket.push(g);
                citiesByName.set(countryIso, bucket);
            }
        }
    });

    return { mapById, countriesByIso, countriesByName, regionsByKey, citiesByKey, regionsByName, citiesByName };
};

export function useGeoCascade() {
    const [countries, setCountries] = useState<GeoImportItem[]>([]);
    const [regions, setRegions] = useState<Record<string, GeoImportItem[]>>({});
    const [cities, setCities] = useState<Record<string, GeoImportItem[]>>({});
    const [loading, setLoading] = useState<LoadingState>({ countries: false, regionsFor: null, citiesFor: null });
    const [error, setError] = useState<string | null>(null);

    const countriesTried = useRef(false);
    const regionsCache = useRef(new Set<string>());
    const citiesCache = useRef(new Set<string>());
    const adminGeoMapRef = useRef<Map<string, GeoLocation> | null>(null);
    const adminGeoIndexRef = useRef<AdminGeoIndex | null>(null);

    const ensureAdminGeoMap = useCallback(async () => {
        if (adminGeoMapRef.current) return;
        try {
            const list = await adminGeoApi.list();
            adminGeoMapRef.current = new Map(list.map((g) => [g.id, g]));
            adminGeoIndexRef.current = buildAdminIndexes(list);
        } catch {
            adminGeoMapRef.current = null;
            adminGeoIndexRef.current = null;
        }
    }, []);

    const enrich = useCallback((items: GeoImportItem[]) => {
        const map = adminGeoMapRef.current;
        const index = adminGeoIndexRef.current;
        if (!map || !index) return items;
        const eq = (a?: string | null, b?: string | null) => {
            if (!a || !b) return false;
            return a.trim().toLowerCase() === b.trim().toLowerCase();
        };
        return items.map((it) => {
            const iso = it.countryCode?.toUpperCase() || it.iso2?.toUpperCase() || "";
            const regionCode = (it.stateCode || it.code || "").toLowerCase();
            const cityKey = (it.name || it.id).toLowerCase();

            let g = map.get(it.id);
            if (!g && it.iso2) g = index.countriesByIso.get(it.iso2.toUpperCase());
            if (!g && iso && it.type === "REGION") g = index.regionsByKey.get(`${iso}|${regionCode}`);
            if (!g && iso && it.type === "CITY") g = index.citiesByKey.get(`${iso}|${regionCode}|${cityKey}`);
            if (!g && iso && !it.type) {
                g = index.regionsByKey.get(`${iso}|${regionCode}`) ?? index.citiesByKey.get(`${iso}|${regionCode}|${cityKey}`);
            }
            if (!g && it.type === "COUNTRY" && it.name) {
                const bucket = index.countriesByName.get(it.name.trim().toLowerCase()) || [];
                g = bucket.find((c) => eq(c.name, it.name));
            }
            if (!g && iso && it.type === "REGION") {
                const bucket = index.regionsByName.get(iso) || [];
                g = bucket.find((r) => eq(r.name, it.name));
            }
            if (!g && iso && it.type === "CITY") {
                const bucket = index.citiesByName.get(iso) || [];
                g = bucket.find((c) => eq(c.name, it.name));
            }
            if (!g) return it;
            return {
                ...it,
                name: g.name || it.name,
                name_ru: g.name_ru ?? it.name_ru ?? null,
                name_uz: g.name_uz ?? it.name_uz ?? null,
            };
        });
    }, []);

    const loadCountries = useCallback(async () => {
        if (countries.length || loading.countries || countriesTried.current) return;
        setLoading((s) => ({ ...s, countries: true }));
        setError(null);
        try {
            await ensureAdminGeoMap();
            const data = await publicGeoApi.listCountries();
            const normalized = dedupCountries(data);
            const enriched = enrich(normalized);
            const deduped = dedupCountries(enriched);
            setCountries(deduped.sort(sortByName));
            countriesTried.current = true;
        } catch (e: any) {
            countriesTried.current = false;
            setError(e?.response?.data?.message || e?.message || "Failed to load countries");
        } finally {
            setLoading((s) => ({ ...s, countries: false }));
        }
    }, [countries.length, ensureAdminGeoMap, enrich, loading.countries]);

    const loadRegions = useCallback(
        async (countryId?: string | null) => {
            const key = countryId || "";
            if (!key || regionsCache.current.has(key)) return;
            regionsCache.current.add(key);
            setLoading((s) => ({ ...s, regionsFor: key }));
            setError(null);
            try {
                await ensureAdminGeoMap();
                const data = await publicGeoApi.listRegions(key);
                const normalized = dedupRegions(data);
                const enriched = enrich(normalized);
                setRegions((prev) => ({ ...prev, [key]: dedupRegions(enriched).sort(sortByName) }));
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load regions");
                regionsCache.current.delete(key);
            } finally {
                setLoading((s) => ({ ...s, regionsFor: null }));
            }
        },
        [ensureAdminGeoMap, enrich]
    );

    const loadCities = useCallback(
        async (countryId?: string | null, regionId?: string | null) => {
            const cId = countryId || "";
            const rId = regionId || "";
            const key = `${cId}/${rId}`;
            if (!cId || !rId || citiesCache.current.has(key)) return;
            citiesCache.current.add(key);
            setLoading((s) => ({ ...s, citiesFor: key }));
            setError(null);
            try {
                await ensureAdminGeoMap();
                const data = await publicGeoApi.listCities(rId);
                const normalized = dedupCities(data);
                const enriched = enrich(normalized);
                setCities((prev) => ({ ...prev, [key]: dedupCities(enriched).sort(sortByName) }));
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load cities");
                citiesCache.current.delete(key);
            } finally {
                setLoading((s) => ({ ...s, citiesFor: null }));
            }
        },
        [ensureAdminGeoMap, enrich]
    );

    const getRegions = useCallback(
        (countryId?: string | null) => {
            if (!countryId) return [];
            return regions[countryId] || [];
        },
        [regions]
    );

    const getCities = useCallback(
        (countryId?: string | null, regionId?: string | null) => {
            if (!countryId || !regionId) return [];
            const key = `${countryId}/${regionId}`;
            return cities[key] || [];
        },
        [cities]
    );

    const countryIndex = useMemo(() => new Map(countries.map((c) => [c.id, c])), [countries]);
    const regionIndex = useMemo(() => {
        const entries: [string, GeoImportItem][] = [];
        Object.values(regions).forEach((arr) => arr.forEach((r) => entries.push([r.id, r])));
        return new Map(entries);
    }, [regions]);
    const cityIndex = useMemo(() => {
        const entries: [string, GeoImportItem][] = [];
        Object.values(cities).forEach((arr) => arr.forEach((c) => entries.push([c.id, c])));
        return new Map(entries);
    }, [cities]);

    const findById = useCallback(
        (id?: string | null) => (id ? countryIndex.get(id) || regionIndex.get(id) || cityIndex.get(id) : undefined),
        [cityIndex, countryIndex, regionIndex]
    );

    return {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions: loadRegions,
        ensureCities: loadCities,
        loading,
        error,
        findById,
        countryKey: (id?: string | null) => id || "",
        regionKey: (id?: string | null) => id || "",
    };
}
