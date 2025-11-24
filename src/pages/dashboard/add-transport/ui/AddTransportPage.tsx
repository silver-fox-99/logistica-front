import { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    Select, MenuItem, Autocomplete, InputLabel, OutlinedInput, FormControl, InputAdornment, FormControlLabel, Checkbox
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { transportApi, type CreateTransportDto } from "@/shared/api/transportApi";
import {useNavigate} from "react-router-dom";
import { useLocalizedLookup, useLocalizedGeo } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";

import './AddTransportPage.scss';

const PRICE_UNITS = ["Total", "Per ton", "Per km"] as const;

type Geo = {
    id: string;
    parent_id: string | null;
    type: "COUNTRY" | "REGION" | "CITY";
    name: string;
    name_ru?: string | null;
    name_uz?: string | null;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type Place = {
    countryId?: string | null;
    regionId?: string | null;
    cityId?: string | null;
    address?: string | null;
};

type FormValues = {
    dateFrom: string;
    dateTo: string;

    loadPlaces: Place[];
    unloadPlaces: Place[];

    vehicleType: string;
    vehiclesCount: number;

    capacityTons?: number;
    volumeM3?: number;

    dimsEnabled: boolean;
    bodyLength?: number;
    bodyWidth?: number;
    bodyHeight?: number;

    currency: string;
    price?: number;
    priceUnit: (typeof PRICE_UNITS)[number];

    tax: string;
    paymentMethod: string;
    paymentTerm: string;
    bargaining: "possible" | "none";

    contactSecondary?: string;
    email?: string;
    note?: string;
    extraPhoneAsMain: boolean;
};

function buildGeoMaps(geos: Geo[]) {
    const byId = new Map<string, Geo>();
    const countries: Geo[] = [];
    const regionsByCountry = new Map<string, Geo[]>();
    const citiesByParent = new Map<string, Geo[]>();

    for (const g of geos) {
        byId.set(g.id, g);
        if (g.type === "COUNTRY") countries.push(g);
    }
    for (const g of geos) {
        if (g.type === "REGION" && g.parent_id) {
            if (!regionsByCountry.has(g.parent_id)) regionsByCountry.set(g.parent_id, []);
            regionsByCountry.get(g.parent_id)!.push(g);
        }
    }
    for (const g of geos) {
        if (g.type === "CITY" && g.parent_id) {
            if (!citiesByParent.has(g.parent_id)) citiesByParent.set(g.parent_id, []);
            citiesByParent.get(g.parent_id)!.push(g);
        }
    }

    countries.sort((a, b) => a.name.localeCompare(b.name));
    regionsByCountry.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    citiesByParent.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));

    return { byId, countries, regionsByCountry, citiesByParent };
}

type PlaceRowProps = {
    labelPrefix: string;
    place: Place;
    onChange: (p: Place) => void;
    geos: Geo[] | null;
    errorKey?: string;
    showRemove?: boolean;
    onRemove?: () => void;
};

