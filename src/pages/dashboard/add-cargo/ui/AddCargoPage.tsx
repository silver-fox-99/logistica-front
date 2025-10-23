import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider, FormControl,
    Checkbox, FormControlLabel, Select, MenuItem, Autocomplete, InputLabel, OutlinedInput, InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";

import { cargoApi, type CreateCargoDto } from "@/shared/api/cargoApi";
import {useNavigate} from "react-router-dom";

import './AddCargoPage.scss';


/* ===== types from init ===== */
type Geo = {
    id: string;
    parent_id: string | null;
    type: "COUNTRY" | "REGION" | "CITY";
    name: string;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type LookupOpt = { slug: string; label: string };

type InitData = Awaited<ReturnType<typeof cargoApi.init>> | null;

/* ===== local form types ===== */
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
    loadType: string;
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
    note?: string;
};

const getOpts = (
    name: keyof NonNullable<NonNullable<InitData>["lookups"]>,
    initData: InitData
): LookupOpt[] => initData?.lookups ? (initData.lookups[name] as LookupOpt[]) : [];

const findLabel = (opts: LookupOpt[], slug?: string) =>
    opts.find(o => o.slug === slug)?.label ?? slug ?? "";

/* ===== geo helpers ===== */
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
    regionsByCountry.forEach((a) => a.sort((x, y) => x.name.localeCompare(y.name)));
    citiesByParent.forEach((a) => a.sort((x, y) => x.name.localeCompare(y.name)));

    return { byId, countries, regionsByCountry, citiesByParent };
}

/* ===== vertical PlaceRow (country → region → city) ===== */
type PlaceRowProps = {
    labelPrefix: string;
    place: Place;
    onChange: (p: Place) => void;
    geos: Geo[] | null;
    errorText?: string;
    showRemove?: boolean;
    onRemove?: () => void;
};

function PlaceRow({
                      labelPrefix, place, onChange, geos, errorText, showRemove, onRemove
                  }: PlaceRowProps) {
    const maps = useMemo(() => (geos ? buildGeoMaps(geos) : null), [geos]);
    const countries = maps?.countries ?? [];
    const regions = place.countryId ? (maps?.regionsByCountry.get(place.countryId) ?? []) : [];
    const citiesFromCountry = place.countryId ? (maps?.citiesByParent.get(place.countryId) ?? []) : [];
    const citiesFromRegion = place.regionId ? (maps?.citiesByParent.get(place.regionId) ?? []) : [];
    const mergedCities = useMemo(() => {
        const m = new Map<string, Geo>();
        [...citiesFromCountry, ...citiesFromRegion].forEach((c) => m.set(c.id, c));
        return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [citiesFromCountry, citiesFromRegion]);

    const countryValue = place.countryId ? countries.find(c => c.id === place.countryId) ?? null : null;
    const regionValue = place.regionId ? regions.find(r => r.id === place.regionId) ?? null : null;
    const cityValue = place.cityId ? mergedCities.find(c => c.id === place.cityId) ?? null : null;

    return (
        <Stack spacing={1.25}>
            <Autocomplete
                options={countries}
                getOptionLabel={(o) => o.name}
                
                onChange={(_, v) => onChange({ ...place, countryId: v?.id ?? null, regionId: null, cityId: null })}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? "Страна загрузки" : "Страна выгрузки"} placeholder="Начните вводить страну" />
                )}
                disableClearable={true}
            />

            <Autocomplete
                options={regions}
                getOptionLabel={(o) => o.name}
                value={regionValue}
                onChange={(_, v) => onChange({ ...place, regionId: v?.id ?? null, cityId: null })}
                disabled={!countryValue || regions.length === 0}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? "Регион загрузки" : "Регион выгрузки"} placeholder="Начните вводить регион"/>
                )}
            />

            <Autocomplete
                options={mergedCities}
                getOptionLabel={(o) => o.name}
                value={cityValue}
                onChange={(_, v) => onChange({ ...place, cityId: v?.id ?? null })}
                disabled={!countryValue || mergedCities.length === 0}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? "Город загрузки" : "Город выгрузки"} placeholder="Начните вводить город"/>
                )}
            />

            {showRemove && (
                <Button
                    variant="text"
                    color="error"
                    onClick={onRemove}
                    sx={{ alignSelf: "flex-start", minWidth: 40, mt: 0.5, textTransform: "none" }}
                >
                    Remove point
                </Button>
            )}

            {!!errorText && <Typography variant="caption" color="error">{errorText}</Typography>}
        </Stack>
    );
}

