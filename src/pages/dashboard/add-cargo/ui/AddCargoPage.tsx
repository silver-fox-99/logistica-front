import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider, FormControl,
    Checkbox, FormControlLabel, Select, MenuItem, Autocomplete, InputLabel, OutlinedInput, InputAdornment,
    type InputBaseComponentProps
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { cargoApi, type CreateCargoDto } from "@/shared/api/cargoApi";
import {useNavigate} from "react-router-dom";
import { useLocalizedLookup, useLocalizedGeo, type LookupOpt } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";

import './AddCargoPage.scss';

type Place = {
    countryId?: string | null;
    regionId?: string | null;
    cityId?: string | null;
    address?: string | null;
};

type Dims = { length?: number; width?: number; height?: number };

type FormValues = {
    dateFrom: string;
    dateTo: string;

    pickups: Place[];
    dropoffs: Place[];

    cargoType: string;
    vehicleType: string;
    loadType: string[];
    allowPartial: boolean;

    vehiclesCount?: number;
    palletsCount?: number;
    weightTons?: number;
    volumeM3?: number;

    dims: Dims;

    currency: string;
    price?: number;
    paymentMethod: string;
    paymentTerm: string;
    bargaining: "possible" | "none";

    contactSecondary?: string;
    extraPhoneAsMain: boolean;
    note?: string;
};

type PlaceRowProps = {
    labelPrefix: string;
    place: Place;
    onChange: (p: Place) => void;
    countries: GeoImportItem[];
    regions: GeoImportItem[];
    cities: GeoImportItem[];
    loadingCountries: boolean;
    loadingRegions: boolean;
    loadingCities: boolean;
    errorText?: string;
    showRemove?: boolean;
    onRemove?: () => void;
    onCountryLoad?: (id?: string | null) => void;
    onRegionLoad?: (countryId?: string | null, regionId?: string | null) => void;
};

function PlaceRow({
                      labelPrefix, place, onChange, countries, regions, cities,
                      loadingCountries, loadingRegions, loadingCities,
                      errorText, showRemove, onRemove, onCountryLoad, onRegionLoad
                  }: PlaceRowProps) {
    const { t } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const countryValue = place.countryId ? countries.find((c) => c.id === place.countryId) ?? null : null;
    const regionValue = place.regionId ? regions.find((r) => r.id === place.regionId) ?? null : null;
    const cityValue = place.cityId ? cities.find((c) => c.id === place.cityId) ?? null : null;

    return (
        <Stack spacing={1.25}>
            <Autocomplete
                options={countries}
                getOptionLabel={(o) => getLocalizedGeoName(o) || o.name || ""}
                value={countryValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, v) => {
                    onChange({ ...place, countryId: v?.id ?? null, regionId: null, cityId: null });
                    onCountryLoad?.(v?.id ?? null);
                }}
                noOptionsText={loadingCountries ? "Загрузка..." : (countries.length > 0 ? (t('addCargo.fields.noOptions') || "Нет вариантов") : "Данные не загружены")}
                loading={loadingCountries}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? t('addCargo.fields.countryLoad') : t('addCargo.fields.countryUnload')} placeholder={t('addCargo.fields.startTypingCountry')} />
                )}
            />

            <Autocomplete
                options={regions}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={regionValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, v) => {
                    onChange({ ...place, regionId: v?.id ?? null, cityId: null });
                    onRegionLoad?.(place.countryId ?? null, v?.id ?? null);
                }}
                disabled={!countryValue || regions.length === 0}
                loading={loadingRegions}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? t('addCargo.fields.regionLoad') : t('addCargo.fields.regionUnload')} placeholder={t('addCargo.fields.startTypingRegion')}/>
                )}
            />

            <Autocomplete
                options={cities}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={cityValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, v) => onChange({ ...place, cityId: v?.id ?? null })}
                disabled={!countryValue || cities.length === 0}
                loading={loadingCities}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? t('addCargo.fields.cityLoad') : t('addCargo.fields.cityUnload')} placeholder={t('addCargo.fields.startTypingCity')}/>
                )}
            />

            {showRemove && (
                <Button
                    variant="text"
                    color="error"
                    onClick={onRemove}
                    sx={{ alignSelf: "flex-start", minWidth: 40, mt: 0.5, textTransform: "none" }}
                >
                    {t('addCargo.fields.removePoint')}
                </Button>
            )}

            {!!errorText && <Typography variant="caption" color="error">{errorText}</Typography>}
        </Stack>
    );
}

