import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Divider,
    CircularProgress,
    type InputBaseComponentProps,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { GeoPoint } from "@/entities/shipment/model/type";
import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";

type Kind = "cargo" | "transport";
type VehicleTypeOpt = { value: string; label: string };

type InitialData = {
    id?: string;

    // date_from после миграции может быть массивом (1..2)
    dateFrom?: string | string[] | null;

    // date_to (выгрузка) остаётся отдельным полем
    dateTo?: string | null;

    vehicleType?: string | null;

    // cargo only
    loadType?: string[] | null;
    cargoType?: string | null;
    allowPartialLoad?: boolean | null;
    palletsCount?: number | string | null;

    // ✅ НУЖНО ДЛЯ ОБОИХ (cargo + transport)
    carsCount?: number | string | null;

    // common
    weightT?: number | string | null;
    volumeM3?: number | string | null;
    hasDimensions?: boolean | null;
    lengthM?: number | string | null;
    widthM?: number | string | null;
    heightM?: number | string | null;
    priceCurrency?: string | null;
    priceAmount?: number | string | null;
    note?: string | null;

    // transport only
    bargain?: string | null;

    points?: GeoPoint[]; // [from, to]
};

type Props = {
    open: boolean;
    kind: Kind;
    initial?: InitialData;
    onClose: () => void;
    onSubmit: (payload: any) => Promise<void> | void;
};

const POINT_TYPES = {
    cargo: { from: "PICKUP", to: "DROPOFF" },
    transport: { from: "DEPARTURE", to: "ARRIVAL" },
} as const;

type EditPoint = {
    id?: string;
    type: string;
    countryId: string;
    regionId: string;
    cityId: string;
    address: string;
};

const createEmptyPoint = (type: string): EditPoint => ({
    type,
    countryId: "",
    regionId: "",
    cityId: "",
    address: "",
});

/** ===== Helpers ===== */
const toStr = (v: unknown, fallback = ""): string => (v == null ? fallback : String(v));

const toBool = (v: unknown, fallback = false): boolean => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
        if (v === "true") return true;
        if (v === "false") return false;
    }
    return fallback;
};

