import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import type { InputBaseComponentProps, SelectChangeEvent } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
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

type SelectOption = {
    value: string;
    label: string;
};

type LookupItem = {
    slug: string;
    label?: string;
    label_ru?: string;
    label_uz?: string;
    [key: string]: unknown;
};

type FormChangeEvent =
    | SelectChangeEvent<string>
    | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export function useFullEditDialog({
                                      open,
                                      kind,
                                      initial,
                                      onClose,
                                      onSubmit,
                                  }: UseFullEditDialogParams) {
    const { t } = useTranslation();
    const { getLocalizedLabel } = useLocalizedLookup();

    const lookups = useInitStore((s) => s.lookups);
    const loadInit = useInitStore((s) => s.loadInit);

    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOpt[] }>(null);
    const [loadingFilters, setLoadingFilters] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
            new Set<keyof FormState>([
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
            inputMode: "decimal",
            pattern: "[0-9]*[.,]?[0-9]*",
        }),
        []
    );

    const sanitizeDigits = useCallback((v: string) => {
        const normalized = v.replace(",", ".");
        const parts = normalized.split(".");

        if (parts.length <= 1) {
            return normalized.replace(/[^\d]/g, "");
        }

        return `${parts[0].replace(/[^\d]/g, "")}.${parts
            .slice(1)
            .join("")
            .replace(/[^\d]/g, "")}`;
    }, []);

    const toLookupOption = useCallback(
        (item: LookupItem): SelectOption => ({
            value: item.slug,
            label: getLocalizedLabel(item as never),
        }),
        [getLocalizedLabel]
    );

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
        const next = buildInitialPoints(kind, initial);

        setFromPoints(next.fromPoints);
        setToPoints(next.toPoints);

        hydratedIdRef.current = initial?.id ?? null;
    }, [initial, kind]);

    const syncPointTypesByKind = useCallback(() => {
        const types = POINT_TYPES[kind];

        setFromPoints((prev: EditPoint[]) =>
            prev.length
                ? prev.map((point: EditPoint) => ({ ...point, type: types.from }))
                : [createEmptyPoint(types.from)]
        );

        setToPoints((prev: EditPoint[]) =>
            prev.length
                ? prev.map((point: EditPoint) => ({ ...point, type: types.to }))
                : [createEmptyPoint(types.to)]
        );
    }, [kind]);

    useEffect(() => {
        if (open) void loadInit();
    }, [open, loadInit]);

    useEffect(() => {
        if (open && !filtersData) void fetchFilters();
    }, [fetchFilters, filtersData, open]);

    useEffect(() => {
        if (open) syncFormFromInitial();
    }, [open, syncFormFromInitial]);

    useEffect(() => {
        if (!open || !initial?.id) return;
        if (hydratedIdRef.current === initial.id) return;

        hydratePointsFromInitial();
    }, [hydratePointsFromInitial, initial?.id, open]);

    useEffect(() => {
        syncPointTypesByKind();
    }, [syncPointTypesByKind]);

    const updatePoint = useCallback(
        (side: "from" | "to", index: number, patch: Partial<EditPoint>) => {
            const setter = side === "from" ? setFromPoints : setToPoints;

            setter((prev: EditPoint[]) =>
                prev.map((item: EditPoint, itemIndex: number) =>
                    itemIndex === index ? { ...item, ...patch } : item
                )
            );
        },
        []
    );

    const addPoint = useCallback(
        (side: "from" | "to") => {
            const type = side === "from" ? POINT_TYPES[kind].from : POINT_TYPES[kind].to;
            const setter = side === "from" ? setFromPoints : setToPoints;

            setter((prev: EditPoint[]) => [...prev, createEmptyPoint(type)]);
        },
        [kind]
    );

    const removePoint = useCallback((side: "from" | "to", index: number) => {
        const setter = side === "from" ? setFromPoints : setToPoints;

        setter((prev: EditPoint[]) =>
            prev.length <= 1 ? prev : prev.filter((_: EditPoint, itemIndex: number) => itemIndex !== index)
        );
    }, []);

    const handleChange = useCallback(
        (key: keyof FormState) => (e: FormChangeEvent) => {
            const rawValue = e.target.value ?? "";
            const value = numericKeys.has(key)
                ? sanitizeDigits(String(rawValue))
                : rawValue;

            setForm((prev: FormState) => {
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

    const handleMultiLoadTypeChange = useCallback((e: SelectChangeEvent<string[]>) => {
        const value = e.target.value;

        setForm((prev: FormState) => ({
            ...prev,
            loadType: typeof value === "string" ? value.split(",") : value,
        }));
    }, []);

    const toggleBool = useCallback(
        (key: keyof FormState) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setForm((prev: FormState) => ({ ...prev, [key]: checked }));
        },
        []
    );

    const loadTypeOptions = useMemo<SelectOption[]>(() => {
        const src = lookups?.loadType as LookupItem[] | undefined;

        if (!src?.length) {
            return [
                { value: "ANY", label: t("shipments.editDialog.loadTypeAny") },
                { value: "FULL", label: t("shipments.editDialog.loadTypeFull") },
                { value: "PARTIAL", label: t("shipments.editDialog.loadTypePartial") },
                { value: "CONSOLIDATED", label: t("shipments.editDialog.loadTypeConsolidated") },
            ];
        }

        return src.map(toLookupOption);
    }, [lookups?.loadType, t, toLookupOption]);

    const cargoTypeOptions = useMemo<SelectOption[]>(() => {
        const src = lookups?.cargoTypes as LookupItem[] | undefined;

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

        return src.map(toLookupOption);
    }, [lookups?.cargoTypes, t, toLookupOption]);

    const bargainOptions = useMemo<SelectOption[]>(() => {
        const src = lookups?.bargainOptions as LookupItem[] | undefined;

        if (!src?.length) {
            return [
                { value: "ALLOWED", label: t("shipments.editDialog.bargainAllowed") },
                { value: "FORBIDDEN", label: t("shipments.editDialog.bargainForbidden") },
            ];
        }

        return src.map(toLookupOption);
    }, [lookups?.bargainOptions, t, toLookupOption]);

    const vehicleTypeOptions = useMemo<SelectOption[]>(() => {
        if (!filtersData?.vehicle_types?.length) {
            return [{ value: "ANY", label: "ANY" }];
        }

        return filtersData.vehicle_types.map((opt: VehicleTypeOpt): SelectOption => {
            const vehicleLookups = lookups?.vehicleType as LookupItem[] | undefined;
            const lookup = vehicleLookups?.find((item: LookupItem) => item.slug === opt.value);

            if (lookup) {
                return {
                    value: opt.value,
                    label: getLocalizedLabel(lookup as never),
                };
            }

            return {
                value: opt.value,
                label: opt.label,
            };
        });
    }, [filtersData?.vehicle_types, getLocalizedLabel, lookups?.vehicleType]);

    const currencyOptions = useMemo<SelectOption[]>(() => {
        const src = lookups?.currency as LookupItem[] | undefined;

        if (src?.length) {
            return src.map(toLookupOption);
        }

        return [
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
            { value: "PLN", label: "PLN" },
            { value: "UAH", label: "UAH" },
        ];
    }, [lookups?.currency, toLookupOption]);

    const buildPreparedPoints = useCallback(
        (points: EditPoint[], type: string) =>
            points.map((point: EditPoint, index: number) => ({
                id: point.id,
                type,
                country: point.country || "",
                region: point.region || null,
                city: point.city || null,
                address: point.address || null,
                display_name: point.display_name || null,
                latitude: point.latitude,
                longitude: point.longitude,
                geocode_source: point.geocode_source || null,
                order: index,
            })),
        []
    );

    const submit = useCallback(async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

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

            const preparedFromPoints = buildPreparedPoints(fromPoints, types.from);
            const preparedToPoints = buildPreparedPoints(toPoints, types.to);

            if (
                preparedFromPoints.some((point) => !point.country) ||
                preparedToPoints.some((point) => !point.country)
            ) {
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

                has_dimensions: form.hasDimensions,
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
                payload.allow_partial_load = form.allowPartialLoad;
                payload.pallets_count = toOptionalNumber(form.palletsCount);
            } else {
                payload.bargain = form.bargain || "ALLOWED";
            }

            await onSubmit(payload);
            onClose();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                t("shipments.editDialog.errorUpdate");

            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }, [
        buildPreparedPoints,
        form,
        fromPoints,
        kind,
        onClose,
        onSubmit,
        submitting,
        t,
        toPoints,
    ]);

    return {
        t,
        kind,
        form,
        fromPoints,
        toPoints,

        loadingFilters,
        submitting,
        isReady: !!filtersData,
        numericInputProps,

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