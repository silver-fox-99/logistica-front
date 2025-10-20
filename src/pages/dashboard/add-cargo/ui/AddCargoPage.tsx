import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    Checkbox, FormControlLabel, Select, MenuItem, Chip, Autocomplete
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiPlus } from "react-icons/fi";
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

/* ===== local form types ===== */
type Place = {
    countryId?: string | null;
    regionId?: string | null;
    cityId?: string | null;
    address?: string | null;
};

type Dims = { enabled: boolean; length?: number; width?: number; height?: number };

type FormValues = {
    dateFrom: string;
    dateTo: string;

    pickups: Place[];     // PICKUP points
    dropoffs: Place[];    // DROPOFF points

    cargoType: string;    // init.cargoTypes key
    vehicleType: string;  // init.vehicleType key
    loadType: string;     // init.loadType key (FULL/PARTIAL/ANY)
    allowPartial: boolean;

    vehiclesCount?: number;   // cars_count
    palletsCount?: number;    // pallets_count
    weightTons?: number;      // weight_t
    volumeM3?: number;        // volume_m3

    dims: Dims;               // has_dimensions + length/width/height

    currency: string;         // init.currency key
    price?: number;           // price_amount
    paymentMethod: string;    // init.paymentMethods key
    paymentTerm: string;      // init.paymentTerms key
    bargaining: "possible" | "none"; // -> ALLOWED/NOT_ALLOWED

    contactSecondary?: string; // -> contact_extra_phone
    note?: string;
};

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
    labelPrefix: string; // "Pickup" | "Dropoff"
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
                value={countryValue}
                onChange={(_, v) => onChange({ ...place, countryId: v?.id ?? null, regionId: null, cityId: null })}
                renderInput={(params) => (
                    <TextField {...params} fullWidth label={labelPrefix.includes("загрузки") ? "Страна загрузки" : "Страна выгрузки"} placeholder="Начните вводить страну" />
                )}
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

        dims: { enabled: true, length: undefined, width: undefined, height: undefined },

        currency: "USD",
        price: undefined,
        paymentMethod: "",
        paymentTerm: "",
        bargaining: "possible",

        contactSecondary: "",
        note: "",
    });

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
            const data = await cargoApi.init(); // GET /cargo/init
            setInit(data);
            // дефолты
            const currency = Object.keys(data.currency)[0] || "USD";
            const vehicle = Object.keys(data.vehicleType)[0] || "ANY";
            const loadType = Object.keys(data.loadType)[0] || "";
            const cargoType = Object.keys(data.cargoTypes)[0] || "";
            setForm((s) => ({ ...s, currency, vehicleType: vehicle, loadType, cargoType }));
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

    const addPickup = () => setField("pickups", [...form.pickups, {} as Place]);
    const rmPickup = (i: number) => setField("pickups", form.pickups.filter((_, idx) => idx !== i));
    const addDropoff = () => setField("dropoffs", [...form.dropoffs, {} as Place]);
    const rmDropoff = (i: number) => setField("dropoffs", form.dropoffs.filter((_, idx) => idx !== i));

    /* ===== validation ===== */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = "Required";
        if (!form.dateTo) e.dateTo = "Required";

        if (!form.pickups[0]?.countryId) e.pickups = "Select at least country for the first pickup";
        if (!form.dropoffs[0]?.countryId) e.dropoffs = "Select at least country for the first dropoff";

        if (!form.cargoType) e.cargoType = "Select cargo type";
        if (!form.vehicleType) e.vehicleType = "Select vehicle type";
        if (!form.loadType) e.loadType = "Select load type";
        if (!form.paymentMethod) e.paymentMethod = "Select payment method";
        if (!form.paymentTerm) e.paymentTerm = "Select payment term";

            if (form.dims.length == null || form.dims.width == null || form.dims.height == null) {
                e.dims = "Fill all dimensions";
        }
        if (form.contactSecondary && !/^\+?[1-9]\d{9,19}$/.test(form.contactSecondary)) {
            e.contactSecondary = "Invalid phone format. Use + and digits, 10–20 digits total.";
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

        // берём названия из init по id
        const getName = (id?: string | null) =>
            id ? (geoById.get(id)?.name ?? "") : "";

        const countryFromName = getName(firstPickup.countryId) || "Unknown";

        return {
            date_from: v.dateFrom || null,
            date_to: v.dateTo || null,

            // ⬇️ добавили в payload
            country_from: countryFromName,

            vehicle_type: (v.vehicleType as CreateCargoDto["vehicle_type"]) || "ANY",
            load_type: (v.loadType as CreateCargoDto["load_type"]) || "FULL",
            cargo_type: (v.cargoType as CreateCargoDto["cargo_type"]) || "GENERAL",
            allow_partial_load: !!v.allowPartial,

            // всегда number | null (не undefined!)
            weight_t: v.weightTons ?? null,
            volume_m3: v.volumeM3 ?? null,
            cars_count: v.vehiclesCount ?? null,
            pallets_count: v.palletsCount ?? null,

            has_dimensions: !!v.dims.enabled,
            ...(v.dims.enabled ? {
                length_m: v.dims.length!,
                width_m:  v.dims.width!,
                height_m: v.dims.height!,
            } : {}),

            price_currency: v.currency,
            price_amount: v.price ?? 0,

            // обязательно передаём валидное значение
            payment_method: v.paymentMethod as CreateCargoDto["payment_method"],
            // допускается null
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
        if (!validate()) return;
        const payload = toDto(form);
        await cargoApi.create(payload);
        navigate("/dashboard/requests");
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box className="add-cargo-page">
            {/* header */}
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
                        {/* Прогресс-бар сверху */}
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

                        {/* Контент экрана */}
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
                                            {(init ? Object.keys(init.cargoTypes) : []).map((k) => (
                                                <MenuItem key={k} value={k}>{k}</MenuItem>
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
                                            {(init ? Object.keys(init.vehicleType) : []).map((k) => (
                                                <MenuItem key={k} value={k}>{k}</MenuItem>
                                            ))}
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
                                            {(init ? Object.keys(init.loadType) : []).map((k) => (
                                                <MenuItem key={k} value={k}>{k}</MenuItem>
                                            ))}
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
                                        <Stack direction="row" spacing={1}>
                                            <Select
                                                size="small" sx={{ minWidth: 100, alignSelf: "center" }}
                                                value={form.currency} onChange={(e) => setField("currency", e.target.value as string)}
                                            >
                                                {(init ? Object.keys(init.currency) : ["USD"]).map((c) => (
                                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                                ))}
                                            </Select>
                                            <TextField
                                                label="Стоимость" type="number" fullWidth
                                                value={form.price ?? ""} onChange={(e) => setField("price", num(e.target.value))}
                                            />
                                        </Stack>
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
                                            {(init ? Object.keys(init.paymentMethods) : []).map((m) => (
                                                <MenuItem key={m} value={m}>{m}</MenuItem>
                                            ))}
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
                                            {(init ? Object.keys(init.paymentTerms) : []).map((t) => (
                                                <MenuItem key={t} value={t}>{t}</MenuItem>
                                            ))}
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
                                            Additional phone will be shown in the order.
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Additional phone</Typography>
                                        <TextField
                                            placeholder="+380971234567"
                                            fullWidth
                                            value={form.contactSecondary ?? ""}
                                            onChange={(e) => setField("contactSecondary", e.target.value || undefined)}
                                            helperText={errors.contactSecondary ? errors.contactSecondary : "Optional. Format: + and 10–20 digits."}
                                            error={!!errors.contactSecondary}
                                        />
                                        <Button
                                            variant="text"
                                            sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                            onClick={() => setField("contactSecondary", "")}
                                        >
                                            Clear phone
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            label="Additional information" placeholder="Provide any extra details"
                                            fullWidth multiline minRows={3}
                                            value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Box>

                        {/* Навигация внутри content-paper */}
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

                {/* Десктопная версия - обычная форма */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Box component="form" noValidate onSubmit={onSubmit}>
                        <Grid container spacing={2}>
                            {/* Даты */}
                        <Grid size={{ xs:12, md:6 }}>
                            <TextField
                                    label="Дата загрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                error={!!errors.dateFrom} helperText={errors.dateFrom}
                            />
                        </Grid>
                        <Grid size={{ xs:12, md:6 }}>
                            <TextField
                                    label="Дата выгрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                error={!!errors.dateTo} helperText={errors.dateTo}
                            />
                        </Grid>

                        {/* PICKUP (left) */}
                        <Grid size={{ xs:12, md:6 }}>
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

                        {/* DROPOFF (right) */}
                        <Grid size={{ xs:12, md:6 }}>
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

                        {/* Enums from init */}
                        <Grid size={{ xs:12, md:6 }}>
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
                                {(init ? Object.keys(init.cargoTypes) : []).map((k) => (
                                    <MenuItem key={k} value={k}>{k}</MenuItem>
                                ))}
                            </Select>
                            {errors.cargoType && <Typography variant="caption" color="error">{errors.cargoType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
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
                                    {(init ? Object.keys(init.vehicleType) : []).map((k) => (
                                    <MenuItem key={k} value={k}>{k}</MenuItem>
                                ))}
                            </Select>
                            {errors.vehicleType && <Typography variant="caption" color="error">{errors.vehicleType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
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
                                    {(init ? Object.keys(init.loadType) : []).map((k) => (
                                    <MenuItem key={k} value={k}>{k}</MenuItem>
                                ))}
                            </Select>
                            {errors.loadType && <Typography variant="caption" color="error">{errors.loadType}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
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

                        {/* Numbers */}
                        <Grid size={{ xs:12, md:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Вес груза (т)</Typography>
                            <TextField
                                    type="number" 
                                    fullWidth
                                    placeholder="Укажите вес"
                                    value={form.weightTons ?? ""} 
                                    onChange={(e) => setField("weightTons", num(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs:12, md:6 }}>
                            <TextField
                                    label="Объём (м³)" type="number" fullWidth placeholder="Укажите объём"
                                value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
                            <TextField
                                    label="Количество автомобилей" type="number" fullWidth placeholder="Укажите количество"
                                value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Количество паллет</Typography>
                            <TextField
                                    type="number" 
                                    fullWidth
                                    placeholder="Введите количество паллет"
                                    value={form.palletsCount ?? ""} 
                                    onChange={(e) => setField("palletsCount", num(e.target.value))}
                            />
                        </Grid>

                        {/* Dimensions */}
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

                                    <Grid size={{ xs:12 }}>
                                        <Divider sx={{ my: 4 }} />
                                     </Grid>
                        {/* Pricing */}
                        <Grid size={{ xs:12, md:6 }}>
                            <Stack direction="row" spacing={1}>
                                <Select
                                    size="small" sx={{ minWidth: 100, alignSelf: "center" }}
                                    value={form.currency} onChange={(e) => setField("currency", e.target.value as string)}
                                >
                                    {(init ? Object.keys(init.currency) : ["USD"]).map((c) => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                        label="Стоимость" type="number" fullWidth
                                    value={form.price ?? ""} onChange={(e) => setField("price", num(e.target.value))}
                                />
                            </Stack>
                        </Grid>

                        {/* Payments */}
                        <Grid size={{ xs:12, md:6 }}>
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
                                {(init ? Object.keys(init.paymentMethods) : []).map((m) => (
                                    <MenuItem key={m} value={m}>{m}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
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
                                {(init ? Object.keys(init.paymentTerms) : []).map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
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

                        {/* Contacts: only Additional phone */}
                        <Grid size={{ xs:12 }}>
                                <Divider sx={{ my: 4 }} />
                                <Typography variant="h6" mt={1} sx={{ fontWeight: 'bold', mb: '10px' }}>Выберите контакты, которые будут видны в заказе</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Здесь отображаются доступные контакты, добавленные вами в разделе "Профиль". Вы можете изменить или добавить их в личном кабинете.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs:12, md:6 }}>
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

                        {/* Note */}
                        <Grid size={{ xs:12 }}>
                            <TextField
                                    label="Дополнительная информация" placeholder="Укажите дополнительную информацию" className="additional-info-field"
                                fullWidth multiline minRows={3}
                                value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                            />
                        </Grid>

                        {/* Submit */}
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