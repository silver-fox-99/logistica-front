import { useCallback, useMemo, useRef, useState } from "react";
import { geoImportApi, type GeoImportItem } from "@/shared/api/geoImportApi";
import { adminGeoApi, type GeoLocation } from "@/shared/api/adminGeoApi";

type LoadingState = {
    countries: boolean;
    regionsFor?: string | null;
    citiesFor?: string | null;
};

const sortByName = (a: GeoImportItem, b: GeoImportItem) => a.name.localeCompare(b.name);

const toLower = (v?: string | null) => (v ? v.toLowerCase() : "");

const dedupById = (items: GeoImportItem[]) => {
    const map = new Map<string, GeoImportItem>();
    items.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
};

type GeoIndex = {
    countriesByIso: Map<string, GeoLocation>;
    countriesByCode: Map<string, GeoLocation>;
    countriesByName: Map<string, GeoLocation>;
    regionsByParent: Map<string, GeoLocation[]>;
    regionsByParentCode: Map<string, GeoLocation[]>;
    regionsByCode: Map<string, GeoLocation>;
    regionsBySlug: Map<string, GeoLocation>;
    citiesByParent: Map<string, GeoLocation[]>;
    citiesByName: Map<string, GeoLocation>;
};

function buildGeoIndex(list: GeoLocation[]): GeoIndex {
    const countriesByIso = new Map<string, GeoLocation>();
    const countriesByCode = new Map<string, GeoLocation>();
    const countriesByName = new Map<string, GeoLocation>();
    const regionsByParent = new Map<string, GeoLocation[]>();
    const regionsByParentCode = new Map<string, GeoLocation[]>();
    const regionsByCode = new Map<string, GeoLocation>();
    const regionsBySlug = new Map<string, GeoLocation>();
    const citiesByParent = new Map<string, GeoLocation[]>();
    const citiesByName = new Map<string, GeoLocation>();

    list.forEach((g) => {
        const iso = toLower(g.iso2);
        const code = toLower(g.code);
        const slug = toLower(g.slug);
        const name = toLower(g.name);
        if (g.type === "COUNTRY") {
            if (iso) countriesByIso.set(iso, g);
            if (code) countriesByCode.set(code, g);
            if (name) countriesByName.set(name, g);
        } else if (g.type === "REGION" && g.parent_id) {
            const arr = regionsByParent.get(g.parent_id) || [];
            arr.push(g);
            regionsByParent.set(g.parent_id, arr);
            if (code) {
                const arr2 = regionsByParentCode.get(`${g.parent_id}:${code}`) || [];
                arr2.push(g);
                regionsByParentCode.set(`${g.parent_id}:${code}`, arr2);
            }
            if (code) regionsByCode.set(code, g);
            if (slug) regionsBySlug.set(slug, g);
        } else if (g.type === "REGION") {
            if (code) regionsByCode.set(code, g);
            if (slug) regionsBySlug.set(slug, g);
        } else if ((g.type === "CITY" || g.type === "DISTRICT") && g.parent_id) {
            const arr = citiesByParent.get(g.parent_id) || [];
            arr.push(g);
            citiesByParent.set(g.parent_id, arr);
            const nm = toLower(g.name);
            if (nm) citiesByName.set(nm, g);
            if (slug) citiesByName.set(slug, g);
            if (code) citiesByName.set(code, g);
        } else if (g.type === "CITY" || g.type === "DISTRICT") {
            const nm = toLower(g.name);
            if (nm) citiesByName.set(nm, g);
            if (slug) citiesByName.set(slug, g);
            if (code) citiesByName.set(code, g);
        }
    });

    return {
        countriesByIso,
        countriesByCode,
        countriesByName,
        regionsByParent,
        regionsByParentCode,
        regionsByCode,
        regionsBySlug,
        citiesByParent,
        citiesByName,
    };
}

function matchCountryGeo(idx: GeoIndex | null, code?: string | null) {
    if (!idx) return null;
    if (code) {
        const c = toLower(code);
        const byCode = idx.countriesByIso.get(c) || idx.countriesByCode.get(c);
        if (byCode) return byCode;
    }
    return null;
}

