import { useEffect, useMemo, useRef, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Stack, TextField, Button, FormControlLabel, Checkbox,
    MenuItem, Select, InputLabel, FormControl, Divider, CircularProgress,
    type InputBaseComponentProps
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
    dateFrom?: string | null;
    dateTo?: string | null;
    vehicleType?: string | null;
    loadType?: string[] | null;          // cargo only
    cargoType?: string | null;          // cargo only
    allowPartialLoad?: boolean | null;  // cargo only
    carsCount?: number | string | null; // transport only
    weightT?: number | string | null;
    volumeM3?: number | string | null;
    hasDimensions?: boolean | null;
    lengthM?: number | string | null;
    widthM?: number | string | null;
    heightM?: number | string | null;
    palletsCount?: number | string | null; // cargo only
    priceCurrency?: string | null;
    priceAmount?: number | string | null;
    bargain?: string | null;            // transport only
    note?: string | null;
    points?: GeoPoint[];                // [from, to]
};

type Props = {
    open: boolean;
    kind: Kind;
    initial?: InitialData;
    onClose: () => void;
    onSubmit: (payload: any) => Promise<void> | void;
};

/** ===== Helpers ===== */
const toStr = (v: unknown, fallback = ""): string =>
    v == null ? fallback : String(v);

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

// soft compare (на случай «Noord-Hollan» vs «North Holland»)
const eqLoose = (a?: string | null, b?: string | null) => {
    if (!a || !b) return false;
    const A = a.trim().toLowerCase();
    const B = b.trim().toLowerCase();
    return A === B || A.startsWith(B) || B.startsWith(A) || A.includes(B) || B.includes(A);
};

const findCountryIdLoose = (geos: GeoImportItem[], name?: string | null) => {
    if (!name) return "";
    const hit = geos.find(g => g.name && eqLoose(g.name, name));
    return hit?.id ?? "";
};
const findRegionIdLoose = (regions: GeoImportItem[], name?: string | null) => {
    if (!name) return "";
    return regions.find(r => r.name && eqLoose(r.name, name))?.id ?? "";
};
const findCityIdLoose = (cities: GeoImportItem[], name?: string | null) => {
    if (!name) return "";
    return cities.find(c => c.name && eqLoose(c.name, name))?.id ?? "";
};