function PlaceRow({
                      labelPrefix, place, onChange, geos, errorKey, showRemove, onRemove
                  }: PlaceRowProps) {
    const { t } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { countries, regionsByCountry, citiesByParent } = useMemo(() => {
        if (!geos) return { countries: [] as Geo[], regionsByCountry: new Map<string, Geo[]>(), citiesByParent: new Map<string, Geo[]>() };
        return buildGeoMaps(geos);
    }, [geos]);

    const selectedCountry = place.countryId ? countries.find(c => c.id === place.countryId) : undefined;
    const regions: Geo[] = selectedCountry ? (regionsByCountry.get(selectedCountry.id) ?? []) : [];
    const citiesFromCountry: Geo[] = selectedCountry ? (citiesByParent.get(selectedCountry.id) ?? []) : [];
    const citiesFromRegion: Geo[] = place.regionId ? (citiesByParent.get(place.regionId) ?? []) : [];
    const mergedCities = useMemo(() => {
        const map = new Map<string, Geo>();
        [...citiesFromCountry, ...citiesFromRegion].forEach((c) => map.set(c.id, c));
        return Array.from(map.values()).sort((a, b) => getLocalizedGeoName(a).localeCompare(getLocalizedGeoName(b)));
    }, [citiesFromCountry, citiesFromRegion, getLocalizedGeoName]);

    const countryValue = selectedCountry ?? null;
    const regionValue = place.regionId ? regions.find(r => r.id === place.regionId) ?? null : null;
    const cityValue = place.cityId ? mergedCities.find(c => c.id === place.cityId) ?? null : null;

    const errorText = errorKey ? (
        errorKey === "loadPlaces" || errorKey === "unloadPlaces" ? t('addTransport.errors.selectCountryLoad') : ""
    ) : "";


    return (
        <Stack spacing={1.25}>
            <Autocomplete
                options={countries}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={countryValue}
                onChange={(_, v) => {
                    onChange({ ...place, countryId: v?.id ?? null, regionId: null, cityId: null });
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        fullWidth 
                        label={labelPrefix.includes("загрузки") ? t('addTransport.fields.countryLoad') : t('addTransport.fields.countryUnload')} 
                        placeholder={t('addTransport.fields.startTypingCountry')} 
                    />
                )}
            />

            <Autocomplete
                options={regions}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={regionValue}
                onChange={(_, v) => {
                    onChange({ ...place, regionId: v?.id ?? null, cityId: null });
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        fullWidth 
                        label={labelPrefix.includes("загрузки") ? t('addTransport.fields.regionLoad') : t('addTransport.fields.regionUnload')} 
                        placeholder={t('addTransport.fields.startTypingRegion')} 
                    />
                )}
                disabled={!selectedCountry || regions.length === 0}
            />

            <Autocomplete
                options={mergedCities}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={cityValue}
                onChange={(_, v) => onChange({ ...place, cityId: v?.id ?? null })}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        fullWidth 
                        label={labelPrefix.includes("загрузки") ? t('addTransport.fields.cityLoad') : t('addTransport.fields.cityUnload')} 
                        placeholder={t('addTransport.fields.startTypingCity')} 
                    />
                )}
                disabled={!selectedCountry || mergedCities.length === 0}
            />

            {showRemove && (
                <Button
                    variant="text"
                    color="error"
                    onClick={onRemove}
                    sx={{ alignSelf: "flex-start", minWidth: 40, mt: 0.5, textTransform: "none" }}
                >
                    {t('addTransport.fields.removePoint')}
                </Button>
            )}

            {!!errorText && <Typography variant="caption" color="error">{errorText}</Typography>}
        </Stack>
    );
}