function matchRegionGeo(idx: GeoIndex | null, countryId?: string | null, stateCode?: string | null, name?: string | null) {
    if (!idx || !countryId) return null;
    const sc = toLower(stateCode);
    const nm = toLower(name);
    const direct =
        (sc && idx.regionsByParentCode.get(`${countryId}:${sc}`)?.[0]) ||
        idx.regionsByParent.get(countryId)?.find((g) => toLower(g.code) === sc || toLower(g.slug) === sc);
    if (direct) return direct;
    if (nm) {
        const byName = idx.regionsByParent.get(countryId)?.find((g) => toLower(g.name) === nm || toLower(g.slug) === nm);
        if (byName) return byName;
    }
    // fallback: global match by code/slug/name (на случай, если parent_id отсутствует)
    if (sc) {
        const globalCode = idx.regionsByCode.get(sc) || idx.regionsBySlug.get(sc);
        if (globalCode) return globalCode;
    }
    if (nm) {
        const globalName = idx.regionsBySlug.get(nm) || idx.regionsByCode.get(nm);
        if (globalName) return globalName;
    }
    return null;
}

function matchCityGeo(idx: GeoIndex | null, regionId?: string | null, name?: string | null) {
    if (!idx || !name) return null;
    const nm = toLower(name);
    const inParent =
        regionId &&
        idx.citiesByParent
            .get(regionId)
            ?.find((g) => toLower(g.name) === nm || toLower(g.slug) === nm || toLower(g.code) === nm);
    if (inParent) return inParent;
    // fallback: глобально по имени/slug/code (если parent_id в geo пустой)
    return idx.citiesByName.get(nm) || null;
}