/* ===================== PAGE ===================== */
export default function AddCargoPage() {
    const [init, setInit] = useState<Awaited<ReturnType<typeof cargoApi.init>> | null>(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const [activeStep, setActiveStep] = useState(0);

    const currencyOpts   = useMemo(() => getOpts("currency", init),        [init]);
    const vehicleOpts    = useMemo(() => getOpts("vehicleType", init),     [init]);
    const loadOpts       = useMemo(() => getOpts("loadType", init),        [init]);
    const cargoOpts      = useMemo(() => getOpts("cargoTypes", init),      [init]);
    const payMethodOpts  = useMemo(() => getOpts("paymentMethods", init),  [init]);
    const payTermOpts    = useMemo(() => getOpts("paymentTerms", init),    [init]);


    const [form, setForm] = useState<FormValues>({
        dateFrom: "", dateTo: "",
        pickups:  [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],
        dropoffs: [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],

        cargoType: "",
        vehicleType: "ANY",
        loadType: "FULL",
        allowPartial: false,

        vehiclesCount: 1,
        palletsCount: undefined,
        weightTons: undefined,
        volumeM3: undefined,

        dims: { length: undefined, width: undefined, height: undefined },

        currency: "USD",
        price: undefined,
        paymentMethod: "",
        paymentTerm: "",
        bargaining: "possible",

        contactSecondary: "",
        note: "",
    });

    const currentCurrency = form.currency || currencyOpts[0]?.slug || "USD";
    const [errors, setErrors] = useState<Record<string, string>>({});



    const steps = [
        'Даты и маршруты',
        'Информация о грузе', 
        'Размеры и вес',
        'Цена и оплата',
        'Контакты'
    ];

    useEffect(() => {
        (async () => {
            setLoadingInit(true);
            const data = await cargoApi.init();
            setInit(data);
            const currency = data.lookups.currency[0]?.slug   ?? "USD";
            const vehicle  = data.lookups.vehicleType[0]?.slug ?? "ANY";
            const loadType = data.lookups.loadType[0]?.slug    ?? "FULL";
            const cargo    = data.lookups.cargoTypes[0]?.slug  ?? "";
            setForm((s) => ({ ...s, currency, vehicleType: vehicle, loadType, cargoType: cargo }));
            setLoadingInit(false);
        })();
    }, []);

    const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setForm((s) => ({ ...s, [key]: value }));

    const num = (v: string) => (v === "" ? undefined : Number(v));

    const updatePickup = (idx: number, p: Place) =>
        setField("pickups", form.pickups.map((x, i) => (i === idx ? p : x)));
    const updateDropoff = (idx: number, p: Place) =>
        setField("dropoffs", form.dropoffs.map((x, i) => (i === idx ? p : x)));

    const rmPickup = (i: number) => setField("pickups", form.pickups.filter((_, idx) => idx !== i));
    const rmDropoff = (i: number) => setField("dropoffs", form.dropoffs.filter((_, idx) => idx !== i));

    /* ===== validation ===== */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = "Обязательно";
        if (!form.dateTo) e.dateTo = "Обязательно";

        if (!form.pickups[0]?.countryId) e.pickups = "Выберите хотя бы страну для первой точки погрузки";
        if (!form.dropoffs[0]?.countryId) e.dropoffs = "Выберите хотя бы страну для первой точки выгрузки";

        if (!form.cargoType) e.cargoType = "Выберите тип груза";
        if (!form.vehicleType) e.vehicleType = "Выберите тип транспорта";
        if (!form.loadType) e.loadType = "Выберите тип загрузки";
        if (!form.paymentMethod) e.paymentMethod = "Выберите способ оплаты";

        if (form.contactSecondary && !/^\+?[1-9]\d{9,19}$/.test(form.contactSecondary)) {
            e.contactSecondary = "Неверный формат телефона. Используйте + и цифры, всего 10-20 цифр";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ===== geo id -> name ===== */
    const geoById = useMemo(() => {
        const m = new Map<string, Geo>();
        if (init?.geos) for (const g of init.geos) m.set(g.id, g);
        return m;
    }, [init]);

    /* ===== UI -> DTO ===== */
    const toDto = (v: FormValues): CreateCargoDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const firstPickup = v.pickups[0] || {};
        const firstDrop   = v.dropoffs[0] || {};

        const getName = (id?: string | null) =>
            id ? (geoById.get(id)?.name ?? "") : "";

        const anyDim =
                (v.dims && v.dims.length != null && v.dims.length > 0) ||
                (v.dims && v.dims.width != null && v.dims.width > 0) ||
                (v.dims && v.dims.height != null && v.dims.height > 0);

        const countryFromName = getName(firstPickup.countryId) || "Unknown";

        return {
            date_from: v.dateFrom || null,
            date_to: v.dateTo || null,

            country_from: countryFromName,

            vehicle_type: (v.vehicleType as CreateCargoDto["vehicle_type"]) || "ANY",
            load_type: (v.loadType as CreateCargoDto["load_type"]) || "FULL",
            cargo_type: (v.cargoType as CreateCargoDto["cargo_type"]) || "GENERAL",
            allow_partial_load: !!v.allowPartial,

            weight_t: v.weightTons ?? null,
            volume_m3: v.volumeM3 ?? null,
            cars_count: v.vehiclesCount ?? null,
            pallets_count: v.palletsCount ?? null,

            has_dimensions: anyDim,
            ...(anyDim
                ? {
                    length_m: v.dims.length || undefined,
                    width_m:  v.dims.width  || undefined,
                    height_m: v.dims.height || undefined,
                }
                : {}),

            price_currency: v.currency,
            price_amount: v.price ?? 0,

            payment_method: (v.paymentMethod || undefined) as CreateCargoDto["payment_method"],
            payment_term: (v.paymentTerm || null) as CreateCargoDto["payment_term"],

            bargain,

            contact_extra_phone: v.contactSecondary ? v.contactSecondary : null,
            note: v.note || null,

            points: [
                {
                    type: "PICKUP",
                    country: countryFromName,
                    region: getName(firstPickup.regionId) || null,
                    city:   getName(firstPickup.cityId)   || null,
                    address: firstPickup.address ?? null,
                },
                {
                    type: "DROPOFF",
                    country: getName(firstDrop.countryId) || "Unknown",
                    region:  getName(firstDrop.regionId)  || null,
                    city:    getName(firstDrop.cityId)    || null,
                    address: firstDrop.address ?? null,
                }
            ],
        };
    };

    const navigate = useNavigate();

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) {
            toast.warning('Заполните все обязательные поля');
            return;
        }
        try {
            const payload = toDto(form);
            await cargoApi.create(payload);
            toast.success('Груз успешно создан!');
            navigate("/dashboard/requests");
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при создании груза';
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
        <Box className="add-cargo-page">
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }} className="add-cargo-page__paper">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} className="add-cargo-page__header">
                    <Box className="add-cargo-page__icon">
                        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7"/><path d="M20.833 13.889c.48 0 .868.388.868.868v5.208h5.209a.868.868 0 1 1 0 1.736H21.7v5.209a.868.868 0 1 1-1.736 0V21.7h-5.208a.868.868 0 0 1 0-1.736h5.208v-5.208c0-.48.389-.868.868-.868" fill="#4472B8"/></svg>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="add-cargo-page__title">Добавление заявки на перевозку груза</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="add-cargo-page__subtitle">
                            Укажите, пожалуйста, пункты загрузки и выгрузки, параметры груза и контактную информацию.
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }} className="add-cargo-page__content-paper">
            <Typography variant="h6" mb={1} className="add-cargo-page__title">Информация о грузе</Typography>
                <Typography variant="body2" color="text.secondary" mb={2} className="add-cargo-page__subtitle">
                    Укажите как можно подробнее доступную информацию о грузе.
                </Typography>

                {/* Мобильная версия - Stepper экранами */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Box component="form" noValidate onSubmit={onSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Шаг {activeStep + 1} из {steps.length}: {steps[activeStep]}
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
                                            label="Дата загрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                            value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                            error={!!errors.dateFrom} helperText={errors.dateFrom}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label="Дата выгрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
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
                                                    geos={init?.geos ?? null}
                                                    errorText={i === 0 ? errors.pickups : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmPickup(i)}
                                                    onChange={(np) => updatePickup(i, np)}
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
                                                    geos={init?.geos ?? null}
                                                    errorText={i === 0 ? errors.dropoffs : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmDropoff(i)}
                                                    onChange={(np) => updateDropoff(i, np)}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 1 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип груза</Typography>
                                        <Select
                                            variant="outlined"
                                            fullWidth 
                                            displayEmpty
                                            value={form.cargoType || ""} 
                                            onChange={(e) => setField("cargoType", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите тип груза</em>;
                                                }
                                                return findLabel(cargoOpts, selected as string);
                                            }}
                                        >
                                            {cargoOpts.map(o => (
                                                   <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>
                                                 ))}
                                        </Select>
                                        {errors.cargoType && <Typography variant="caption" color="error">{errors.cargoType}</Typography>}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип автомобиля</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.vehicleType || ""} 
                                            onChange={(e) => setField("vehicleType", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите тип</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em style={{ color: '#999' }}>Выберите тип</em>
                                            </MenuItem>
                                            {vehicleOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>)}
                                        </Select>
                                        {errors.vehicleType && <Typography variant="caption" color="error">{errors.vehicleType}</Typography>}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип загрузки</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.loadType || ""} 
                                            onChange={(e) => setField("loadType", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите тип загрузки</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            {loadOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>)}
                                        </Select>
                                        {errors.loadType && <Typography variant="caption" color="error">{errors.loadType}</Typography>}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Дозагрузка</Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={form.allowPartial}
                                                    onChange={(e) => setField("allowPartial", e.target.checked)}
                                                />
                                            }
                                            label="Возможность догрузки"
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 2 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Вес груза (т)</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder="Укажите вес"
                                            value={form.weightTons ?? ""} 
                                            onChange={(e) => setField("weightTons", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label="Объём (м³)" type="number" fullWidth placeholder="Укажите объём"
                                            value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label="Количество автомобилей" type="number" fullWidth placeholder="Укажите количество"
                                            value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Количество паллет</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder="Введите количество паллет"
                                            value={form.palletsCount ?? ""} 
                                            onChange={(e) => setField("palletsCount", num(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Размеры груза</Typography>

                                        <Grid container spacing={1}>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    type="number" placeholder="Длина (м)" fullWidth
                                                    value={form.dims.length ?? ""} onChange={(e) => setField("dims", { ...form.dims, length: num(e.target.value) })}
                                                    error={!!errors.dims} helperText={errors.dims && "Fill all dimensions"}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    type="number" placeholder="Ширина (м)" fullWidth
                                                    value={form.dims.width ?? ""} onChange={(e) => setField("dims", { ...form.dims, width: num(e.target.value) })}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    type="number" placeholder="Высота (м)" fullWidth
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
                                            <InputLabel shrink>Стоимость</InputLabel>
                                            <OutlinedInput
                                                label="Стоимость"
                                                value={form.price ?? ""}
                                                onChange={(e) => setField("price", num(e.target.value))}
                                                type="number"
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
                                                                ? currencyOpts.map((c: LookupOpt) => <MenuItem key={c.slug} value={c.slug}>{c.label}</MenuItem>)
                                                                : <MenuItem value="USD">USD</MenuItem>}
                                                        </Select>
                                                    </InputAdornment>
                                                }
                                                sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Метод оплаты</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.paymentMethod || ""} 
                                            onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите метод оплаты</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            {payMethodOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>)}
                                        </Select>
                                        {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Срок оплаты</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.paymentTerm || ""} 
                                            onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите срок оплаты</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            {payTermOpts.map(o => <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>)}
                                        </Select>
                                        {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Торг</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.bargaining || ""} 
                                            onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <em style={{ color: '#999' }}>Выберите возможность торга</em>;
                                                }
                                                return selected === "possible" ? "Возможен торг" : "Торг невозможен";
                                            }}
                                        >
                                            <MenuItem value="possible">Возможен торг</MenuItem>
                                            <MenuItem value="none">Торг невозможен</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 4 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>Выберите контакты, которые будут видны в заказе</Typography>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            Здесь отображаются доступные контакты, добавленные вами в разделе "Профиль". Вы можете изменить или добавить их в личном кабинете.
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Дополнительный телефон</Typography>
                                        <TextField
                                            placeholder="+380971234567"
                                            fullWidth
                                            value={form.contactSecondary ?? ""}
                                            onChange={(e) => setField("contactSecondary", e.target.value || undefined)}
                                            helperText={errors.contactSecondary ? errors.contactSecondary : ""}
                                            error={!!errors.contactSecondary}
                                        />
                                        <Button
                                            variant="text"
                                            sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                            onClick={() => setField("contactSecondary", "")}
                                        >
                                            Очистить телефон
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label="Дополнительная информация" placeholder="Укажите дополнительную информацию"
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
                                Назад
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
                                    Отправить
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ minWidth: 100 }}
                                >
                                    Продолжить
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
                                    label="Дата загрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                error={!!errors.dateFrom} helperText={errors.dateFrom}
                            />
                        </Grid>
                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label="Дата выгрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
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
                                        geos={init?.geos ?? null}
                                        errorText={i === 0 ? errors.pickups : undefined}
                                        showRemove={i > 0}
                                        onRemove={() => rmPickup(i)}
                                        onChange={(np) => updatePickup(i, np)}
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
                                        geos={init?.geos ?? null}
                                        errorText={i === 0 ? errors.dropoffs : undefined}
                                        showRemove={i > 0}
                                        onRemove={() => rmDropoff(i)}
                                        onChange={(np) => updateDropoff(i, np)}
                                    />
                                ))}
                            </Stack>
                        </Grid>

                            <Grid size={{ xs:12 }}>
                                        <Divider sx={{ my: 4 }} />
                            </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип груза</Typography>
                            <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.cargoType || ""} 
                                    onChange={(e) => setField("cargoType", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите тип груза</em>;
                                        }
                                        return selected;
                                    }}
                            >
                                {cargoOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.cargoType && <Typography variant="caption" color="error">{errors.cargoType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип автомобиля</Typography>
                            <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.vehicleType || ""} 
                                    onChange={(e) => setField("vehicleType", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите тип</em>;
                                        }
                                        return selected;
                                    }}
                                >
                                    <MenuItem value="">
                                        <em style={{ color: '#999' }}>Выберите тип</em>
                                    </MenuItem>
                                {vehicleOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.vehicleType && <Typography variant="caption" color="error">{errors.vehicleType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип загрузки</Typography>
                            <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.loadType || ""} 
                                    onChange={(e) => setField("loadType", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите тип загрузки</em>;
                                        }
                                        return selected;
                                    }}
                                >
                                {loadOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.loadType && <Typography variant="caption" color="error">{errors.loadType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Дозагрузка</Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.allowPartial}
                                        onChange={(e) => setField("allowPartial", e.target.checked)}
                                    />
                                }
                                    label="Возможность догрузки"
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Вес груза (т)</Typography>
                            <TextField
                                    type="number" 
                                    fullWidth
                                    placeholder="Укажите вес"
                                    value={form.weightTons ?? ""} 
                                    onChange={(e) => setField("weightTons", num(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label="Объём (м³)" type="number" fullWidth placeholder="Укажите объём"
                                value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <TextField
                                    label="Количество автомобилей" type="number" fullWidth placeholder="Укажите количество"
                                value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Количество паллет</Typography>
                            <TextField
                                    type="number" 
                                    fullWidth
                                    placeholder="Введите количество паллет"
                                    value={form.palletsCount ?? ""} 
                                    onChange={(e) => setField("palletsCount", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Длина (м)</Typography>
                            <TextField
                                type="number" placeholder="Длина (м)" fullWidth
                                value={form.dims.length ?? ""} onChange={(e) => setField("dims", { ...form.dims, length: num(e.target.value) })}
                                error={!!errors.dims} helperText={errors.dims && "Fill all dimensions"}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Ширина (м)</Typography>
                            <TextField
                                type="number" placeholder="Ширина (м)" fullWidth
                                value={form.dims.width ?? ""} onChange={(e) => setField("dims", { ...form.dims, width: num(e.target.value) })}
                            />
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Высота (м)</Typography>
                            <TextField
                                type="number" placeholder="Высота (м)" fullWidth
                                value={form.dims.height ?? ""} onChange={(e) => setField("dims", { ...form.dims, height: num(e.target.value) })}
                            />
                        </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Divider sx={{ my: 4 }} />
                                     </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <FormControl fullWidth>
                                    <InputLabel shrink>Стоимость</InputLabel>
                                    <OutlinedInput
                                        label="Стоимость"
                                        value={form.price ?? ""}
                                        onChange={(e) => setField("price", num(e.target.value))}
                                        type="number"
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
                                                       ? currencyOpts.map(c => <MenuItem key={c.slug} value={c.slug}>{c.label}</MenuItem>)
                                                          : <MenuItem value="USD">USD</MenuItem>}
                                                </Select>
                                            </InputAdornment>
                                        }
                                        sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
                                    />
                                </FormControl>
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Метод оплаты</Typography>
                            <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentMethod || ""} 
                                    onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите метод оплаты</em>;
                                        }
                                        return selected;
                                    }}
                            >
                                {payMethodOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Срок оплаты</Typography>
                            <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentTerm || ""} 
                                    onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите срок оплаты</em>;
                                        }
                                        return selected;
                                    }}
                            >
                                {payTermOpts.map((o: LookupOpt) => (
                                    <MenuItem key={o.slug} value={o.slug}>{o.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Торг</Typography>
                            <Select
                                fullWidth
                                    displayEmpty
                                    value={form.bargaining || ""} 
                                onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <em style={{ color: '#999' }}>Выберите возможность торга</em>;
                                        }
                                        return selected === "possible" ? "Возможен торг" : "Торг невозможен";
                                    }}
                                >
                                    <MenuItem value="possible">Возможен торг</MenuItem>
                                    <MenuItem value="none">Торг невозможен</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs:12 }}>
                                <Divider sx={{ my: 4 }} />
                                <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>Выберите контакты, которые будут видны в заказе</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Здесь отображаются доступные контакты, добавленные вами в разделе "Профиль". Вы можете изменить или добавить их в личном кабинете.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs:12, sm:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Дополнительный телефон</Typography>
                            <TextField
                                placeholder="+380971234567"
                                fullWidth
                                value={form.contactSecondary ?? ""}
                                onChange={(e) => setField("contactSecondary", e.target.value || undefined)}
                                    helperText={errors.contactSecondary ? errors.contactSecondary : ""}
                                error={!!errors.contactSecondary}
                            />
                            <Button
                                variant="text"
                                sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                onClick={() => setField("contactSecondary", "")}
                            >
                                    Очистить телефон
                            </Button>
                        </Grid>

                        <Grid size={{ xs:12 }}>
                            <TextField
                                    label="Дополнительная информация" placeholder="Укажите дополнительную информацию" className="additional-info-field"
                                fullWidth multiline minRows={3}
                                value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                            />
                        </Grid>

                        <Grid size={{ xs:12 }}>
                            <Stack direction="row" justifyContent="center" mt={1.5}>
                                <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit}>
                                        Добавить груз
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