export default function AddTransportPage() {
    const { t, i18n } = useTranslation();
    const { getLocalizedLabel, findLocalizedLabel } = useLocalizedLookup();
    const { lookups, geos, loadInit, loading: loadingInit } = useInitStore();
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const vehicleOpts   = useMemo(() => lookups?.vehicleType ?? [],    [lookups]);
    const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
    const payTermOpts   = useMemo(() => lookups?.paymentTerms ?? [],   [lookups]);
    const currencyOpts  = useMemo(() => lookups?.currency ?? [],       [lookups]);


    const [form, setForm] = useState<FormValues>({
        dateFrom: "", dateTo: "",
        loadPlaces: [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],
        unloadPlaces: [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],

        vehicleType: "",
        vehiclesCount: 1,

        capacityTons: undefined, volumeM3: undefined,
        dimsEnabled: false, bodyLength: undefined, bodyWidth: undefined, bodyHeight: undefined,

        currency: "", price: undefined, priceUnit: "Total",

        tax: "", paymentMethod: "", paymentTerm: "", bargaining: "possible",

        contactSecondary: "",
        email: "",
        note: "",
        extraPhoneAsMain: false,
    });

    const currentCurrency = form.currency || currencyOpts[0]?.slug || "USD";

    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        t('addTransport.steps.datesRoutes'),
        t('addTransport.steps.transportInfo'), 
        t('addTransport.steps.characteristics'),
        t('addTransport.steps.payment'),
        t('addTransport.steps.contacts')
    ];

    useEffect(() => {
        if (lookups && !loadingInit) {
            const currency = lookups.currency[0]?.slug     ?? "";
            const vehicle  = lookups.vehicleType[0]?.slug  ?? "";
            setForm(s => ({ ...s, currency, vehicleType: vehicle }));
        }
    }, [lookups, loadingInit]);



    const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setForm((s) => ({ ...s, [key]: value }));

    const updateLoad = (idx: number, p: Place) =>
        setField("loadPlaces", form.loadPlaces.map((x, i) => (i === idx ? p : x)));
    const updateUnload = (idx: number, p: Place) =>
        setField("unloadPlaces", form.unloadPlaces.map((x, i) => (i === idx ? p : x)));
    const rmLoad = (i: number) => setField("loadPlaces", form.loadPlaces.filter((_, idx) => idx !== i));
    const rmUnload = (i: number) => setField("unloadPlaces", form.unloadPlaces.filter((_, idx) => idx !== i));

    const num = (v: string) => (v === "" ? undefined : Number(v));

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = t('addTransport.errors.required');

        if (!form.loadPlaces[0]?.countryId) e.loadPlaces = t('addTransport.errors.selectCountryLoad');
        if (!form.unloadPlaces[0]?.countryId) e.unloadPlaces = t('addTransport.errors.selectCountryUnload');

        if (!form.vehicleType) e.vehicleType = t('addTransport.errors.selectVehicleType');
        if (!form.paymentMethod) e.paymentMethod = t('addTransport.errors.selectPaymentMethod');
        if (!form.paymentTerm) e.paymentTerm = t('addTransport.errors.selectPaymentTerm');
        if (form.dimsEnabled) {
            if (form.bodyLength == null || form.bodyWidth == null || form.bodyHeight == null) {
                e.bodyHeight = t('addTransport.errors.fillAllDimensions');
            }
        }
        if (form.contactSecondary && !/^\+?[1-9]\d{9,19}$/.test(form.contactSecondary)) {
            e.contactSecondary = t('addTransport.errors.invalidPhone');
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const placeToPoint = (p: Place, type: "DEPARTURE" | "ARRIVAL"): CreateTransportDto["points"][number] => {
        return {
            type,
            country: p.countryId || "Unknown",
            region: p.regionId,
            city: p.cityId,
            address: p.address ?? null,
        };
    };

    const toDto = (v: FormValues): CreateTransportDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const firstLoad = v.loadPlaces[0] || {};
        const firstUnload = v.unloadPlaces[0] || {};

        const points: CreateTransportDto["points"] = [
            placeToPoint(firstLoad, "DEPARTURE"),
            placeToPoint(firstUnload, "ARRIVAL"),
        ];

        const hasDims = v.dimsEnabled && 
            ((v.bodyLength != null && v.bodyLength > 0) ||
             (v.bodyWidth != null && v.bodyWidth > 0) ||
             (v.bodyHeight != null && v.bodyHeight > 0));

        return {
            images: undefined,

            date_from: v.dateFrom || null,
            date_to: v.dateTo || null,

            vehicle_type: (v.vehicleType as CreateTransportDto["vehicle_type"]) || "ANY",

            cars_count: Number.isFinite(v.vehiclesCount) ? v.vehiclesCount : 1,
            weight_t: v.capacityTons ?? null,
            volume_m3: v.volumeM3 ?? null,

            has_dimensions: hasDims,
            ...(hasDims ? {
                length_m: v.bodyLength || undefined,
                width_m: v.bodyWidth || undefined,
                height_m: v.bodyHeight || undefined,
            } : {}),

            price_currency: v.currency,
            price_amount: v.price ?? 0,

            payment_method: (v.paymentMethod || null) as CreateTransportDto["payment_method"],
            payment_term: (v.paymentTerm || null) as CreateTransportDto["payment_term"],

            bargain,

            contact_extra_phone: v.contactSecondary ? v.contactSecondary : null,
            extra_phone_as_main: v.extraPhoneAsMain,
            note: v.note || null,

            points,
        };
    };

    const navigate = useNavigate();

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) {
            toast.warning(t('addTransport.validationWarning'));
            return;
        }
        try {
            const payload = toDto(form);
            await transportApi.create(payload);
            toast.success(t('addTransport.successMessage'));
            navigate("/dashboard/requests")
        } catch (error: any) {
            const message = error?.response?.data?.message || t('addTransport.errorMessage');
            toast.error(message);
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box className="add-transport-page">
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }} className="add-transport-page__paper">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} className="add-transport-page__header">
                <Box className="add-transport-page__icon">
                        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7"/><path d="M20.833 13.889c.48 0 .868.388.868.868v5.208h5.209a.868.868 0 1 1 0 1.736H21.7v5.209a.868.868 0 1 1-1.736 0V21.7h-5.208a.868.868 0 0 1 0-1.736h5.208v-5.208c0-.48.389-.868.868-.868" fill="#4472B8"/></svg>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="add-transport-page__title">{t('addTransport.pageTitle')}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="add-transport-page__subtitle">
                            {t('addTransport.pageSubtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }} className="add-transport-page__content-paper">
                <Typography variant="h6" mb={1} className="add-transport-page__title">{t('addTransport.infoTitle')}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2} className="add-transport-page__subtitle">
                    {t('addTransport.infoSubtitle')}
                </Typography>

                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Box component="form" noValidate onSubmit={onSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {t('addTransport.step')} {activeStep + 1} {t('addTransport.of')} {steps.length}: {steps[activeStep]}
                            </Typography>
                            <Box sx={{ width: '100%', bgcolor: '#E0E0E0', borderRadius: 1, height: 8 }}>
                                <Box 
                                    sx={{ 
                                        bgcolor: '#4472B8', 
                                        height: '100%', 
                                        borderRadius: 1,
                                        width: `${((activeStep + 1) / steps.length) * 100}%`,
                                        transition: 'width 0.3s ease'
                                    }} 
                                />
                            </Box>
                        </Box>

                        <Box sx={{ minHeight: '400px', mb: 3 }}>
                            {activeStep === 0 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addTransport.fields.dateFrom')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                            value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                            error={!!errors.dateFrom} helperText={errors.dateFrom}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addTransport.fields.dateTo')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                            value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                            error={!!errors.dateTo} helperText={errors.dateTo}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Stack spacing={1}>
                                            {form.loadPlaces.map((p, i) => (
                                                <PlaceRow
                                                    key={i}
                                                    labelPrefix={i === 0 ? "загрузки" : `загрузки ${i + 1}`}
                                                    place={p}
                                                    geos={geos ?? null}
                                                    errorKey={i === 0 ? errors.loadPlaces : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmLoad(i)}
                                                    onChange={(np) => updateLoad(i, np)}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Stack spacing={1}>
                                            {form.unloadPlaces.map((p, i) => (
                                                <PlaceRow
                                                    key={i}
                                                    labelPrefix={i === 0 ? "выгрузки" : `выгрузки ${i + 1}`}
                                                    place={p}
                                                    geos={geos ?? null}
                                                    errorKey={i === 0 ? errors.unloadPlaces : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmUnload(i)}
                                                    onChange={(np) => updateUnload(i, np)}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 1 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.vehicleType')}</Typography>
                                        <Select
                                            key={`vehicleType-${i18n.language}`}
                                            fullWidth
                                            displayEmpty
                                            value={form.vehicleType}
                                            onChange={(e) => setField("vehicleType", e.target.value as string)}
                                            renderValue={selected =>
                                                !selected ? <em style={{color:'#999'}}>{t('addTransport.fields.selectVehicleType')}</em>
                                                    : findLocalizedLabel(vehicleOpts, selected as string)
                                            }
                                        >
                                            <MenuItem value="">
                                                <em style={{ color: '#999' }}>{t('addTransport.fields.selectVehicleType')}</em>
                                            </MenuItem>
                                            {vehicleOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                        </Select>
                                        {errors.vehicleType && (
                                            <Typography variant="caption" color="error">{errors.vehicleType}</Typography>
                                        )}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.vehiclesCount')}</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder={t('addTransport.fields.vehiclesCountPlaceholder')}
                                            value={form.vehiclesCount ?? ""} 
                                            onChange={(e) => setField("vehiclesCount", Number(e.target.value || 0))}
                                        />
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.capacity')}</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder={t('addTransport.fields.capacityPlaceholder')}
                                            value={form.capacityTons ?? ""} 
                                            onChange={(e) => setField("capacityTons", num(e.target.value))}
                                        />
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.volume')}</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder={t('addTransport.fields.volumePlaceholder')}
                                            value={form.volumeM3 ?? ""} 
                                            onChange={(e) => setField("volumeM3", num(e.target.value))}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 2 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.bodyDimensions')}</Typography>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            {t('addTransport.fields.bodyDimensionsSubtitle')}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    label={t('addTransport.fields.length')} type="number" placeholder={t('addTransport.fields.lengthPlaceholder')} fullWidth
                                                    value={form.bodyLength ?? ""} onChange={(e) => setField("bodyLength", num(e.target.value))}
                                                    error={!!errors.bodyHeight} helperText={errors.bodyHeight && "Fill all body dimensions"}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    label={t('addTransport.fields.width')} type="number" placeholder={t('addTransport.fields.widthPlaceholder')} fullWidth
                                                    value={form.bodyWidth ?? ""} onChange={(e) => setField("bodyWidth", num(e.target.value))}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    label={t('addTransport.fields.height')} type="number" placeholder={t('addTransport.fields.heightPlaceholder')} fullWidth
                                                    value={form.bodyHeight ?? ""} onChange={(e) => setField("bodyHeight", num(e.target.value))}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 3 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <FormControl fullWidth>
                                            <InputLabel shrink>{t('addTransport.fields.price')}</InputLabel>
                                            <OutlinedInput
                                                label={t('addTransport.fields.price')}
                                                value={form.price ?? ""}
                                                onChange={(e) => setField("price", num(e.target.value))}
                                                type="number"
                                                className="price-input-field"
                                                startAdornment={
                                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                                        <Select
                                                            value={currentCurrency}
                                                            onChange={e => setField("currency", e.target.value as string)}
                                                            variant="standard"
                                                            disableUnderline
                                                            displayEmpty
                                                            sx={{
                                                                minWidth: 80,
                                                                fontWeight: 500,
                                                                ".MuiSelect-select": { py: 0.5, pl: 0, pr: "24px !important" },
                                                            }}
                                                            disabled={currencyOpts.length === 0}
                                                        >
                                                            {currencyOpts.length
                                                                ? currencyOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)
                                                                : <MenuItem value="USD">USD</MenuItem>}
                                                        </Select>
                                                    </InputAdornment>
                                                }
                                                sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.paymentMethod')}</Typography>
                                        <Select
                                            key={`paymentMethod-${i18n.language}`}
                                            fullWidth
                                            displayEmpty
                                            value={form.paymentMethod || ""}
                                            onChange={e => setField("paymentMethod", e.target.value as string)}
                                            renderValue={sel => !sel
                                                ? <em style={{color:'#999'}}>{t('addTransport.fields.selectPaymentMethod')}</em>
                                                : findLocalizedLabel(payMethodOpts, sel as string)}
                                        >
                                            <MenuItem value=""><em style={{color:'#999'}}>{t('addTransport.fields.selectPaymentMethod')}</em></MenuItem>
                                            {payMethodOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                        </Select>

                                        {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.paymentTerm')}</Typography>
                                        <Select
                                            key={`paymentTerm-${i18n.language}`}
                                            fullWidth
                                            displayEmpty
                                            value={form.paymentTerm || ""}
                                            onChange={e => setField("paymentTerm", e.target.value as string)}
                                            renderValue={sel => !sel
                                                ? <em style={{color:'#999'}}>{t('addTransport.fields.selectPaymentTerm')}</em>
                                                : findLocalizedLabel(payTermOpts, sel as string)}
                                        >
                                            <MenuItem value=""><em style={{color:'#999'}}>{t('addTransport.fields.selectPaymentTerm')}</em></MenuItem>
                                            {payTermOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                        </Select>

                                        {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.bargaining')}</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.bargaining}
                                            onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <em style={{ color: '#999' }}>{t('addTransport.fields.selectBargaining')}</em>;
                                                }
                                                    return selected === "possible" ? t('addTransport.fields.bargainingPossible') : t('addTransport.fields.bargainingNone');
                                            }}
                                        >
                                            <MenuItem value="possible">{t('addTransport.fields.bargainingPossible')}</MenuItem>
                                            <MenuItem value="none">{t('addTransport.fields.bargainingNone')}</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 4 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>{t('addTransport.fields.contactsTitle')}</Typography>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            {t('addTransport.fields.contactsSubtitle')}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.additionalPhone')}</Typography>
                                        <TextField
                                            placeholder="+380971234567"
                                            fullWidth
                                            value={form.contactSecondary ?? ""}
                                            onChange={(e) => setField("contactSecondary", e.target.value || undefined)}
                                            helperText={errors.contactSecondary ? errors.contactSecondary : ""}
                                            error={!!errors.contactSecondary}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={form.extraPhoneAsMain}
                                                    onChange={(e) => setField("extraPhoneAsMain", e.target.checked)}
                                                />
                                            }
                                            label={t('addTransport.fields.extraPhoneAsMainLabel')}
                                            sx={{ mt: 0.5 }}
                                        />
                                        <Button
                                            variant="text"
                                            sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                            onClick={() => setField("contactSecondary", "")}
                                        >
                                            {t('addTransport.fields.clearPhone')}
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addTransport.fields.email')} placeholder={t('addTransport.fields.emailPlaceholder')} fullWidth
                                            value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            className="additional-info-field"
                                            label={t('addTransport.fields.additionalInfo')} 
                                            placeholder={t('addTransport.fields.additionalInfoPlaceholder')}
                                            fullWidth 
                                            multiline 
                                            minRows={3}
                                            value={form.note ?? ""} 
                                            onChange={(e) => setField("note", e.target.value || undefined)}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Box>

                        <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            pt: 2,
                            borderTop: '1px solid #E0E0E0'
                        }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                sx={{ minWidth: 100 }}
                            >
                                {t('addTransport.buttons.back')}
                            </Button>
                            
                            <Typography variant="body2" color="text.secondary">
                                {activeStep + 1} / {steps.length}
                            </Typography>
                            
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ minWidth: 100 }}
                                    disabled={loadingInit}
                                >
                                    {t('addTransport.buttons.submit')}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ minWidth: 100 }}
                                >
                                    {t('addTransport.buttons.continue')}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Box component="form" onSubmit={onSubmit} noValidate className="add-transport-page__form">
                        <Grid container spacing={2}>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label={t('addTransport.fields.dateFrom')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                    value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                    error={!!errors.dateFrom} helperText={errors.dateFrom}
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label={t('addTransport.fields.dateTo')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                    value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                    error={!!errors.dateTo} helperText={errors.dateTo}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Stack flexDirection="column" spacing={1}>
                                    {form.loadPlaces.map((p, i) => (
                                        <PlaceRow
                                            key={i}
                                            labelPrefix={i === 0 ? "загрузки" : `загрузки ${i + 1}`}
                                            place={p}
                                            geos={geos ?? null}
                                            errorKey={i === 0 ? errors.loadPlaces : undefined}
                                            showRemove={i > 0}
                                            onRemove={() => rmLoad(i)}
                                            onChange={(np) => updateLoad(i, np)}
                                        />
                                    ))}
                                </Stack>
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Stack  flexDirection="column" spacing={1}>
                                    {form.unloadPlaces.map((p, i) => (
                                        <PlaceRow
                                            key={i}
                                            labelPrefix={i === 0 ? "выгрузки" : `выгрузки ${i + 1}`}
                                            place={p}
                                            geos={geos ?? null}
                                            errorKey={i === 0 ? errors.unloadPlaces : undefined}
                                            showRemove={i > 0}
                                            onRemove={() => rmUnload(i)}
                                            onChange={(np) => updateUnload(i, np)}
                                        />
                                    ))}
                                </Stack>
                            </Grid>

                            <Grid size={{ xs:12 }}>
                                 <Divider sx={{ my: 4 }} />
                            </Grid>

                        <Grid size={{xs:12, sm:6}}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.vehicleType')}</Typography>
                            <Select
                                key={`vehicleType-desktop-${i18n.language}`}
                                fullWidth 
                                displayEmpty
                                value={form.vehicleType}
                                onChange={(e) => setField("vehicleType", e.target.value as string)}
                                renderValue={(selected) => {
                                    if (!selected || selected === "") {
                                        return <em style={{ color: '#999' }}>{t('addTransport.fields.selectVehicleType')}</em>;
                                    }
                                    return findLocalizedLabel(vehicleOpts, selected as string);
                                }}
                            >
                                <MenuItem value="">
                                    <em style={{ color: '#999' }}>{t('addTransport.fields.selectVehicleType')}</em>
                                </MenuItem>
                                {vehicleOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                            </Select>
                            {errors.vehicleType && (
                                <Typography variant="caption" color="error">{errors.vehicleType}</Typography>
                            )}
                        </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label={t('addTransport.fields.vehiclesCount')} type="number" fullWidth
                                    value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", Number(e.target.value || 0))}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.length')}</Typography>
                                <TextField
                                    type="number" placeholder={t('addTransport.fields.lengthPlaceholder')} fullWidth
                                    value={form.bodyLength ?? ""} onChange={(e) => setField("bodyLength", num(e.target.value))}
                                    error={!!errors.bodyHeight} helperText={errors.bodyHeight && "Fill all body dimensions"}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.width')}</Typography>
                                <TextField
                                    type="number" placeholder={t('addTransport.fields.widthPlaceholder')} fullWidth
                                    value={form.bodyWidth ?? ""} onChange={(e) => setField("bodyWidth", num(e.target.value))}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.height')}</Typography>
                                <TextField
                                    type="number" placeholder={t('addTransport.fields.heightPlaceholder')} fullWidth
                                    value={form.bodyHeight ?? ""} onChange={(e) => setField("bodyHeight", num(e.target.value))}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label={t('addTransport.fields.volume')} type="number" fullWidth placeholder={t('addTransport.fields.volumePlaceholder')}
                                    value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label={t('addTransport.fields.weight')} type="number" fullWidth placeholder={t('addTransport.fields.weightPlaceholder')}
                                    value={form.capacityTons ?? ""} onChange={(e) => setField("capacityTons", num(e.target.value))}
                                />
                            </Grid>


                            <Grid size={{ xs:12, sm:6 }}>
                                <FormControl fullWidth>
                                    <InputLabel shrink>{t('addTransport.fields.price')}</InputLabel>
                                    <OutlinedInput
                                        label={t('addTransport.fields.price')}
                                        value={form.price ?? ""}
                                        onChange={(e) => setField("price", num(e.target.value))}
                                        type="number"
                                        className="price-input-field"
                                        startAdornment={
                                            <InputAdornment position="start" sx={{ mr: 1 }}>
                                                <Select
                                                    value={currentCurrency}
                                                    onChange={e => setField("currency", e.target.value as string)}
                                                    variant="standard"
                                                    disableUnderline
                                                    displayEmpty
                                                    sx={{
                                                        minWidth: 80,
                                                        fontWeight: 500,
                                                        ".MuiSelect-select": { py: 0.5, pl: 0, pr: "24px !important" },
                                                    }}
                                                    disabled={currencyOpts.length === 0}
                                                >
                                                    {currencyOpts.length
                                                        ? currencyOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)
                                                        : <MenuItem value="USD">USD</MenuItem>}
                                                </Select>
                                            </InputAdornment>
                                        }
                                        sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
                                    />
                                </FormControl>
                            </Grid>


                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.paymentMethod')}</Typography>
                                <Select
                                    key={`paymentMethod-desktop-${i18n.language}`}
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentMethod} 
                                    onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>{t('addTransport.fields.selectPaymentMethod')}</em>;
                                        }
                                        return findLocalizedLabel(payMethodOpts, selected as string);
                                    }}
                                >
                                    <MenuItem value="">
                                        <em style={{ color: '#999' }}>{t('addTransport.fields.selectPaymentMethod')}</em>
                                    </MenuItem>
                                    {payMethodOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                </Select>
                                {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.paymentTerm')}</Typography>
                                <Select
                                    key={`paymentTerm-desktop-${i18n.language}`}
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentTerm} 
                                    onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>{t('addTransport.fields.selectPaymentTerm')}</em>;
                                        }
                                        return findLocalizedLabel(payTermOpts, selected as string);
                                    }}
                                >
                                    <MenuItem value="">
                                        <em style={{ color: '#999' }}>{t('addTransport.fields.selectPaymentTerm')}</em>
                                    </MenuItem>
                                    {payTermOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                </Select>
                                {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.bargaining')}</Typography>
                                <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.bargaining}
                                    onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <em style={{ color: '#999' }}>{t('addTransport.fields.selectBargaining')}</em>;
                                        }
                                                    return selected === "possible" ? t('addTransport.fields.bargainingPossible') : t('addTransport.fields.bargainingNone');
                                    }}
                                >
                                    <MenuItem value="possible">{t('addTransport.fields.bargainingPossible')}</MenuItem>
                                    <MenuItem value="none">{t('addTransport.fields.bargainingNone')}</MenuItem>
                                </Select>
                            </Grid>

                            <Grid size={{ xs:12 }}>
                                    <Divider sx={{ my: 4 }} />
                                    <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>{t('addTransport.fields.contactsTitle')}</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                    {t('addTransport.fields.contactsSubtitle')}
                                    </Typography>
                                </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addTransport.fields.additionalPhone')}</Typography>
                                <TextField
                                    placeholder="+380971234567"
                                    fullWidth
                                    value={form.contactSecondary ?? ""}
                                    onChange={(e) => setField("contactSecondary", e.target.value || undefined)}
                                    helperText={errors.contactSecondary ? errors.contactSecondary : ""}
                                    error={!!errors.contactSecondary}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={form.extraPhoneAsMain}
                                            onChange={(e) => setField("extraPhoneAsMain", e.target.checked)}
                                        />
                                    }
                                    label={t('addTransport.fields.extraPhoneAsMainLabel')}
                                    sx={{ mt: 0.5 }}
                                />
                                <Button
                                    variant="text"
                                    sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                    onClick={() => setField("contactSecondary", "")}
                                >
                                    {t('addTransport.fields.clearPhone')}
                                </Button>
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label={t('addTransport.fields.email')} placeholder={t('addTransport.fields.emailPlaceholder')} fullWidth
                                    value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                                />
                            </Grid>

                            <Grid size={{xs:12}}>
                                <TextField
                                    label={t('addTransport.fields.additionalInfo')} placeholder={t('addTransport.fields.additionalInfoPlaceholder')}
                                    fullWidth multiline minRows={3} className="additional-info-field"
                                    value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                                />
                            </Grid>

                            <Grid size={{xs:12}}>
                                <Stack direction="row" justifyContent="center" mt={1.5}>
                                    <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit}>
                                        {t('addTransport.buttonSubmit')}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
