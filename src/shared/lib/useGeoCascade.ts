import { useCallback, useMemo, useRef, useState } from "react";
import { geoImportApi, type GeoImportItem } from "@/shared/api/geoImportApi";

type LoadingState = {
    countries: boolean;
    regionsFor?: string | null;
    citiesFor?: string | null;
};

const sortByName = (a: GeoImportItem, b: GeoImportItem) => a.name.localeCompare(b.name);

const countryKey = (c?: GeoImportItem | null, fallback?: string | null) =>
    c?.iso2 || c?.code || c?.id || fallback || "";
const regionKey = (r?: GeoImportItem | null, fallback?: string | null) =>
    (r as any)?.stateCode || r?.code || r?.id || fallback || "";

export function useGeoCascade() {
    const [countries, setCountries] = useState<GeoImportItem[]>([]);
    const [regions, setRegions] = useState<Record<string, GeoImportItem[]>>({});
    const [cities, setCities] = useState<Record<string, GeoImportItem[]>>({});
    const [loading, setLoading] = useState<LoadingState>({ countries: false, regionsFor: null, citiesFor: null });
    const [error, setError] = useState<string | null>(null);

    const countriesTried = useRef(false);
    const regionsCache = useRef(new Set<string>());
    const citiesCache = useRef(new Set<string>());

    const loadCountries = useCallback(async () => {
        if (countries.length || loading.countries || countriesTried.current) return;
        setLoading((s) => ({ ...s, countries: true }));
        setError(null);
        try {
            const data = await geoImportApi.importCountries();
            setCountries(data.sort(sortByName));
            countriesTried.current = true;
        } catch (e: any) {
            countriesTried.current = false;
            setError(e?.response?.data?.message || e?.message || "Failed to load countries");
        } finally {
            setLoading((s) => ({ ...s, countries: false }));
        }
    }, [countries.length, loading.countries]);

    const loadRegions = useCallback(
        async (countryIdOrCode?: string | null) => {
            const key = countryIdOrCode || "";
            if (!key || regionsCache.current.has(key)) return;
            regionsCache.current.add(key);
            setLoading((s) => ({ ...s, regionsFor: key }));
            setError(null);
            try {
                const data = await geoImportApi.importStates(key);
                setRegions((prev) => ({ ...prev, [key]: data.sort(sortByName) }));
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load regions");
                regionsCache.current.delete(key);
            } finally {
                setLoading((s) => ({ ...s, regionsFor: null }));
            }
        },
        []
    );

    const loadCities = useCallback(
        async (countryIdOrCode?: string | null, stateIdOrCode?: string | null) => {
            const cKey = countryIdOrCode || "";
            const rKey = stateIdOrCode || "";
            const key = `${cKey}/${rKey}`;
            if (!cKey || !rKey || citiesCache.current.has(key)) return;
            citiesCache.current.add(key);
            setLoading((s) => ({ ...s, citiesFor: key }));
            setError(null);
            try {
                const data = await geoImportApi.importCities(cKey, rKey);
                setCities((prev) => ({ ...prev, [key]: data.sort(sortByName) }));
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load cities");
                citiesCache.current.delete(key);
            } finally {
                setLoading((s) => ({ ...s, citiesFor: null }));
            }
        },
        []
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

    const ensureRegions = useCallback(
        (countryId?: string | null) => {
            if (!countryId) return;
            const c = countryIndex.get(countryId);
            const key = countryKey(c, countryId);
            if (key && !regions[key]) void loadRegions(key);
        },
        [countryIndex, loadRegions, regions]
    );

    const ensureCities = useCallback(
        (countryId?: string | null, regionId?: string | null) => {
            if (!countryId || !regionId) return;
            const c = countryIndex.get(countryId);
            const r = regionIndex.get(regionId);
            const cKey = countryKey(c, countryId);
            const rKey = regionKey(r, regionId);
            const mapKey = `${cKey}/${rKey}`;
            if (cKey && rKey && !cities[mapKey]) void loadCities(cKey, rKey);
        },
        [cities, countryIndex, loadCities, regionIndex]
    );

    const getRegions = useCallback(
        (countryId?: string | null) => {
            if (!countryId) return [];
            const c = countryIndex.get(countryId);
            const key = countryKey(c, countryId);
            return regions[key] || [];
        },
        [countryIndex, regions]
    );

    const getCities = useCallback(
        (countryId?: string | null, regionId?: string | null) => {
            if (!countryId || !regionId) return [];
            const c = countryIndex.get(countryId);
            const r = regionIndex.get(regionId);
            const cKey = countryKey(c, countryId);
            const rKey = regionKey(r, regionId);
            const key = `${cKey}/${rKey}`;
            return cities[key] || [];
        },
        [cities, countryIndex, regionIndex]
    );

    const findById = useCallback(
        (id?: string | null) => id ? countryIndex.get(id) || regionIndex.get(id) || cityIndex.get(id) : undefined,
        [cityIndex, countryIndex, regionIndex]
    );

    return {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
        loading,
        error,
        findById,
        countryKey: (id?: string | null) => {
            const c = id ? countryIndex.get(id) : null;
            return countryKey(c, id);
        },
        regionKey: (id?: string | null) => {
            const r = id ? regionIndex.get(id) : null;
            return regionKey(r, id);
        },
    };
}