export function useGeoCascade() {
    const [countries, setCountries] = useState<GeoImportItem[]>([]);
    const [regions, setRegions] = useState<Record<string, GeoImportItem[]>>({});
    const [cities, setCities] = useState<Record<string, GeoImportItem[]>>({});
    const [loading, setLoading] = useState<LoadingState>({ countries: false, regionsFor: null, citiesFor: null });
    const [error, setError] = useState<string | null>(null);

    const geoListRef = useRef<GeoLocation[] | null>(null);
    const geoIndexRef = useRef<GeoIndex | null>(null);
    const geoLoaded = useRef(false);
    const countriesTried = useRef(false);
    const regionsCache = useRef(new Set<string>());
    const citiesCache = useRef(new Set<string>());

    const ensureGeoList = useCallback(async () => {
        if (geoLoaded.current) return;
        try {
            const all = await adminGeoApi.list();
            geoListRef.current = all;
            geoIndexRef.current = buildGeoIndex(all);
            geoLoaded.current = true;
        } catch (e: any) {
            // не валим UI, просто логируем ошибку
            setError(e?.response?.data?.message || e?.message || "Failed to load geo locations");
        }
    }, []);

    const loadCountries = useCallback(async () => {
        if (countries.length || loading.countries || countriesTried.current) return;
        setLoading((s) => ({ ...s, countries: true }));
        setError(null);
        try {
            await ensureGeoList();
            const data = await geoImportApi.importCountries();
            const mapped = data.map((row) => {
                const match = matchCountryGeo(geoIndexRef.current, row.iso2 || row.code);
                return {
                    ...row,
                    id: match?.id || row.id,
                };
            });
            setCountries(dedupById(mapped).sort(sortByName));
            countriesTried.current = true;
        } catch (e: any) {
            countriesTried.current = false;
            setError(e?.response?.data?.message || e?.message || "Failed to load countries");
        } finally {
            setLoading((s) => ({ ...s, countries: false }));
        }
    }, [countries.length, ensureGeoList, loading.countries]);

    const countryIndex = useMemo(() => new Map(countries.map((c) => [c.id, c])), [countries]);

    const loadRegions = useCallback(
        async (countryId?: string | null) => {
            const keyId = countryId || "";
            if (!keyId || regionsCache.current.has(keyId)) return;
            const countryOpt = countryIndex.get(keyId);
            const countryGeo = geoIndexRef.current?.countriesByIso.get(toLower(countryOpt?.iso2)) ||
                geoIndexRef.current?.countriesByCode.get(toLower(countryOpt?.code)) ||
                null;
            const countryCode = countryOpt?.iso2 || countryOpt?.code || countryGeo?.iso2 || countryGeo?.code || "";
            if (!countryCode) return;

            regionsCache.current.add(keyId);
            setLoading((s) => ({ ...s, regionsFor: keyId }));
            setError(null);
            try {
                await ensureGeoList();
                const data = await geoImportApi.importStates(countryCode);
                const mapped = data.map((row) => {
                    const match = matchRegionGeo(geoIndexRef.current, countryGeo?.id || countryOpt?.id, row.stateCode || row.code, row.name);
                    return {
                        ...row,
                        id: match?.id || row.id,
                        stateCode: row.stateCode || row.code || row.id,
                    };
                });
                setRegions((prev) => ({ ...prev, [keyId]: dedupById(mapped).sort(sortByName) }));
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load regions");
                regionsCache.current.delete(keyId);
            } finally {
                setLoading((s) => ({ ...s, regionsFor: null }));
            }
        },
        [countryIndex, ensureGeoList]
    );

    const getRegions = useCallback(
        (countryId?: string | null) => {
            if (!countryId) return [];
            return regions[countryId] || [];
        },
        [regions]
    );

    const loadCities = useCallback(
        async (countryId?: string | null, regionId?: string | null) => {
            const cId = countryId || "";
            const rId = regionId || "";
            const cacheKey = `${cId}/${rId}`;
            if (!cId || !rId || citiesCache.current.has(cacheKey)) return;

            const countryOpt = countryIndex.get(cId);
            const countryGeo = geoIndexRef.current?.countriesByIso.get(toLower(countryOpt?.iso2)) ||
                geoIndexRef.current?.countriesByCode.get(toLower(countryOpt?.code)) ||
                null;
            const countryCode = countryOpt?.iso2 || countryOpt?.code || countryGeo?.iso2 || countryGeo?.code || "";

            const regionOpt = (regions[cId] || []).find((r) => r.id === rId);
            const regionGeo =
                geoIndexRef.current?.regionsByParent.get(countryGeo?.id || "")?.find((g) => g.id === rId) || null;
            const stateCode = regionOpt?.stateCode || regionOpt?.code || regionGeo?.code || regionGeo?.slug || regionOpt?.id || "";

            if (!countryCode || !stateCode) return;

            citiesCache.current.add(cacheKey);
            setLoading((s) => ({ ...s, citiesFor: cacheKey }));
            setError(null);
            try {
                await ensureGeoList();
                const data = await geoImportApi.importCities(countryCode, stateCode);
                const mapped = data.map((row) => {
                    const match = matchCityGeo(geoIndexRef.current, regionGeo?.id || regionOpt?.id, row.name);
                    return {
                        ...row,
                        id: match?.id || row.id,
                    };
                });
                setCities((prev) => ({ ...prev, [cacheKey]: dedupById(mapped).sort(sortByName) }));
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load cities");
                citiesCache.current.delete(cacheKey);
            } finally {
                setLoading((s) => ({ ...s, citiesFor: null }));
            }
        },
        [countryIndex, regions, ensureGeoList]
    );

    const getCities = useCallback(
        (countryId?: string | null, regionId?: string | null) => {
            if (!countryId || !regionId) return [];
            const key = `${countryId}/${regionId}`;
            return cities[key] || [];
        },
        [cities]
    );

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
        countryKey: (id?: string | null) => {
            const c = id ? countryIndex.get(id) : null;
            return c?.iso2 || c?.code || c?.id || "";
        },
        regionKey: (id?: string | null) => {
            const r = id ? regionIndex.get(id) : null;
            return r?.stateCode || r?.code || r?.id || "";
        },
    };
}
