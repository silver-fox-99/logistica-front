import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { InputBaseComponentProps } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";


import type {
    EditPoint,
    FormState,
    InitialData,
    Kind,
    VehicleTypeOpt,
} from "./types";
import { POINT_TYPES } from "./types";
import {
    buildInitialForm,
    buildInitialPoints,
    createEmptyPoint,
    findGeoIdLoose,
    hasMeaningfulCity,
    hasMeaningfulRegion,
    normalizeLoadRange,
    toNumberOr,
    toOptionalNumber,
} from "./helpers";

type UseFullEditDialogParams = {
    open: boolean;
    kind: Kind;
    initial?: InitialData;
    onClose: () => void;
    onSubmit: (payload: any) => Promise<void> | void;
};

export function useFullEditDialog({
                                      open,
                                      kind,
                                      initial,
                                      onClose,
                                      onSubmit,
                                  }: UseFullEditDialogParams) {
    const { t } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { getLocalizedLabel } = useLocalizedLookup();

    const lookups = useInitStore((s) => s.lookups);
    const loadInit = useInitStore((s) => s.loadInit);

    const geo = useGeoCascade();
    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
    } = geo;

    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOpt[] }>(null);
    const [loadingFilters, setLoadingFilters] = useState(false);

    const [form, setForm] = useState<FormState>(() => buildInitialForm(initial));
    const [fromPoints, setFromPoints] = useState<EditPoint[]>([
        createEmptyPoint(POINT_TYPES[kind].from),
    ]);
    const [toPoints, setToPoints] = useState<EditPoint[]>([
        createEmptyPoint(POINT_TYPES[kind].to),
    ]);

    const hydratedIdRef = useRef<string | null>(null);

    const numericKeys = useMemo(
        () =>
            new Set([
                "palletsCount",
                "carsCount",
                "weightT",
                "volumeM3",
                "lengthM",
                "widthM",
                "heightM",
                "priceAmount",
            ]),
        []
    );

    const numericInputProps: InputBaseComponentProps = useMemo(
        () => ({
            inputMode: "numeric",
            pattern: "[0-9]*",
        }),
        []
    );

    const sanitizeDigits = useCallback((v: string) => {
        const normalized = v.replace(",", ".");
        const parts = normalized.split(".");
        if (parts.length <= 1) return normalized.replace(/[^\d]/g, "");
        return `${parts[0].replace(/[^\d]/g, "")}.${parts
            .slice(1)
            .join("")
            .replace(/[^\d]/g, "")}`;
    }, []);

    const fetchFilters = useCallback(async () => {
        setLoadingFilters(true);
        try {
            const res = await publicShipmentsApi.getFilters();
            setFiltersData({ vehicle_types: res?.vehicle_types ?? [] });
        } finally {
            setLoadingFilters(false);
        }
    }, []);

    const syncFormFromInitial = useCallback(() => {
        setForm(buildInitialForm(initial));
        hydratedIdRef.current = null;
    }, [initial]);

    const hydratePointsFromInitial = useCallback(() => {
        const next = buildInitialPoints(kind, initial, countries);
        setFromPoints(next.fromPoints);
        setToPoints(next.toPoints);
        hydratedIdRef.current = initial?.id ?? null;
    }, [countries, initial, kind]);

    const ensureDescendantsForPoints = useCallback(async () => {
        const allPoints = [...fromPoints, ...toPoints];

        for (const point of allPoints) {
            if (point.countryId) {
                await ensureRegions(point.countryId);
            }

            if (point.countryId && point.regionId) {
                await ensureCities(point.countryId, point.regionId);
            }
        }
    }, [ensureCities, ensureRegions, fromPoints, toPoints]);

    const resolvePendingRegionCity = useCallback(
        (point: EditPoint): EditPoint => {
            let changed = false;
            let next = point;

            if (point.countryId && !point.regionId && hasMeaningfulRegion(point)) {
                const regionId = findGeoIdLoose(getRegions(point.countryId), [point.rawRegionName!]);
                if (regionId) {
                    next = { ...next, regionId };
                    changed = true;
                }
            }

            if (point.countryId && next.regionId && !next.cityId && hasMeaningfulCity(next)) {
                const cityId = findGeoIdLoose(
                    getCities(point.countryId, next.regionId),
                    [next.rawCityName!]
                );
                if (cityId) {
                    next = { ...next, cityId };
                    changed = true;
                }
            }

            return changed ? next : point;
        },
        [getCities, getRegions]
    );

    const reconcilePendingGeo = useCallback(() => {
        setFromPoints((prev) => {
            const next = prev.map(resolvePendingRegionCity);
            return next.some((item, index) => item !== prev[index]) ? next : prev;
        });

        setToPoints((prev) => {
            const next = prev.map(resolvePendingRegionCity);
            return next.some((item, index) => item !== prev[index]) ? next : prev;
        });
    }, [resolvePendingRegionCity]);

    const syncPointTypesByKind = useCallback(() => {
        const types = POINT_TYPES[kind];

        setFromPoints((prev) =>
            prev.length ? prev.map((p) => ({ ...p, type: types.from })) : [createEmptyPoint(types.from)]
        );

        setToPoints((prev) =>
            prev.length ? prev.map((p) => ({ ...p, type: types.to })) : [createEmptyPoint(types.to)]
        );
    }, [kind]);

    useEffect(() => {
        if (open) void loadInit();
    }, [open, loadInit]);

    useEffect(() => {
        if (open && !filtersData) void fetchFilters();
    }, [fetchFilters, filtersData, open]);

    useEffect(() => {
        if (open) void loadCountries();
    }, [loadCountries, open]);

    useEffect(() => {
        if (open) syncFormFromInitial();
    }, [open, syncFormFromInitial]);

    useEffect(() => {
        if (!open || !initial?.id || !countries.length) return;
        if (hydratedIdRef.current === initial.id) return;

        hydratePointsFromInitial();
    }, [countries.length, hydratePointsFromInitial, initial?.id, open]);

    useEffect(() => {
        if (open) void ensureDescendantsForPoints();
    }, [ensureDescendantsForPoints, open]);

    useEffect(() => {
        if (open) reconcilePendingGeo();
    }, [open, reconcilePendingGeo]);

    useEffect(() => {
        syncPointTypesByKind();
    }, [syncPointTypesByKind]);

    const updatePoint = useCallback(
        (side: "from" | "to", index: number, patch: Partial<EditPoint>) => {
            const setter = side === "from" ? setFromPoints : setToPoints;

            setter((prev) =>
                prev.map((item, i) => {
                    if (i !== index) return item;

                    const next = { ...item, ...patch };

                    if ("countryId" in patch) {
                        next.regionId = "";
                        next.cityId = "";
                    }

                    if ("regionId" in patch) {
                        next.cityId = "";
                    }

                    return next;
                })
            );
        },
        []
    );

    const addPoint = useCallback(
        (side: "from" | "to") => {
            const type = side === "from" ? POINT_TYPES[kind].from : POINT_TYPES[kind].to;
            const setter = side === "from" ? setFromPoints : setToPoints;
            setter((prev) => [...prev, createEmptyPoint(type)]);
        },
        [kind]
    );

    const removePoint = useCallback((side: "from" | "to", index: number) => {
        const setter = side === "from" ? setFromPoints : setToPoints;
        setter((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    }, []);

    const handleChange = useCallback(
        (key: keyof FormState) => (e: any) => {
            const rawValue = e?.target?.value ?? "";
            const value = numericKeys.has(key)
                ? sanitizeDigits(String(rawValue))
                : rawValue;

            setForm((prev) => {
                if (key === "loadFrom") {
                    const next = { ...prev, loadFrom: String(value) };
                    if (!prev.loadTo || prev.loadTo === prev.loadFrom) {
                        next.loadTo = String(value);
                    }
                    return next;
                }

                return { ...prev, [key]: value };
            });
        },
        [numericKeys, sanitizeDigits]
    );

    const handleMultiLoadTypeChange = useCallback((e: any) => {
        const value = e.target.value;
        setForm((prev) => ({
            ...prev,
            loadType: typeof value === "string" ? value.split(",") : (value as string[]),
        }));
    }, []);

    const toggleBool = useCallback(
        (key: keyof FormState) => (_e: any, checked: boolean) => {
            setForm((prev) => ({ ...prev, [key]: checked }));
        },
        []
    );

    const loadTypeOptions = useMemo(() => {
        const src = lookups?.loadType;
        if (!src?.length) {
            return [
                { value: "ANY", label: t("shipments.editDialog.loadTypeAny") },
                { value: "FULL", label: t("shipments.editDialog.loadTypeFull") },
                { value: "PARTIAL", label: t("shipments.editDialog.loadTypePartial") },
                { value: "CONSOLIDATED", label: t("shipments.editDialog.loadTypeConsolidated") },
            ];
        }
        return src.map((x) => ({ value: x.slug, label: getLocalizedLabel(x) }));
    }, [getLocalizedLabel, lookups?.loadType, t]);

    const cargoTypeOptions = useMemo(() => {
        const src = lookups?.cargoTypes;
        if (!src?.length) {
            return [
                { value: "GENERAL", label: t("shipments.editDialog.cargoTypeGeneral") },
                { value: "DANGEROUS", label: t("shipments.editDialog.cargoTypeDangerous") },
                { value: "OVERSIZED", label: t("shipments.editDialog.cargoTypeOversized") },
                { value: "FRAGILE", label: t("shipments.editDialog.cargoTypeFragile") },
                { value: "LIQUID", label: t("shipments.editDialog.cargoTypeLiquid") },
                { value: "BULK", label: t("shipments.editDialog.cargoTypeBulk") },
                { value: "PALLETS", label: t("shipments.editDialog.cargoTypePallets") },
            ];
        }
        return src.map((x) => ({ value: x.slug, label: getLocalizedLabel(x) }));
    }, [getLocalizedLabel, lookups?.cargoTypes, t]);

    const bargainOptions = useMemo(() => {
        const src = lookups?.bargainOptions;
        if (!src?.length) {
            return [
                { value: "ALLOWED", label: t("shipments.editDialog.bargainAllowed") },
                { value: "FORBIDDEN", label: t("shipments.editDialog.bargainForbidden") },
            ];
        }
        return src.map((x) => ({ value: x.slug, label: getLocalizedLabel(x) }));
    }, [getLocalizedLabel, lookups?.bargainOptions, t]);

    const vehicleTypeOptions = useMemo(() => {
        if (!filtersData?.vehicle_types?.length) {
            return [{ value: "ANY", label: "ANY" }];
        }

        return filtersData.vehicle_types.map((opt) => {
            const lookup = lookups?.vehicleType?.find((l) => l.slug === opt.value);
            if (lookup) {
                return { value: opt.value, label: getLocalizedLabel(lookup) };
            }
            return opt;
        });
    }, [filtersData?.vehicle_types, getLocalizedLabel, lookups?.vehicleType]);

    const currencyOptions = useMemo(() => {
        if (lookups?.currency?.length) {
            return lookups.currency.map((c) => ({
                value: c.slug,
                label: getLocalizedLabel(c),
            }));
        }

        return [
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
            { value: "PLN", label: "PLN" },
            { value: "UAH", label: "UAH" },
        ];
    }, [getLocalizedLabel, lookups?.currency]);

    const submit = useCallback(async () => {
        try {
            const dateFrom = normalizeLoadRange(form.loadFrom, form.loadTo);

            if (form.loadFrom && form.loadTo && form.loadTo < form.loadFrom) {
                toast.error(t("shipments.copyDialog.errorDateOrder"));
                return;
            }

            if (form.unloadDate && form.loadFrom && form.unloadDate < form.loadFrom) {
                toast.error(t("shipments.copyDialog.errorDateOrder"));
                return;
            }

            const types = POINT_TYPES[kind];

            const preparedFromPoints = fromPoints.map((point, index) => ({
                id: point.id,
                type: types.from,
                country: point.countryId || null,
                region: point.regionId || null,
                city: point.cityId || null,
                address: point.address || null,
                order: index,
            }));

            const preparedToPoints = toPoints.map((point, index) => ({
                id: point.id,
                type: types.to,
                country: point.countryId || null,
                region: point.regionId || null,
                city: point.cityId || null,
                address: point.address || null,
                order: index,
            }));

            if (preparedFromPoints.some((p) => !p.country) || preparedToPoints.some((p) => !p.country)) {
                toast.error(t("shipments.editDialog.errorPointsRequired"));
                return;
            }

            const payload: any = {
                date_from: dateFrom ?? null,
                date_to: form.unloadDate || null,

                vehicle_type: form.vehicleType || "ANY",
                cars_count: toNumberOr(form.carsCount, 1),

                weight_t: toOptionalNumber(form.weightT),
                volume_m3: toOptionalNumber(form.volumeM3),

                has_dimensions: !!form.hasDimensions,
                length_m: form.hasDimensions ? toOptionalNumber(form.lengthM) : null,
                width_m: form.hasDimensions ? toOptionalNumber(form.widthM) : null,
                height_m: form.hasDimensions ? toOptionalNumber(form.heightM) : null,

                price_currency: form.priceCurrency || "USD",
                price_amount: toOptionalNumber(form.priceAmount),
                note: form.note || null,

                points: [...preparedFromPoints, ...preparedToPoints],
            };

            if (kind === "cargo") {
                payload.load_type = form.loadType?.length ? form.loadType : ["ANY"];
                payload.cargo_type = form.cargoType || "GENERAL";
                payload.allow_partial_load = !!form.allowPartialLoad;
                payload.pallets_count = toOptionalNumber(form.palletsCount);
            } else {
                payload.bargain = form.bargain || "ALLOWED";
            }

            await onSubmit(payload);
            onClose();
        } catch (error: any) {
            const message =
                error?.message ||
                error?.response?.data?.message ||
                t("shipments.editDialog.errorUpdate");

            toast.error(message);
        }
    }, [form, fromPoints, kind, onClose, onSubmit, t, toPoints]);

    return {
        t,
        kind,
        form,
        fromPoints,
        toPoints,
        countries,
        loadingFilters,
        isReady: !!filtersData,
        numericInputProps,

        getRegions,
        getCities,
        getLocalizedGeoName,

        loadTypeOptions,
        cargoTypeOptions,
        bargainOptions,
        vehicleTypeOptions,
        currencyOptions,

        handleChange,
        handleMultiLoadTypeChange,
        toggleBool,
        updatePoint,
        addPoint,
        removePoint,
        submit,
    };
}