const toOptionalNumber = (v: unknown): number | null => {
    if (v == null) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const toNumberOr = (v: unknown, d: number): number => {
    const n = toOptionalNumber(v);
    return n == null ? d : n;
};

// "2026-02-02T22:00:00.000Z" -> "YYYY-MM-DD" (локальная дата)
// "2026-02-02" -> "2026-02-02"
const toDateInput = (v?: string | null): string => {
    if (!v) return "";
    const s = String(v).trim();
    if (!s) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) {
        const head = s.slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(head) ? head : "";
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

// date_from: 1..2 элементов, порядок
const normalizeLoadRange = (from?: string, to?: string): string[] | undefined => {
    const f = (from || "").trim();
    const t = (to || "").trim();
    if (!f && !t) return undefined;

    const start = f || t;
    const end = t || f;

    if (!start) return undefined;
    if (end && end < start) throw new Error("date_from range is invalid");

    return start === end ? [start] : [start, end];
};

// initial.dateFrom (string | string[]) -> loadFrom/loadTo
const splitInitialLoadRange = (v?: string | string[] | null) => {
    if (Array.isArray(v)) {
        const from = toDateInput(v[0] ?? "");
        const to = toDateInput((v[1] ?? v[0]) ?? "");
        return { from, to: to || from };
    }
    const from = toDateInput(v ?? "");
    return { from, to: from };
};

// soft compare
const eqLoose = (a?: string | null, b?: string | null) => {
    if (!a || !b) return false;
    const A = a.trim().toLowerCase();
    const B = b.trim().toLowerCase();
    return A === B || A.startsWith(B) || B.startsWith(A) || A.includes(B) || B.includes(A);
};

const findCountryIdLoose = (geos: GeoImportItem[], name?: string | null) => {
    if (!name) return "";
    const hit = geos.find((g) => g.name && eqLoose(g.name, name));
    return hit?.id ?? "";
};
const findRegionIdLoose = (regions: GeoImportItem[], name?: string | null) => {
    if (!name) return "";
    return regions.find((r) => r.name && eqLoose(r.name, name))?.id ?? "";
};
const findCityIdLoose = (cities: GeoImportItem[], name?: string | null) => {
    if (!name) return "";
    return cities.find((c) => c.name && eqLoose(c.name, name))?.id ?? "";
};

/** ===== Component ===== */
export default function FullEditDialog({ open, kind, initial, onClose, onSubmit }: Props) {
    const { t } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { getLocalizedLabel } = useLocalizedLookup();

    const lookups = useInitStore((s) => s.lookups);
    const loadInit = useInitStore((s) => s.loadInit);

    useEffect(() => {
        if (open) void loadInit();
    }, [open, loadInit]);

    const { countries, getRegions, getCities, loadCountries, } = useGeoCascade();

    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOpt[] }>(null);
    const [loadingFilters, setLoadingFilters] = useState(false);

    const initLoad = splitInitialLoadRange(initial?.dateFrom);

    const [form, setForm] = useState(() => ({
        loadFrom: initLoad.from,
        loadTo: initLoad.to,
        unloadDate: toDateInput(initial?.dateTo),

        vehicleType: initial?.vehicleType || "ANY",
        carsCount: toStr(initial?.carsCount ?? ""),

        weightT: toStr(initial?.weightT),
        volumeM3: toStr(initial?.volumeM3),
        hasDimensions: toBool(initial?.hasDimensions, false),
        lengthM: toStr(initial?.lengthM),
        widthM: toStr(initial?.widthM),
        heightM: toStr(initial?.heightM),
        priceCurrency: initial?.priceCurrency || "USD",
        priceAmount: toStr(initial?.priceAmount),
        note: toStr(initial?.note),

        loadType: Array.isArray(initial?.loadType)
            ? initial.loadType
            : initial?.loadType
                ? [initial.loadType as any]
                : ["ANY"],

        cargoType: initial?.cargoType || "GENERAL",
        allowPartialLoad: toBool(initial?.allowPartialLoad, false),
        palletsCount: toStr(initial?.palletsCount),

        bargain: initial?.bargain || "ALLOWED",
    }));

    const [fromPoints, setFromPoints] = useState<EditPoint[]>([
        createEmptyPoint(POINT_TYPES[kind].from),
    ]);

    const [toPoints, setToPoints] = useState<EditPoint[]>([
        createEmptyPoint(POINT_TYPES[kind].to),
    ]);

    const hydratingRef = useRef(false);

    useEffect(() => {
        if (!open || filtersData) return;
        (async () => {
            setLoadingFilters(true);
            try {
                const res = await publicShipmentsApi.getFilters();
                setFiltersData({ vehicle_types: res?.vehicle_types ?? [] });
            } finally {
                setLoadingFilters(false);
            }
        })();
    }, [open, filtersData]);

    useEffect(() => {
        if (open) void loadCountries();
    }, [open, loadCountries]);

    useEffect(() => {
        const types = POINT_TYPES[kind];

        setFromPoints((prev) =>
            prev.length
                ? prev.map((p) => ({ ...p, type: types.from }))
                : [createEmptyPoint(types.from)]
        );

        setToPoints((prev) =>
            prev.length
                ? prev.map((p) => ({ ...p, type: types.to }))
                : [createEmptyPoint(types.to)]
        );
    }, [kind]);

    // переливаем форму при смене initial
    useEffect(() => {
        if (!open) return;
        const r = splitInitialLoadRange(initial?.dateFrom);

        setForm((prev) => ({
            ...prev,
            loadFrom: r.from,
            loadTo: r.to || r.from,
            unloadDate: toDateInput(initial?.dateTo),

            vehicleType: initial?.vehicleType || "ANY",
            carsCount: toStr(initial?.carsCount ?? ""),

            weightT: toStr(initial?.weightT),
            volumeM3: toStr(initial?.volumeM3),
            hasDimensions: toBool(initial?.hasDimensions, false),
            lengthM: toStr(initial?.lengthM),
            widthM: toStr(initial?.widthM),
            heightM: toStr(initial?.heightM),
            priceCurrency: initial?.priceCurrency || "USD",
            priceAmount: toStr(initial?.priceAmount),
            note: toStr(initial?.note),

            loadType: Array.isArray(initial?.loadType) ? initial!.loadType! : initial?.loadType ? [initial.loadType as any] : ["ANY"],
            cargoType: initial?.cargoType || "GENERAL",
            allowPartialLoad: toBool(initial?.allowPartialLoad, false),
            palletsCount: toStr(initial?.palletsCount),

            bargain: initial?.bargain || "ALLOWED",
        }));
    }, [open, initial, kind]);

    const updatePoint = (
        side: "from" | "to",
        index: number,
        patch: Partial<EditPoint>
    ) => {
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
    };

    const addPoint = (side: "from" | "to") => {
        const type = side === "from" ? POINT_TYPES[kind].from : POINT_TYPES[kind].to;
        const setter = side === "from" ? setFromPoints : setToPoints;
        setter((prev) => [...prev, createEmptyPoint(type)]);
    };

    const removePoint = (side: "from" | "to", index: number) => {
        const setter = side === "from" ? setFromPoints : setToPoints;
        setter((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    // Hydrate geo ids from initial.points
    useEffect(() => {
        if (!open) return;

        const types = POINT_TYPES[kind];
        const sorted = [...(initial?.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const rawFrom = sorted.filter((p) => p?.type === types.from);
        const rawTo = sorted.filter((p) => p?.type === types.to);

        const mapPoint = (point: GeoPoint | undefined, type: string): EditPoint => {
            const countryId = findCountryIdLoose(countries, point?.country);
            const regions = countryId ? getRegions(countryId) : [];
            const regionId = findRegionIdLoose(regions, point?.region);
            const cities = countryId && regionId ? getCities(countryId, regionId) : [];
            const cityId = findCityIdLoose(cities, point?.city);

            return {
                id: point?.id,
                type,
                countryId,
                regionId,
                cityId,
                address: point?.address ?? "",
            };
        };

        setFromPoints(
            rawFrom.length
                ? rawFrom.map((p) => mapPoint(p, types.from))
                : [createEmptyPoint(types.from)]
        );

        setToPoints(
            rawTo.length
                ? rawTo.map((p) => mapPoint(p, types.to))
                : [createEmptyPoint(types.to)]
        );
    }, [open, initial, kind, countries, getRegions, getCities]);


    const numericKeys: Array<keyof typeof form> = ["palletsCount", "carsCount", "weightT", "volumeM3", "lengthM", "widthM", "heightM", "priceAmount"];
    const sanitizeDigits = (v: string) => v.replace(",", ".").replace(/[^\d.]/g, "");
    const numericInputProps: InputBaseComponentProps = { inputMode: "numeric", pattern: "[0-9]*" };

    const handleChange = (key: keyof typeof form) => (e: any) => {
        const rawValue = e?.target?.value;
        const value = numericKeys.includes(key) ? sanitizeDigits(rawValue || "") : rawValue;

        setForm((prev) => {
            if (hydratingRef.current) return { ...prev, [key]: value };

            // авто-синк: если loadTo пустой или равен loadFrom — держим его равным новому loadFrom
            if (key === "loadFrom") {
                const next = { ...prev, loadFrom: value };
                if (!prev.loadTo || prev.loadTo === prev.loadFrom) next.loadTo = value;
                return next;
            }



            return { ...prev, [key]: value };
        });
    };

    const toggleBool = (key: keyof typeof form) => (_e: any, checked: boolean) => {
        setForm((prev) => ({ ...prev, [key]: checked }));
    };

    const renderPointGroup = (
        side: "from" | "to",
        title: string,
        points: EditPoint[]
    ) => {
        return (
            <>
                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
                        <Button size="small" onClick={() => addPoint(side)}>
                            {t("shipments.editDialog.addPoint")}
                        </Button>
                    </Stack>
                </Grid>

                {points.map((point, index) => {
                    const regions = getRegions(point.countryId);
                    const cities = getCities(point.countryId, point.regionId);

                    return (
                        <Fragment key={`${side}-${index}-${point.id ?? "new"}`}>
                            <Grid size={{ xs: 12 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {title} #{index + 1}
                                    </Typography>

                                    {points.length > 1 && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => removePoint(side, index)}
                                        >
                                            {t("shipments.editDialog.removePoint")}
                                        </Button>
                                    )}
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.country")}</InputLabel>
                                    <Select
                                        label={t("shipments.editDialog.country")}
                                        value={point.countryId}
                                        onChange={(e) =>
                                            updatePoint(side, index, { countryId: String(e.target.value) })
                                        }
                                    >
                                        {countries.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {getLocalizedGeoName(c)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.region")}</InputLabel>
                                    <Select
                                        label={t("shipments.editDialog.region")}
                                        value={point.regionId}
                                        onChange={(e) =>
                                            updatePoint(side, index, { regionId: String(e.target.value) })
                                        }
                                    >
                                        <MenuItem value="">—</MenuItem>
                                        {regions.map((r) => (
                                            <MenuItem key={r.id} value={r.id}>
                                                {getLocalizedGeoName(r)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.city")}</InputLabel>
                                    <Select
                                        label={t("shipments.editDialog.city")}
                                        value={point.cityId}
                                        onChange={(e) =>
                                            updatePoint(side, index, { cityId: String(e.target.value) })
                                        }
                                    >
                                        <MenuItem value="">—</MenuItem>
                                        {cities.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {getLocalizedGeoName(c)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label={t("shipments.editDialog.address")}
                                    value={point.address}
                                    onChange={(e) =>
                                        updatePoint(side, index, { address: e.target.value })
                                    }
                                    fullWidth
                                />
                            </Grid>
                        </Fragment>
                    );
                })}
            </>
        );
    };

    // ====== Options from store (замена хардкода) ======
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
    }, [lookups?.loadType, getLocalizedLabel, t]);

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
    }, [lookups?.cargoTypes, getLocalizedLabel, t]);

    const bargainOptions = useMemo(() => {
        const src = lookups?.bargainOptions;
        if (!src?.length) {
            return [
                { value: "ALLOWED", label: t("shipments.editDialog.bargainAllowed") },
                { value: "FORBIDDEN", label: t("shipments.editDialog.bargainForbidden") },
            ];
        }
        return src.map((x) => ({ value: x.slug, label: getLocalizedLabel(x) }));
    }, [lookups?.bargainOptions, getLocalizedLabel, t]);

    const vehicleTypeOptions = useMemo(() => {
        if (!filtersData?.vehicle_types) return [];
        return filtersData.vehicle_types.map((opt) => {
            const lookup = lookups?.vehicleType?.find((l) => l.slug === opt.value);
            if (lookup) return { value: opt.value, label: getLocalizedLabel(lookup) };
            return opt;
        });
    }, [filtersData, lookups?.vehicleType, getLocalizedLabel]);

    const currencyOptions = useMemo(() => {
        if (lookups?.currency?.length) {
            return lookups.currency.map((c) => ({ value: c.slug, label: getLocalizedLabel(c) }));
        }
        return [
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
            { value: "PLN", label: "PLN" },
            { value: "UAH", label: "UAH" },
        ];
    }, [getLocalizedLabel, lookups?.currency]);

    const submit = async () => {
        if (!filtersData) return;

        try {
            const date_from = normalizeLoadRange(form.loadFrom, form.loadTo);

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
                date_from: date_from ?? null,
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
            const message = error?.message || error?.response?.data?.message || t("shipments.editDialog.errorUpdate");
            toast.error(message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{kind === "cargo" ? t("shipments.editDialog.titleCargo") : t("shipments.editDialog.titleTransport")}</DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {loadingFilters && !filtersData ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : (
                    <Stack spacing={2} mt={0.5}>
                        <Grid container spacing={1.5}>
                            {/* Dates: 2 загрузки + 1 выгрузка */}
                            <Grid size={{xs:12, md: 4}}>
                                <TextField
                                    label={t("shipments.editDialog.loadingDateFrom", { defaultValue: "Loading date (from)" })}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.loadFrom}
                                    onChange={handleChange("loadFrom")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{xs:12, md: 4}}>
                                <TextField
                                    label={t("shipments.editDialog.loadingDateTo", { defaultValue: "Loading date (to)" })}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.loadTo}
                                    onChange={handleChange("loadTo")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{xs:12, md: 4}}>
                                <TextField
                                    label={t("shipments.editDialog.unloadingDate", { defaultValue: "Unloading date" })}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.unloadDate}
                                    onChange={handleChange("unloadDate")}
                                    fullWidth
                                />
                            </Grid>

                            {/* Vehicle type + Cars count (для обоих) */}
                            <Grid size={{xs:12, md: 6}}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.vehicleType")}</InputLabel>
                                    <Select label={t("shipments.editDialog.vehicleType")} value={form.vehicleType} onChange={handleChange("vehicleType")}>
                                        {vehicleTypeOptions.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{xs:12, md: 6}}>
                                <TextField
                                    label={t("shipments.editDialog.vehiclesCount", { defaultValue: "Vehicles count" })}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.carsCount}
                                    onChange={handleChange("carsCount")}
                                    fullWidth
                                />
                            </Grid>

                            {/* Cargo-only */}
                            {kind === "cargo" && (
                                <>
                                    <Grid size={{xs:12, md: 6}}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t("shipments.editDialog.loadType")}</InputLabel>
                                            <Select
                                                label={t("shipments.editDialog.loadType")}
                                                multiple
                                                value={Array.isArray(form.loadType) ? form.loadType : form.loadType ? [form.loadType] : []}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        loadType: typeof value === "string" ? value.split(",") : (value as string[]),
                                                    }));
                                                }}
                                                renderValue={(selected) => {
                                                    const arr = Array.isArray(selected) ? selected : [selected];
                                                    if (!arr.length) return <em style={{ color: "#999" }}>{t("shipments.editDialog.selectLoadType")}</em>;
                                                    const map = new Map(loadTypeOptions.map((x) => [x.value, x.label]));
                                                    return arr.map((v) => map.get(v) ?? v).join(", ");
                                                }}
                                            >
                                                {loadTypeOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{xs:12, md: 6}}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t("shipments.editDialog.cargoType")}</InputLabel>
                                            <Select label={t("shipments.editDialog.cargoType")} value={form.cargoType} onChange={handleChange("cargoType")}>
                                                {cargoTypeOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{xs:12, md: 6}}>
                                        <FormControlLabel
                                            control={<Checkbox checked={!!form.allowPartialLoad} onChange={toggleBool("allowPartialLoad")} />}
                                            label={t("shipments.editDialog.allowPartialLoad")}
                                        />
                                    </Grid>

                                    <Grid size={{xs:12, md: 6}}>
                                        <TextField
                                            label={t("shipments.editDialog.palletsCount")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.palletsCount}
                                            onChange={handleChange("palletsCount")}
                                            fullWidth
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Transport-only */}
                            {kind === "transport" && (
                                <Grid size={{xs:12, md: 6}}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t("shipments.editDialog.bargain")}</InputLabel>
                                        <Select label={t("shipments.editDialog.bargain")} value={form.bargain} onChange={handleChange("bargain")}>
                                            {bargainOptions.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Weight/Volume */}
                            <Grid size={{xs:12, md: 6}}>
                                <TextField
                                    label={t("shipments.editDialog.weight")}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.weightT}
                                    onChange={handleChange("weightT")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{xs:12, md: 6}}>
                                <TextField
                                    label={t("shipments.editDialog.volume")}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.volumeM3}
                                    onChange={handleChange("volumeM3")}
                                    fullWidth
                                />
                            </Grid>

                            {/* Dimensions */}
                            <Grid size={{xs:12}}>
                                <FormControlLabel
                                    control={<Checkbox checked={!!form.hasDimensions} onChange={toggleBool("hasDimensions")} />}
                                    label={t("shipments.editDialog.specifyDimensions")}
                                />
                            </Grid>

                            {form.hasDimensions && (
                                <>
                                    <Grid size={{xs:12, md: 4}}>
                                        <TextField
                                            label={t("shipments.editDialog.length")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.lengthM}
                                            onChange={handleChange("lengthM")}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, md: 4}}>
                                        <TextField
                                            label={t("shipments.editDialog.width")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.widthM}
                                            onChange={handleChange("widthM")}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, md: 4}}>
                                        <TextField
                                            label={t("shipments.editDialog.height")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.heightM}
                                            onChange={handleChange("heightM")}
                                            fullWidth
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Price */}
                            <Grid size={{xs:12, md: 6}}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.currency")}</InputLabel>
                                    <Select label={t("shipments.editDialog.currency")} value={form.priceCurrency} onChange={handleChange("priceCurrency")}>
                                        {currencyOptions.map((c) => (
                                            <MenuItem key={c.value} value={c.value}>
                                                {c.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{xs:12, md: 6}}>
                                <TextField
                                    label={t("shipments.editDialog.priceAmount")}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.priceAmount}
                                    onChange={handleChange("priceAmount")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{xs:12}}>
                                <Divider sx={{ my: 0.25 }} />
                            </Grid>

                            {renderPointGroup("from", t("shipments.editDialog.from"), fromPoints)}
                            {renderPointGroup("to", t("shipments.editDialog.to"), toPoints)}

                            <Grid size={{xs:12}}>
                                <TextField
                                    label={t("shipments.editDialog.note")}
                                    value={form.note}
                                    onChange={handleChange("note")}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="text">
                    {t("shipments.editDialog.cancel")}
                </Button>
                <Button onClick={submit} variant="contained" disabled={!filtersData}>
                    {t("shipments.editDialog.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