export default function AddCargoPage() {
    const { t, i18n } = useTranslation();
    const { getLocalizedLabel, findLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit, loading: loadingInit } = useInitStore();
    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
        loading: geoLoading,
        findById
    } = useGeoCascade();
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        loadInit();
    }, [loadInit]);
    useEffect(() => { void loadCountries(); }, []);

    const currencyOpts   = useMemo(() => lookups?.currency ?? [],        [lookups]);
    const vehicleOpts    = useMemo(() => lookups?.vehicleType ?? [],     [lookups]);
    const loadOpts       = useMemo(() => lookups?.loadType ?? [],        [lookups]);
    const cargoOpts      = useMemo(() => lookups?.cargoTypes ?? [],      [lookups]);
    const payMethodOpts  = useMemo(() => lookups?.paymentMethods ?? [],  [lookups]);
    const payTermOpts    = useMemo(() => lookups?.paymentTerms ?? [],    [lookups]);


    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [form, setForm] = useState<FormValues>({
        dateFrom: getTodayDate(), dateTo: "",
        pickups:  [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],
        dropoffs: [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],

        cargoType: "",
        vehicleType: "",
        loadType: [], // убираем дефолтный ANY
        allowPartial: false,

        vehiclesCount: 1,
        palletsCount: undefined,
        weightTons: undefined,
        volumeM3: undefined,

        dims: { length: undefined, width: undefined, height: undefined },

        currency: "",
        price: undefined,
        paymentMethod: "",
        paymentTerm: "",
        bargaining: "possible",

        contactSecondary: "",
        note: "",
        extraPhoneAsMain: false,
    });

    const currentCurrency = form.currency || currencyOpts[0]?.slug || "USD";
    const [errors, setErrors] = useState<Record<string, string>>({});



    const steps = [
        t('addCargo.steps.datesRoutes'),
        t('addCargo.steps.cargoInfo'), 
        t('addCargo.steps.dimensions'),
        t('addCargo.steps.payment'),
        t('addCargo.steps.contacts')
    ];

    useEffect(() => {
        if (lookups && !loadingInit) {
            const currency = lookups.currency[0]?.slug   ?? "";
            const vehicle  = lookups.vehicleType[0]?.slug ?? "";
            const cargo    = lookups.cargoTypes?.[0]?.slug  ?? "";
            setForm((s) => ({ ...s, currency, vehicleType: vehicle, cargoType: cargo, loadType: [] }));
        }
    }, [lookups, loadingInit]);

    const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setForm((s) => ({ ...s, [key]: value }));

    const sanitizeDigits = (v: string) => v.replace(/\D/g, "");
    const num = (v: string) => {
        const cleaned = sanitizeDigits(v);
        return cleaned === "" ? undefined : Number(cleaned);
    };
    const numericInputProps: InputBaseComponentProps = { inputMode: "numeric", pattern: "[0-9]*" };

    const updatePickup = (idx: number, p: Place) =>
        setField("pickups", form.pickups.map((x, i) => (i === idx ? p : x)));
    const updateDropoff = (idx: number, p: Place) =>
        setField("dropoffs", form.dropoffs.map((x, i) => (i === idx ? p : x)));

    const rmPickup = (i: number) => setField("pickups", form.pickups.filter((_, idx) => idx !== i));
    const rmDropoff = (i: number) => setField("dropoffs", form.dropoffs.filter((_, idx) => idx !== i));

    /* ===== validation ===== */
    const validate = () => {
        const e: Record<string, string> = {};
        if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom) e.dateTo = t('addCargo.errors.dateOrder');

        if (!form.pickups[0]?.countryId) e.pickups = t('addCargo.errors.selectCountryLoad');
        if (!form.dropoffs[0]?.countryId) e.dropoffs = t('addCargo.errors.selectCountryUnload');

        if (!form.cargoType) e.cargoType = t('addCargo.errors.selectCargoType');
        if (!form.vehicleType) e.vehicleType = t('addCargo.errors.selectVehicleType');
       // if (!form.loadType || form.loadType.length === 0) e.loadType = t('addCargo.errors.selectLoadType');

        if (form.contactSecondary && !/^\+?[1-9]\d{9,19}$/.test(form.contactSecondary)) {
            e.contactSecondary = t('addCargo.errors.invalidPhone');
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const getGeoName = (id?: string | null) => {
        if (!id) return "";
        return findById(id)?.name ?? "";
    };

    /* ===== UI -> DTO ===== */
    const toDto = (v: FormValues): CreateCargoDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const firstPickup = v.pickups[0] || {};
        const firstDrop   = v.dropoffs[0] || {};

        const getName = (id?: string | null) => getGeoName(id);

        const anyDim =
                (v.dims && v.dims.length != null && v.dims.length > 0) ||
                (v.dims && v.dims.width != null && v.dims.width > 0) ||
                (v.dims && v.dims.height != null && v.dims.height > 0);

        const countryFromName = getName(firstPickup.countryId) || "Unknown";

        return {
            date_from: v.dateFrom || "",
            date_to: v.dateTo || "",

            country_from: countryFromName,

            vehicle_type: (v.vehicleType as CreateCargoDto["vehicle_type"]) || "ANY",
            load_type: (v.loadType as CreateCargoDto["load_type"]),
            cargo_type: (v.cargoType as CreateCargoDto["cargo_type"]) || "GENERAL",
            allow_partial_load: !!v.allowPartial,

            weight_t: v.weightTons ?? 0,
            volume_m3: v.volumeM3 ?? 0,
            cars_count: v.vehiclesCount ?? 0,
            pallets_count: v.palletsCount ?? 0,

            has_dimensions: anyDim,
            ...(anyDim
                ? {
                    length_m: v.dims.length || undefined,
                    width_m:  v.dims.width  || undefined,
                    height_m: v.dims.height || undefined,
                }
                : {}),

            price_currency: v.currency || "",
            price_amount: v.price ?? 0,

            payment_method: v.paymentMethod || "",
            payment_term: v.paymentTerm || "",

            bargain,

            contact_extra_phone: v.contactSecondary || undefined,
            note: v.note || undefined,
            extra_phone_as_main: v.extraPhoneAsMain,

            points: [
                {
                    type: "PICKUP",
                    country: firstPickup.countryId || "",
                    region: firstPickup.regionId || "",
                    city:   firstPickup.cityId   || "",
                    address: firstPickup.address || "",
                },
                {
                    type: "DROPOFF",
                    country: firstDrop.countryId || "",
                    region:  firstDrop.regionId  || "",
                    city:    firstDrop.cityId  || "",
                    address: firstDrop.address || "",
                }
            ],
        };
    };

    const navigate = useNavigate();

    const getErrorMessage = (error: any) => {
        const code = error?.response?.data?.code;
        const serverMessage = error?.response?.data?.message;
        if (code) {
            const translated = t(`apiErrors.${code}`, serverMessage);
            if (translated) return translated;
        }
        return serverMessage || t('addCargo.errorMessage');
    };

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) {
            toast.warning(t('addCargo.validationWarning'));
            return;
        }
        try {
            const payload = toDto(form);
            await cargoApi.create(payload);
            toast.success(t('addCargo.successMessage'));
            navigate("/dashboard/requests");
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box className="add-cargo-page">
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }} className="add-cargo-page__paper">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} className="add-cargo-page__header">
                    <Box className="add-cargo-page__icon">
                        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7"/><path d="M20.833 13.889c.48 0 .868.388.868.868v5.208h5.209a.868.868 0 1 1 0 1.736H21.7v5.209a.868.868 0 1 1-1.736 0V21.7h-5.208a.868.868 0 0 1 0-1.736h5.208v-5.208c0-.48.389-.868.868-.868" fill="#4472B8"/></svg>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="add-cargo-page__title">{t('addCargo.pageTitle')}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="add-cargo-page__subtitle">
                            {t('addCargo.pageSubtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }} className="add-cargo-page__content-paper">
            <Typography variant="h6" mb={1} className="add-cargo-page__title">{t('addCargo.infoTitle')}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2} className="add-cargo-page__subtitle">
                    {t('addCargo.infoSubtitle')}
                </Typography>

                {/* Мобильная версия - Stepper экранами */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Box component="form" noValidate onSubmit={onSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {t('addCargo.step')} {activeStep + 1} {t('addCargo.of')} {steps.length}: {steps[activeStep]}
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
                                            label={t('addCargo.fields.dateFrom')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                            value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                            error={!!errors.dateFrom} helperText={errors.dateFrom}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addCargo.fields.dateTo')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                            value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                            error={!!errors.dateTo} helperText={errors.dateTo}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Stack spacing={1}>
                                            {form.pickups.map((p, i) => (
                                                <PlaceRow
                                                    key={i}
                                                    labelPrefix={i === 0 ? "Страна загрузки" : `Страна загрузки ${i + 1}`}
                                                    place={p}
                                                    countries={countries}
                                                    regions={getRegions(p.countryId)}
                                                    cities={getCities(p.countryId, p.regionId)}
                                                    loadingCountries={geoLoading.countries}
                                                    loadingRegions={geoLoading.regionsFor === (p.countryId || "")}
                                                    loadingCities={geoLoading.citiesFor === `${p.countryId}/${p.regionId}`}
                                                    errorText={i === 0 ? errors.pickups : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmPickup(i)}
                                                    onChange={(np) => updatePickup(i, np)}
                                                    onCountryLoad={(id) => ensureRegions(id)}
                                                    onRegionLoad={(countryId, regionId) => ensureCities(countryId, regionId)}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Stack spacing={1}>
                                            {form.dropoffs.map((p, i) => (
                                                <PlaceRow
                                                    key={i}
                                                    labelPrefix={i === 0 ? "Страна выгрузки" : `Страна выгрузки ${i + 1}`}
                                                    place={p}
                                                    countries={countries}
                                                    regions={getRegions(p.countryId)}
                                                    cities={getCities(p.countryId, p.regionId)}
                                                    loadingCountries={geoLoading.countries}
                                                    loadingRegions={geoLoading.regionsFor === (p.countryId || "")}
                                                    loadingCities={geoLoading.citiesFor === `${p.countryId}/${p.regionId}`}
                                                    errorText={i === 0 ? errors.dropoffs : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmDropoff(i)}
                                                    onChange={(np) => updateDropoff(i, np)}
                                                    onCountryLoad={(id) => ensureRegions(id)}
                                                    onRegionLoad={(countryId, regionId) => ensureCities(countryId, regionId)}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 1 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.cargoType')}</Typography>
                                        <Autocomplete
                                            key={`cargoType-${i18n.language}`}
                                            options={cargoOpts}
                                            getOptionLabel={(o) => getLocalizedLabel(o)}
                                            value={cargoOpts.find((o) => o.slug === form.cargoType) || null}
                                            onChange={(_, v) => setField("cargoType", v?.slug || "")}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    label={t('addCargo.fields.cargoType')}
                                                    placeholder={t('addCargo.fields.selectCargoType')}
                                                />
                                            )}
                                        />
                                        {errors.cargoType && <Typography variant="caption" color="error">{errors.cargoType}</Typography>}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.vehicleType')}</Typography>
                                        <Autocomplete
                                            key={`vehicleType-${i18n.language}`}
                                            options={vehicleOpts}
                                            getOptionLabel={(o) => getLocalizedLabel(o)}
                                            value={vehicleOpts.find((o) => o.slug === form.vehicleType) || null}
                                            onChange={(_, v) => setField("vehicleType", v?.slug || "")}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    label={t('addCargo.fields.vehicleType')}
                                                    placeholder={t('addCargo.fields.selectVehicleType')}
                                                />
                                            )}
                                        />
                                        {errors.vehicleType && <Typography variant="caption" color="error">{errors.vehicleType}</Typography>}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.loadType')}</Typography>
                                        <Autocomplete
                                            multiple
                                            key={`loadType-${i18n.language}`}
                                            options={loadOpts}
                                            getOptionLabel={(o) => getLocalizedLabel(o)}
                                            value={loadOpts.filter((o) => (form.loadType || []).includes(o.slug))}
                                            onChange={(_, v) => setField("loadType", v.map((opt) => opt.slug))}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    label={t('addCargo.fields.loadType')}
                                                    placeholder={t('addCargo.fields.selectLoadType')}
                                                />
                                            )}
                                        />
                                        {errors.loadType && <Typography variant="caption" color="error">{errors.loadType}</Typography>}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.allowPartial')}</Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={form.allowPartial}
                                                    onChange={(e) => setField("allowPartial", e.target.checked)}
                                                />
                                            }
                                            label={t('addCargo.fields.allowPartialLabel')}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 2 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.weightTons')}</Typography>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            placeholder={t('addCargo.fields.weightPlaceholder')}
                                            inputProps={numericInputProps}
                                            value={form.weightTons ?? ""} 
                                            onChange={(e) => setField("weightTons", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addCargo.fields.volume')} type="text" fullWidth placeholder={t('addCargo.fields.volumePlaceholder')}
                                            inputProps={numericInputProps}
                                            value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addCargo.fields.vehiclesCount')} type="text" fullWidth placeholder={t('addCargo.fields.vehiclesCountPlaceholder')}
                                            inputProps={numericInputProps}
                                            value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.palletsCount')}</Typography>
                                        <TextField
                                            type="text" 
                                            fullWidth
                                            placeholder={t('addCargo.fields.palletsCountPlaceholder')}
                                            inputProps={numericInputProps}
                                            value={form.palletsCount ?? ""} 
                                            onChange={(e) => setField("palletsCount", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.dimensions')}</Typography>

                                        <Grid container spacing={1}>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    type="text" placeholder={t('addCargo.fields.length')} fullWidth
                                                    inputProps={numericInputProps}
                                                    value={form.dims.length ?? ""} onChange={(e) => setField("dims", { ...form.dims, length: num(e.target.value) })}
                                                    error={!!errors.dims} helperText={errors.dims && "Fill all dimensions"}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    type="text" placeholder={t('addCargo.fields.width')} fullWidth
                                                    inputProps={numericInputProps}
                                                    value={form.dims.width ?? ""} onChange={(e) => setField("dims", { ...form.dims, width: num(e.target.value) })}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    type="text" placeholder={t('addCargo.fields.height')} fullWidth
                                                    inputProps={numericInputProps}
                                                    value={form.dims.height ?? ""} onChange={(e) => setField("dims", { ...form.dims, height: num(e.target.value) })}
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
                                            <InputLabel shrink>{t('addCargo.fields.price')}</InputLabel>
                                            <OutlinedInput
                                                label={t('addCargo.fields.price')}
                                                value={form.price ?? ""}
                                                onChange={(e) => setField("price", num(e.target.value))}
                                                type="text"
                                                inputProps={numericInputProps}
                                                className="price-input-field"
                                                startAdornment={
                                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                                        <Select
                                                            value={currentCurrency}
                                                            onChange={(e) => setField("currency", e.target.value as string)}
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
                                                                ? currencyOpts.map((c: LookupOpt) => <MenuItem key={c.slug} value={c.slug}>{getLocalizedLabel(c)}</MenuItem>)
                                                                : <MenuItem value="USD">USD</MenuItem>}
                                                        </Select>
                                                    </InputAdornment>
                                                }
                                                sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.paymentMethod')}</Typography>
                                        <Select
                                            key={`paymentMethod-${i18n.language}`}
                                            fullWidth 
                                            displayEmpty
                                            value={form.paymentMethod || ""} 
                                            onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>{t('addCargo.fields.selectPaymentMethod')}</em>;
                                                }
                                                return findLocalizedLabel(payMethodOpts, selected as string);
                                            }}
                                        >
                                            {payMethodOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                        </Select>
                                        {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.paymentTerm')}</Typography>
                                        <Select
                                            key={`paymentTerm-${i18n.language}`}
                                            fullWidth 
                                            displayEmpty
                                            value={form.paymentTerm || ""} 
                                            onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>{t('addCargo.fields.selectPaymentTerm')}</em>;
                                                }
                                                return findLocalizedLabel(payTermOpts, selected as string);
                                            }}
                                        >
                                            {payTermOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>)}
                                        </Select>
                                        {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.bargaining')}</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.bargaining || ""} 
                                            onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <em style={{ color: '#999' }}>{t('addCargo.fields.selectBargaining')}</em>;
                                                }
                                                return selected === "possible" ? t('addCargo.fields.bargainingPossible') : t('addCargo.fields.bargainingNone');
                                            }}
                                        >
                                            <MenuItem value="possible">{t('addCargo.fields.bargainingPossible')}</MenuItem>
                                            <MenuItem value="none">{t('addCargo.fields.bargainingNone')}</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 4 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>{t('addCargo.fields.contactsTitle')}</Typography>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            {t('addCargo.fields.contactsSubtitle')}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.additionalPhone')}</Typography>
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
                                                    size="small"
                                                />
                                            }
                                            label={t('addCargo.fields.extraPhoneAsMainLabel')}
                                            sx={{ 
                                                mt: 1.5,
                                                ml: 0,
                                                backgroundColor: 'transparent',
                                                '& .MuiFormControlLabel-label': {
                                                    fontSize: '0.875rem'
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="text"
                                            sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                            onClick={() => setField("contactSecondary", "")}
                                        >
                                            {t('addCargo.fields.clearPhone')}
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label={t('addCargo.fields.additionalInfo')} placeholder={t('addCargo.fields.additionalInfoPlaceholder')}
                                            fullWidth multiline minRows={3}
                                            value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
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
                                {t('addCargo.buttons.back')}
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
                                    {t('addCargo.buttons.submit')}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ minWidth: 100 }}
                                >
                                    {t('addCargo.buttons.continue')}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Десктопная версия */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Box component="form" noValidate onSubmit={onSubmit}>
                        <Grid container spacing={2}>
                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label={t('addCargo.fields.dateFrom')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                error={!!errors.dateFrom} helperText={errors.dateFrom}
                            />
                        </Grid>
                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label={t('addCargo.fields.dateTo')} type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                error={!!errors.dateTo} helperText={errors.dateTo}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Stack spacing={1}>
                                {form.pickups.map((p, i) => (
                                    <PlaceRow
                                        key={i}
                                            labelPrefix={i === 0 ? "Страна загрузки" : `Страна загрузки ${i + 1}`}
                                        place={p}
                                        countries={countries}
                                        regions={getRegions(p.countryId)}
                                        cities={getCities(p.countryId, p.regionId)}
                                        loadingCountries={geoLoading.countries}
                                        loadingRegions={geoLoading.regionsFor === (p.countryId || "")}
                                        loadingCities={geoLoading.citiesFor === `${p.countryId}/${p.regionId}`}
                                        errorText={i === 0 ? errors.pickups : undefined}
                                        showRemove={i > 0}
                                        onRemove={() => rmPickup(i)}
                                        onChange={(np) => updatePickup(i, np)}
                                        onCountryLoad={(id) => ensureRegions(id)}
                                        onRegionLoad={(countryId, regionId) => ensureCities(countryId, regionId)}
                                    />
                                ))}
                            </Stack>
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Stack spacing={1}>
                                {form.dropoffs.map((p, i) => (
                                    <PlaceRow
                                        key={i}
                                            labelPrefix={i === 0 ? "Страна выгрузки" : `Страна выгрузки ${i + 1}`}
                                        place={p}
                                        countries={countries}
                                        regions={getRegions(p.countryId)}
                                        cities={getCities(p.countryId, p.regionId)}
                                        loadingCountries={geoLoading.countries}
                                        loadingRegions={geoLoading.regionsFor === (p.countryId || "")}
                                        loadingCities={geoLoading.citiesFor === `${p.countryId}/${p.regionId}`}
                                        errorText={i === 0 ? errors.dropoffs : undefined}
                                        showRemove={i > 0}
                                        onRemove={() => rmDropoff(i)}
                                        onChange={(np) => updateDropoff(i, np)}
                                        onCountryLoad={(id) => ensureRegions(id)}
                                        onRegionLoad={(countryId, regionId) => ensureCities(countryId, regionId)}
                                    />
                                ))}
                            </Stack>
                        </Grid>

                            <Grid size={{ xs:12 }}>
                                        <Divider sx={{ my: 4 }} />
                            </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.cargoType')}</Typography>
                            <Select
                                    key={`cargoType-desktop-${i18n.language}`}
                                    fullWidth 
                                    displayEmpty
                                    value={form.cargoType || ""} 
                                    onChange={(e) => setField("cargoType", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>{t('addCargo.fields.selectCargoType')}</em>;
                                        }
                                        return findLocalizedLabel(cargoOpts, selected as string);
                                    }}
                            >
                                {cargoOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>
                                ))}
                            </Select>
                            {errors.cargoType && <Typography variant="caption" color="error">{errors.cargoType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.vehicleType')}</Typography>
                            <Select
                                    key={`vehicleType-desktop-${i18n.language}`}
                                    fullWidth 
                                    displayEmpty
                                    value={form.vehicleType || ""} 
                                    onChange={(e) => setField("vehicleType", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>{t('addCargo.fields.selectVehicleType')}</em>;
                                        }
                                        return findLocalizedLabel(vehicleOpts, selected as string);
                                    }}
                            >
                                    <MenuItem value="">
                                        <em style={{ color: '#999' }}>{t('addCargo.fields.selectVehicleType')}</em>
                                    </MenuItem>
                                {vehicleOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>
                                ))}
                            </Select>
                            {errors.vehicleType && <Typography variant="caption" color="error">{errors.vehicleType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.loadType')}</Typography>
                            <Select
                                    key={`loadType-desktop-${i18n.language}`}
                                    fullWidth 
                                    multiple
                                    displayEmpty
                                    value={form.loadType || []} 
                                    onChange={(e) => setField("loadType", typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                                    renderValue={(selected) => {
                                        if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                                            return <em style={{ color: '#999' }}>{t('addCargo.fields.selectLoadType')}</em>;
                                        }
                                        const selectedArray = Array.isArray(selected) ? selected : [selected];
                                        return selectedArray.map(slug => findLocalizedLabel(loadOpts, slug as string)).join(', ');
                                    }}
                            >
                                {loadOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>
                                ))}
                            </Select>
                            {errors.loadType && <Typography variant="caption" color="error">{errors.loadType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.allowPartial')}</Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.allowPartial}
                                        onChange={(e) => setField("allowPartial", e.target.checked)}
                                    />
                                }
                                    label={t('addCargo.fields.allowPartialLabel')}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.weightTons')}</Typography>
                            <TextField
                                    type="text" 
                                    fullWidth
                                    placeholder={t('addCargo.fields.weightPlaceholder')}
                                    inputProps={numericInputProps}
                                    value={form.weightTons ?? ""} 
                                    onChange={(e) => setField("weightTons", num(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label={t('addCargo.fields.volume')} type="text" fullWidth placeholder={t('addCargo.fields.volumePlaceholder')}
                                inputProps={numericInputProps}
                                value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label={t('addCargo.fields.vehiclesCount')} type="text" fullWidth placeholder={t('addCargo.fields.vehiclesCountPlaceholder')}
                                inputProps={numericInputProps}
                                value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.palletsCount')}</Typography>
                            <TextField
                                    type="text" 
                                    fullWidth
                                    placeholder={t('addCargo.fields.palletsCountPlaceholder')}
                                    inputProps={numericInputProps}
                                    value={form.palletsCount ?? ""} 
                                    onChange={(e) => setField("palletsCount", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.length')}</Typography>
                            <TextField
                                type="text" placeholder={t('addCargo.fields.length')} fullWidth
                                inputProps={numericInputProps}
                                value={form.dims.length ?? ""} onChange={(e) => setField("dims", { ...form.dims, length: num(e.target.value) })}
                                error={!!errors.dims} helperText={errors.dims && "Fill all dimensions"}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.width')}</Typography>
                            <TextField
                                type="text" placeholder={t('addCargo.fields.width')} fullWidth
                                inputProps={numericInputProps}
                                value={form.dims.width ?? ""} onChange={(e) => setField("dims", { ...form.dims, width: num(e.target.value) })}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.height')}</Typography>
                            <TextField
                                type="text" placeholder={t('addCargo.fields.height')} fullWidth
                                inputProps={numericInputProps}
                                value={form.dims.height ?? ""} onChange={(e) => setField("dims", { ...form.dims, height: num(e.target.value) })}
                            />
                        </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Divider sx={{ my: 4 }} />
                                     </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <FormControl fullWidth>
                                    <InputLabel shrink>{t('addCargo.fields.price')}</InputLabel>
                                    <OutlinedInput
                                        label={t('addCargo.fields.price')}
                                        value={form.price ?? ""}
                                        onChange={(e) => setField("price", num(e.target.value))}
                                        type="text"
                                        inputProps={numericInputProps}
                                        className="price-input-field"
                                        startAdornment={
                                            <InputAdornment position="start" sx={{ mr: 1 }}>
                                                <Select
                                                    value={currentCurrency}
                                                    onChange={(e) => setField("currency", e.target.value as string)}
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
                                                       ? currencyOpts.map(c => <MenuItem key={c.slug} value={c.slug}>{getLocalizedLabel(c)}</MenuItem>)
                                                          : <MenuItem value="USD">USD</MenuItem>}
                                                </Select>
                                            </InputAdornment>
                                        }
                                        sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
                                    />
                                </FormControl>
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.paymentMethod')}</Typography>
                            <Select
                                    key={`paymentMethod-desktop-${i18n.language}`}
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentMethod || ""} 
                                    onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>{t('addCargo.fields.selectPaymentMethod')}</em>;
                                        }
                                        return findLocalizedLabel(payMethodOpts, selected as string);
                                    }}
                            >
                                {payMethodOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.paymentTerm')}</Typography>
                            <Select
                                    key={`paymentTerm-desktop-${i18n.language}`}
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentTerm || ""} 
                                    onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>{t('addCargo.fields.selectPaymentTerm')}</em>;
                                        }
                                        return findLocalizedLabel(payTermOpts, selected as string);
                                    }}
                            >
                                {payTermOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{getLocalizedLabel(o)}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.bargaining')}</Typography>
                            <Select
                                fullWidth
                                    displayEmpty
                                    value={form.bargaining || ""} 
                                onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <em style={{ color: '#999' }}>{t('addCargo.fields.selectBargaining')}</em>;
                                        }
                                        return selected === "possible" ? t('addCargo.fields.bargainingPossible') : t('addCargo.fields.bargainingNone');
                                    }}
                                >
                                    <MenuItem value="possible">{t('addCargo.fields.bargainingPossible')}</MenuItem>
                                    <MenuItem value="none">{t('addCargo.fields.bargainingNone')}</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs:12 }}>
                                <Divider sx={{ my: 4 }} />
                                <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>{t('addCargo.fields.contactsTitle')}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {t('addCargo.fields.contactsSubtitle')}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('addCargo.fields.additionalPhone')}</Typography>
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
                                        size="small"
                                    />
                                }
                                label={t('addCargo.fields.extraPhoneAsMainLabel')}
                                sx={{ 
                                    mt: 1.5,
                                    ml: 0,
                                    backgroundColor: 'transparent',
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '0.875rem'
                                    }
                                }}
                            />
                            <Button
                                variant="text"
                                sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                onClick={() => setField("contactSecondary", "")}
                            >
                                    {t('addCargo.fields.clearPhone')}
                            </Button>
                        </Grid>

                        <Grid size={{ xs:12 }}>
                            <TextField
                                    label={t('addCargo.fields.additionalInfo')} placeholder={t('addCargo.fields.additionalInfoPlaceholder')} className="additional-info-field"
                                fullWidth multiline minRows={3}
                                value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                            />
                        </Grid>

                        <Grid size={{ xs:12 }}>
                            <Stack direction="row" justifyContent="center" mt={1.5}>
                                <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit}>
                                        {t('addCargo.buttonSubmit')}
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