/** ===== Component ===== */
export default function FullEditDialog({ open, kind, initial, onClose, onSubmit }: Props) {
    const { t } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups } = useInitStore();
    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
    } = useGeoCascade();

    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOpt[] }>(null);
    const [loadingFilters, setLoadingFilters] = useState(false);
    // Форма (без RHF): один объект состояния
    const [form, setForm] = useState(() => ({
        // common
        dateFrom: toStr(initial?.dateFrom),
        dateTo: toStr(initial?.dateTo),
        vehicleType: initial?.vehicleType || "ANY",
        weightT: toStr(initial?.weightT),
        volumeM3: toStr(initial?.volumeM3),
        hasDimensions: toBool(initial?.hasDimensions, false),
        lengthM: toStr(initial?.lengthM),
        widthM: toStr(initial?.widthM),
        heightM: toStr(initial?.heightM),
        priceCurrency: initial?.priceCurrency || "USD",
        priceAmount: toStr(initial?.priceAmount),
        note: toStr(initial?.note),

        // cargo only
        loadType: Array.isArray(initial?.loadType) ? initial.loadType : (initial?.loadType ? [initial.loadType] : ["ANY"]),
        cargoType: initial?.cargoType || "GENERAL",
        allowPartialLoad: toBool(initial?.allowPartialLoad, false),
        palletsCount: toStr(initial?.palletsCount),

        // transport only
        carsCount: toStr(initial?.carsCount ?? ""),
        bargain: initial?.bargain || "ALLOWED",

        // geo ids (selects)
        p1_countryId: "",
        p1_regionId: "",
        p1_cityId: "",
        p2_countryId: "",
        p2_regionId: "",
        p2_cityId: "",
    }));

    // чтобы не сбрасывать каскады при гидратации
    const hydratingRef = useRef(false);

    // Подгружаем фильтры один раз при открытии
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

    useEffect(() => { if (open) void loadCountries(); }, [open, loadCountries]);

    // Когда модалка открылась/сменился initial — перельём форму (всегда!)
    useEffect(() => {
        if (!open) return;
        setForm(prev => ({
            ...prev,
            dateFrom: toStr(initial?.dateFrom),
            dateTo: toStr(initial?.dateTo),
            vehicleType: initial?.vehicleType || "ANY",
            weightT: toStr(initial?.weightT),
            volumeM3: toStr(initial?.volumeM3),
            hasDimensions: toBool(initial?.hasDimensions, false),
            lengthM: toStr(initial?.lengthM),
            widthM: toStr(initial?.widthM),
            heightM: toStr(initial?.heightM),
            priceCurrency: initial?.priceCurrency || "USD",
            priceAmount: toStr(initial?.priceAmount),
            note: toStr(initial?.note),
            loadType: Array.isArray(initial?.loadType) ? initial.loadType : (initial?.loadType ? [initial.loadType] : ["ANY"]),
            cargoType: initial?.cargoType || "GENERAL",
            allowPartialLoad: toBool(initial?.allowPartialLoad, false),
            palletsCount: toStr(initial?.palletsCount),
            carsCount: toStr(initial?.carsCount ?? ""),
            bargain: initial?.bargain || "ALLOWED",
            // geo ids не трогаем здесь — их ниже проставим по каталогам
        }));
    }, [open, initial, kind]);

    // Как только есть данные — сопоставим initial.points -> ids (мягкий матч), не триггеря каскады
    useEffect(() => {
        if (!open) return;

        const p1 = initial?.points?.[0];
        const p2 = initial?.points?.[1];

        if (!p1 && !p2) return;

        hydratingRef.current = true;

        const p1_countryId = findCountryIdLoose(countries, p1?.country);
        const p1Regions = getRegions(p1_countryId);
        if (p1_countryId) ensureRegions(p1_countryId);
        const p1_regionId = findRegionIdLoose(p1Regions, p1?.region);
        if (p1_countryId && p1_regionId) ensureCities(p1_countryId, p1_regionId);
        const p1Cities = getCities(p1_countryId, p1_regionId);
        const p1_cityId = findCityIdLoose(p1Cities, p1?.city);

        const p2_countryId = findCountryIdLoose(countries, p2?.country);
        const p2Regions = getRegions(p2_countryId);
        if (p2_countryId) ensureRegions(p2_countryId);
        const p2_regionId = findRegionIdLoose(p2Regions, p2?.region);
        if (p2_countryId && p2_regionId) ensureCities(p2_countryId, p2_regionId);
        const p2Cities = getCities(p2_countryId, p2_regionId);
        const p2_cityId = findCityIdLoose(p2Cities, p2?.city);

        setForm(prev => ({
            ...prev,
            p1_countryId, p1_regionId, p1_cityId,
            p2_countryId, p2_regionId, p2_cityId,
        }));

        // отпустим каскад на следующий тик
        setTimeout(() => { hydratingRef.current = false; }, 0);
    }, [open, initial, countries, getRegions, ensureRegions, ensureCities, getCities]);

    const numericKeys: Array<keyof typeof form> = ["palletsCount", "carsCount", "weightT", "volumeM3", "lengthM", "widthM", "heightM", "priceAmount"];
    const sanitizeDigits = (v: string) => v.replace(/\D/g, "");
    const numericInputProps: InputBaseComponentProps = { inputMode: "numeric", pattern: "[0-9]*" };

    // Каскады (если не гидратируем)
    const handleChange = (key: keyof typeof form) => (e: any) => {
        const rawValue = e?.target?.value;
        const value = numericKeys.includes(key) ? sanitizeDigits(rawValue || "") : rawValue;
        setForm(prev => {
            if (hydratingRef.current) return { ...prev, [key]: value };
            // каскад From
            if (key === "p1_countryId") {
                return { ...prev, p1_countryId: value, p1_regionId: "", p1_cityId: "" };
            }
            if (key === "p1_regionId") {
                return { ...prev, p1_regionId: value, p1_cityId: "" };
            }
            // каскад To
            if (key === "p2_countryId") {
                return { ...prev, p2_countryId: value, p2_regionId: "", p2_cityId: "" };
            }
            if (key === "p2_regionId") {
                return { ...prev, p2_regionId: value, p2_cityId: "" };
            }
            return { ...prev, [key]: value };
        });
    };

    const toggleBool = (key: keyof typeof form) => (_e: any, checked: boolean) => {
        setForm(prev => ({ ...prev, [key]: checked }));
    };

    const p1_regions = getRegions(form.p1_countryId);
    const p1_cities = getCities(form.p1_countryId, form.p1_regionId);
    const p2_regions = getRegions(form.p2_countryId);
    const p2_cities = getCities(form.p2_countryId, form.p2_regionId);

    const vehicleTypeOptions = useMemo(() => {
        if (!filtersData?.vehicle_types) return [];
        
        return filtersData.vehicle_types.map(opt => {
            const lookup = lookups?.vehicleType?.find(l => l.slug === opt.value);
            if (lookup) {
                return {
                    value: opt.value,
                    label: getLocalizedLabel(lookup)
                };
            }
            return opt;
        });
    }, [filtersData, lookups, getLocalizedLabel]);

    const currencyOptions = useMemo(() => {
        if (lookups?.currency) {
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

  //  const nameOf = (id?: string) =>
  //      id ? geoIdx?.byId.get(id)?.name ?? null : null;

    const submit = async () => {
        if (!filtersData) return;

        if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom) {
            toast.error(t('shipments.copyDialog.errorDateOrder'));
            return;
        }

        const payload: any = {
            date_from: form.dateFrom || null,
            date_to: form.dateTo || null,
            vehicle_type: form.vehicleType || "ANY",
            weight_t: toOptionalNumber(form.weightT),
            volume_m3: toOptionalNumber(form.volumeM3),
            has_dimensions: !!form.hasDimensions,
            length_m: form.hasDimensions ? toOptionalNumber(form.lengthM) : null,
            width_m: form.hasDimensions ? toOptionalNumber(form.widthM) : null,
            height_m: form.hasDimensions ? toOptionalNumber(form.heightM) : null,
            price_currency: form.priceCurrency || "USD",
            price_amount: toOptionalNumber(form.priceAmount),
            note: form.note || null,
            points: [
                {id: initial?.points?.[0]?.id, type: initial?.points?.[0]?.type, cargo_id: initial?.id, country: form.p1_countryId, region: form.p1_regionId, city: form.p1_cityId },
                {id: initial?.points?.[1]?.id, type: initial?.points?.[1]?.type, cargo_id: initial?.id, country: form.p2_countryId, region: form.p2_regionId, city: form.p2_cityId },
            ],
        };

        if (kind === "cargo") {
            payload.load_type = form.loadType || ["ANY"];
            payload.cargo_type = form.cargoType || "GENERAL";
            payload.allow_partial_load = !!form.allowPartialLoad;
            payload.pallets_count = toOptionalNumber(form.palletsCount);
            payload.cars_count = toNumberOr(form.carsCount, 1);
        } else {
            payload.cars_count = toNumberOr(form.carsCount, 1);
            payload.bargain = form.bargain || "ALLOWED";
        }

        try {
            await onSubmit(payload);
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.message || t('shipments.editDialog.errorUpdate');
            toast.error(message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{kind === "cargo" ? t('shipments.editDialog.titleCargo') : t('shipments.editDialog.titleTransport')}</DialogTitle>
            <DialogContent>
                {loadingFilters && !filtersData ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : (
                    <Stack spacing={2} mt={0.5}>
                        <Grid container spacing={1.5}>
                            {/* Dates */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t('shipments.editDialog.loadingDateFrom')}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.dateFrom}
                                    onChange={handleChange("dateFrom")}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t('shipments.editDialog.loadingDateTo')}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.dateTo}
                                    onChange={handleChange("dateTo")}
                                    fullWidth
                                />
                            </Grid>

                            {/* Vehicle type (from backend) */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.vehicleType')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.vehicleType')}
                                        value={form.vehicleType}
                                        onChange={handleChange("vehicleType")}
                                    >
                                        {vehicleTypeOptions.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Cargo-only */}
                            {kind === "cargo" && (
                                <>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t('shipments.editDialog.loadType')}</InputLabel>
                                            <Select
                                                label={t('shipments.editDialog.loadType')}
                                                multiple
                                                value={Array.isArray(form.loadType) ? form.loadType : (form.loadType ? [form.loadType] : [])}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        loadType: typeof value === 'string' ? value.split(',') : value as string[]
                                                    }));
                                                }}
                                                renderValue={(selected) => {
                                                    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                                                        return <em style={{ color: '#999' }}>{t('shipments.editDialog.selectLoadType')}</em>;
                                                    }
                                                    const selectedArray = Array.isArray(selected) ? selected : [selected];
                                                    const labels = selectedArray.map(val => {
                                                        const map: Record<string, string> = {
                                                            "ANY": t('shipments.editDialog.loadTypeAny'),
                                                            "FULL": t('shipments.editDialog.loadTypeFull'),
                                                            "PARTIAL": t('shipments.editDialog.loadTypePartial'),
                                                            "CONSOLIDATED": t('shipments.editDialog.loadTypeConsolidated')
                                                        };
                                                        return map[val] || val;
                                                    });
                                                    return labels.join(', ');
                                                }}
                                            >
                                                <MenuItem value="ANY">{t('shipments.editDialog.loadTypeAny')}</MenuItem>
                                                <MenuItem value="FULL">{t('shipments.editDialog.loadTypeFull')}</MenuItem>
                                                <MenuItem value="PARTIAL">{t('shipments.editDialog.loadTypePartial')}</MenuItem>
                                                <MenuItem value="CONSOLIDATED">{t('shipments.editDialog.loadTypeConsolidated')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t('shipments.editDialog.cargoType')}</InputLabel>
                                            <Select
                                                label={t('shipments.editDialog.cargoType')}
                                                value={form.cargoType}
                                                onChange={handleChange("cargoType")}
                                            >
                                                <MenuItem value="GENERAL">{t('shipments.editDialog.cargoTypeGeneral')}</MenuItem>
                                                <MenuItem value="DANGEROUS">{t('shipments.editDialog.cargoTypeDangerous')}</MenuItem>
                                                <MenuItem value="OVERSIZED">{t('shipments.editDialog.cargoTypeOversized')}</MenuItem>
                                                <MenuItem value="FRAGILE">{t('shipments.editDialog.cargoTypeFragile')}</MenuItem>
                                                <MenuItem value="LIQUID">{t('shipments.editDialog.cargoTypeLiquid')}</MenuItem>
                                                <MenuItem value="BULK">{t('shipments.editDialog.cargoTypeBulk')}</MenuItem>
                                                <MenuItem value="PALLETS">{t('shipments.editDialog.cargoTypePallets')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!form.allowPartialLoad}
                                                    onChange={toggleBool("allowPartialLoad")}
                                                />
                                            }
                                            label={t('shipments.editDialog.allowPartialLoad')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label={t('shipments.editDialog.palletsCount')}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.palletsCount}
                                            onChange={handleChange("palletsCount")}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label={t('shipments.editDialog.vehiclesCount')}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.carsCount}
                                            onChange={handleChange("carsCount")}
                                            fullWidth
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Transport-only */}
                            {kind === "transport" && (
                                <>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label={t('shipments.editDialog.vehiclesCount')}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.carsCount}
                                            onChange={handleChange("carsCount")}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t('shipments.editDialog.bargain')}</InputLabel>
                                            <Select
                                                label={t('shipments.editDialog.bargain')}
                                                value={form.bargain}
                                                onChange={handleChange("bargain")}
                                            >
                                                <MenuItem value="ALLOWED">{t('shipments.editDialog.bargainAllowed')}</MenuItem>
                                                <MenuItem value="FORBIDDEN">{t('shipments.editDialog.bargainForbidden')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            {/* Weight/Volume */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t('shipments.editDialog.weight')}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.weightT}
                                    onChange={handleChange("weightT")}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t('shipments.editDialog.volume')}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.volumeM3}
                                    onChange={handleChange("volumeM3")}
                                    fullWidth
                                />
                            </Grid>

                            {/* Dimensions */}
                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!form.hasDimensions}
                                            onChange={toggleBool("hasDimensions")}
                                        />
                                    }
                                    label={t('shipments.editDialog.specifyDimensions')}
                                />
                            </Grid>

                            {form.hasDimensions && (
                                <>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    label={t('shipments.editDialog.length')}
                                                    type="text"
                                                    inputProps={numericInputProps}
                                                    value={form.lengthM}
                                                    onChange={handleChange("lengthM")}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    label={t('shipments.editDialog.width')}
                                                    type="text"
                                                    inputProps={numericInputProps}
                                                    value={form.widthM}
                                                    onChange={handleChange("widthM")}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    label={t('shipments.editDialog.height')}
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
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.currency')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.currency')}
                                        value={form.priceCurrency}
                                        onChange={handleChange("priceCurrency")}
                                    >
                                        {currencyOptions.map((c) => (
                                            <MenuItem key={c.value} value={c.value}>
                                                {c.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label={t('shipments.editDialog.priceAmount')}
                                        type="text"
                                        inputProps={numericInputProps}
                                        value={form.priceAmount}
                                        onChange={handleChange("priceAmount")}
                                        fullWidth
                                    />
                                </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 0.5 }} />
                            </Grid>

                            {/* FROM */}
                            <Grid size={{ xs: 12 }}>
                                <strong>{t('shipments.editDialog.from')}</strong>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.country')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.country')}
                                        value={form.p1_countryId}
                                        onChange={handleChange("p1_countryId")}
                                    >
                                        {countries.map(c => <MenuItem key={c.id} value={c.id}>{getLocalizedGeoName(c)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.region')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.region')}
                                        value={form.p1_regionId}
                                        onChange={handleChange("p1_regionId")}
                                    >
                                        <MenuItem value="">—</MenuItem>
                                        {p1_regions.map(r => <MenuItem key={r.id} value={r.id}>{getLocalizedGeoName(r)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.city')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.city')}
                                        value={form.p1_cityId}
                                        onChange={handleChange("p1_cityId")}
                                    >
                                        <MenuItem value="">—</MenuItem>
                                        {p1_cities.map(c => <MenuItem key={c.id} value={c.id}>{getLocalizedGeoName(c)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* TO */}
                            <Grid size={{ xs: 12 }}>
                                <strong>{t('shipments.editDialog.to')}</strong>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.country')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.country')}
                                        value={form.p2_countryId}
                                        onChange={handleChange("p2_countryId")}
                                    >
                                        {countries.map(c => <MenuItem key={c.id} value={c.id}>{getLocalizedGeoName(c)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.region')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.region')}
                                        value={form.p2_regionId}
                                        onChange={handleChange("p2_regionId")}
                                    >
                                        <MenuItem value="">—</MenuItem>
                                        {p2_regions.map(r => <MenuItem key={r.id} value={r.id}>{getLocalizedGeoName(r)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('shipments.editDialog.city')}</InputLabel>
                                    <Select
                                        label={t('shipments.editDialog.city')}
                                        value={form.p2_cityId}
                                        onChange={handleChange("p2_cityId")}
                                    >
                                        <MenuItem value="">—</MenuItem>
                                        {p2_cities.map(c => <MenuItem key={c.id} value={c.id}>{getLocalizedGeoName(c)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label={t('shipments.editDialog.note')}
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
                <Button onClick={onClose} variant="text">{t('shipments.editDialog.cancel')}</Button>
                <Button onClick={submit} variant="contained" disabled={!filtersData}>{t('shipments.editDialog.save')}</Button>
            </DialogActions>
        </Dialog>
    );
}
