import { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    FormControlLabel, Checkbox, Select, MenuItem, Chip, Autocomplete
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { transportApi, type CreateTransportDto } from "@/shared/api/transportApi";
import {useNavigate} from "react-router-dom";

import './AddTransportPage.scss';

const VEHICLE_TYPES_LABELS: Record<string, string> = {
    ANY: "Any",
    TENT: "Curtain (Tautliner)",
    REFRIGERATOR: "Reefer",
    VAN: "Box/Van",
    PLATFORM: "Platform/Flatbed",
};

const PRICE_UNITS = ["Total", "Per ton", "Per km"] as const;

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
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [citiesFromCountry, citiesFromRegion]);

    const countryValue = selectedCountry ?? null;
    const regionValue = place.regionId ? regions.find(r => r.id === place.regionId) ?? null : null;
    const cityValue = place.cityId ? mergedCities.find(c => c.id === place.cityId) ?? null : null;

    const errorText = errorKey ? (
        errorKey === "loadPlaces" || errorKey === "unloadPlaces" ? "Select at least country for the first point" : ""
    ) : "";

    return (
        <Stack spacing={1.25}>
            <Autocomplete
                options={countries}
                getOptionLabel={(o) => o.name}
                value={countryValue}
                onChange={(_, v) => {
                    onChange({ ...place, countryId: v?.id ?? null, regionId: null, cityId: null });
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        fullWidth 
                        label={labelPrefix.includes("загрузки") ? "Страна загрузки" : "Страна выгрузки"} 
                        placeholder="Начните вводить страну" 
                    />
                )}
            />

            <Autocomplete
                options={regions}
                getOptionLabel={(o) => o.name}
                value={regionValue}
                onChange={(_, v) => {
                    onChange({ ...place, regionId: v?.id ?? null, cityId: null });
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        fullWidth 
                        label={labelPrefix.includes("загрузки") ? "Регион загрузки" : "Регион выгрузки"} 
                        placeholder="Начните вводить регион" 
                    />
                )}
                disabled={!selectedCountry || regions.length === 0}
            />

            <Autocomplete
                options={mergedCities}
                getOptionLabel={(o) => o.name}
                value={cityValue}
                onChange={(_, v) => onChange({ ...place, cityId: v?.id ?? null })}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        fullWidth 
                        label={labelPrefix.includes("загрузки") ? "Город загрузки" : "Город выгрузки"} 
                        placeholder="Начните вводить город" 
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
                    Remove point
                </Button>
            )}

            {!!errorText && <Typography variant="caption" color="error">{errorText}</Typography>}
        </Stack>
    );
}

export default function AddTransportPage() {
    const [init, setInit] = useState<Awaited<ReturnType<typeof transportApi.init>> | null>(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const [activeStep, setActiveStep] = useState(0);

    const [form, setForm] = useState<FormValues>({
        dateFrom: "", dateTo: "",
        loadPlaces: [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],
        unloadPlaces: [{ countryId: undefined, regionId: undefined, cityId: undefined, address: "" }],

        vehicleType: "ANY",
        vehiclesCount: 1,

        capacityTons: undefined, volumeM3: undefined,
        dimsEnabled: false, bodyLength: undefined, bodyWidth: undefined, bodyHeight: undefined,

        currency: "USD", price: undefined, priceUnit: "Total",

        tax: "", paymentMethod: "", paymentTerm: "", bargaining: "possible",

        contactSecondary: "",
        email: "",
        note: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        'Даты и маршруты',
        'Информация о транспорте', 
        'Размеры и характеристики',
        'Цена и оплата',
        'Контакты'
    ];

    useEffect(() => {
        (async () => {
            setLoadingInit(true);
            const data = await transportApi.init();
            setInit(data);
            const firstCurrency = Object.keys(data.currency)[0] || "USD";
            const defVehicle = Object.keys(data.vehicleType)[0] || "ANY";
            setForm((s) => ({ ...s, currency: firstCurrency, vehicleType: defVehicle }));
            setLoadingInit(false);
        })();
    }, []);

    const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setForm((s) => ({ ...s, [key]: value }));

    const updateLoad = (idx: number, p: Place) =>
        setField("loadPlaces", form.loadPlaces.map((x, i) => (i === idx ? p : x)));
    const updateUnload = (idx: number, p: Place) =>
        setField("unloadPlaces", form.unloadPlaces.map((x, i) => (i === idx ? p : x)));

    const addLoad = () => setField("loadPlaces", [...form.loadPlaces, { } as Place]);
    const rmLoad = (i: number) => setField("loadPlaces", form.loadPlaces.filter((_, idx) => idx !== i));
    const addUnload = () => setField("unloadPlaces", [...form.unloadPlaces, { } as Place]);
    const rmUnload = (i: number) => setField("unloadPlaces", form.unloadPlaces.filter((_, idx) => idx !== i));

    const num = (v: string) => (v === "" ? undefined : Number(v));

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = "Required";
        if (!form.dateTo) e.dateTo = "Required";

        if (!form.loadPlaces[0]?.countryId) e.loadPlaces = "Select at least country for the first loading point";
        if (!form.unloadPlaces[0]?.countryId) e.unloadPlaces = "Select at least country for the first unloading point";

        if (!form.vehicleType) e.vehicleType = "Select vehicle type";
        if (!form.paymentMethod) e.paymentMethod = "Select payment method";
        if (!form.paymentTerm) e.paymentTerm = "Select payment term";
        if (form.dimsEnabled) {
            if (form.bodyLength == null || form.bodyWidth == null || form.bodyHeight == null) {
                e.bodyHeight = "Fill all body dimensions";
            }
        }
        if (form.contactSecondary && !/^\+?[1-9]\d{9,19}$/.test(form.contactSecondary)) {
            e.contactSecondary = "Invalid phone format. Use + and digits, 10–20 digits total.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const geoById = useMemo(() => {
        const m = new Map<string, Geo>();
        if (init?.geos) for (const g of init.geos) m.set(g.id, g);
        return m;
    }, [init]);

    const placeToPoint = (p: Place, type: "DEPARTURE" | "ARRIVAL"): CreateTransportDto["points"][number] => {
        const countryName = p.countryId ? geoById.get(p.countryId)?.name ?? "" : "";
        const regionName = p.regionId ? geoById.get(p.regionId)?.name ?? null : null;
        const cityName = p.cityId ? geoById.get(p.cityId)?.name ?? null : null;
        return {
            type,
            country: countryName || "Unknown",
            region: regionName,
            city: cityName,
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

        return {
            images: undefined,

            date_from: v.dateFrom || null,
            date_to: v.dateTo || null,

            vehicle_type: (v.vehicleType as CreateTransportDto["vehicle_type"]) || "ANY",

            cars_count: Number.isFinite(v.vehiclesCount) ? v.vehiclesCount : 1,
            weight_t: v.capacityTons ?? null,
            volume_m3: v.volumeM3 ?? null,

            has_dimensions: !!v.dimsEnabled,
            ...(v.dimsEnabled ? {
                length_m: v.bodyLength!,
                width_m: v.bodyWidth!,
                height_m: v.bodyHeight!,
            } : {}),

            price_currency: v.currency,
            price_amount: v.price ?? 0,

            payment_method: (v.paymentMethod || null) as CreateTransportDto["payment_method"],
            payment_term: (v.paymentTerm || null) as CreateTransportDto["payment_term"],

            bargain,

            contact_extra_phone: v.contactSecondary ? v.contactSecondary : null,
            note: v.note || null,

            points,
        };
    };

    const navigate = useNavigate();

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        const payload = toDto(form);
        await transportApi.create(payload);
        navigate("/dashboard/requests")
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
                        <Typography variant="h6" mb={1} className="add-transport-page__title">Добавление заявки на перевозку транспорта</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="add-transport-page__subtitle">
                            Укажите, пожалуйста, пункты загрузки и выгрузки, параметры груза и контактную информацию.
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }} className="add-transport-page__content-paper">
                <Typography variant="h6" mb={1} className="add-transport-page__title">Информация о транспорте</Typography>
                <Typography variant="body2" color="text.secondary" mb={2} className="add-transport-page__subtitle">
                    Укажите как можно подробнее доступную информацию о грузе.
                </Typography>

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
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Место загрузки</Typography>
                                        <Stack spacing={1}>
                                            {form.loadPlaces.map((p, i) => (
                                                <PlaceRow
                                                    key={i}
                                                    labelPrefix={i === 0 ? "загрузки" : `загрузки ${i + 1}`}
                                                    place={p}
                                                    geos={init?.geos ?? null}
                                                    errorKey={i === 0 ? errors.loadPlaces : undefined}
                                                    showRemove={i > 0}
                                                    onRemove={() => rmLoad(i)}
                                                    onChange={(np) => updateLoad(i, np)}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Место выгрузки</Typography>
                                        <Stack spacing={1}>
                                            {form.unloadPlaces.map((p, i) => (
                                                <PlaceRow
                                                    key={i}
                                                    labelPrefix={i === 0 ? "выгрузки" : `выгрузки ${i + 1}`}
                                                    place={p}
                                                    geos={init?.geos ?? null}
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
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип автомобиля</Typography>
                                        <Select
                                            fullWidth 
                                            displayEmpty
                                            value={form.vehicleType}
                                            onChange={(e) => setField("vehicleType", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите тип автомобиля</em>;
                                                }
                                                return VEHICLE_TYPES_LABELS[selected] ?? selected;
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em style={{ color: '#999' }}>Выберите тип автомобиля</em>
                                            </MenuItem>
                                            {(init ? Object.keys(init.vehicleType) : ["ANY"]).map((key) => (
                                                <MenuItem key={key} value={key}>
                                                    {VEHICLE_TYPES_LABELS[key] ?? key}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.vehicleType && (
                                            <Typography variant="caption" color="error">{errors.vehicleType}</Typography>
                                        )}
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Количество автомобилей</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder="Укажите количество автомобилей"
                                            value={form.vehiclesCount ?? ""} 
                                            onChange={(e) => setField("vehiclesCount", Number(e.target.value || 0))}
                                        />
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Грузоподъемность (т)</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder="Укажите грузоподъемность"
                                            value={form.capacityTons ?? ""} 
                                            onChange={(e) => setField("capacityTons", num(e.target.value))}
                                        />
                                    </Grid>

                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Объем (м³)</Typography>
                                        <TextField
                                            type="number" 
                                            fullWidth
                                            placeholder="Укажите объем"
                                            value={form.volumeM3 ?? ""} 
                                            onChange={(e) => setField("volumeM3", num(e.target.value))}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {activeStep === 2 && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Размеры кузова</Typography>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            Укажите длину, ширину и высоту в метрах
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    label="Длина (м)" type="number" placeholder="Укажите длину" fullWidth
                                                    value={form.bodyLength ?? ""} onChange={(e) => setField("bodyLength", num(e.target.value))}
                                                    error={!!errors.bodyHeight} helperText={errors.bodyHeight && "Fill all body dimensions"}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    label="Ширина (м)" type="number" placeholder="Укажите ширину" fullWidth
                                                    value={form.bodyWidth ?? ""} onChange={(e) => setField("bodyWidth", num(e.target.value))}
                                                />
                                            </Grid>
                                            <Grid size={{ xs:12, lg:4 }}>
                                                <TextField
                                                    label="Высота (м)" type="number" placeholder="Укажите высоту" fullWidth
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
                                                className="price-input-field"
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
                                            value={form.paymentMethod} 
                                            onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите метод оплаты</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em style={{ color: '#999' }}>Выберите метод оплаты</em>
                                            </MenuItem>
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
                                            value={form.paymentTerm} 
                                            onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                            renderValue={(selected) => {
                                                if (!selected || selected === "") {
                                                    return <em style={{ color: '#999' }}>Выберите срок оплаты</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em style={{ color: '#999' }}>Выберите срок оплаты</em>
                                            </MenuItem>
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
                                            value={form.bargaining}
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
                                            label="E-mail" placeholder="email@example.com" fullWidth
                                            value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:12 }}>
                                        <TextField
                                            className="additional-info-field"
                                            label="Дополнительная информация" 
                                            placeholder="Укажите дополнительную информацию"
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

                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Box component="form" onSubmit={onSubmit} noValidate className="add-transport-page__form">
                        <Grid container spacing={2}>
                            <Grid size={{xs:12, md:6}}>
                                <TextField
                                    label="Дата загрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                    value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                    error={!!errors.dateFrom} helperText={errors.dateFrom}
                                />
                            </Grid>
                            <Grid size={{xs:12, md:6}}>
                                <TextField
                                    label="Дата выгрузки" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                    value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                    error={!!errors.dateTo} helperText={errors.dateTo}
                                />
                            </Grid>

                            <Grid size={{xs:12, md:6}}>
                                <Stack flexDirection="column" spacing={1}>
                                    {form.loadPlaces.map((p, i) => (
                                        <PlaceRow
                                            key={i}
                                            labelPrefix={i === 0 ? "загрузки" : `загрузки ${i + 1}`}
                                            place={p}
                                            geos={init?.geos ?? null}
                                            errorKey={i === 0 ? errors.loadPlaces : undefined}
                                            showRemove={i > 0}
                                            onRemove={() => rmLoad(i)}
                                            onChange={(np) => updateLoad(i, np)}
                                        />
                                    ))}
                                </Stack>
                            </Grid>

                            <Grid size={{xs:12, md:6}}>
                                <Stack  flexDirection="column" spacing={1}>
                                    {form.unloadPlaces.map((p, i) => (
                                        <PlaceRow
                                            key={i}
                                            labelPrefix={i === 0 ? "выгрузки" : `выгрузки ${i + 1}`}
                                            place={p}
                                            geos={init?.geos ?? null}
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

                        <Grid size={{xs:12, md:6}}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Тип автомобиля</Typography>
                            <Select
                                fullWidth 
                                displayEmpty
                                value={form.vehicleType}
                                onChange={(e) => setField("vehicleType", e.target.value as string)}
                                renderValue={(selected) => {
                                    if (!selected || selected === "") {
                                        return <em style={{ color: '#999' }}>Выберите тип автомобиля</em>;
                                    }
                                    return VEHICLE_TYPES_LABELS[selected] ?? selected;
                                }}
                            >
                                <MenuItem value="">
                                    <em style={{ color: '#999' }}>Выберите тип автомобиля</em>
                                </MenuItem>
                                {(init ? Object.keys(init.vehicleType) : ["ANY"]).map((key) => (
                                    <MenuItem key={key} value={key}>
                                        {VEHICLE_TYPES_LABELS[key] ?? key}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.vehicleType && (
                                <Typography variant="caption" color="error">{errors.vehicleType}</Typography>
                            )}
                        </Grid>

                            <Grid size={{xs:12, md:6}}>
                                <TextField
                                    label="Количество автомобилей" type="number" fullWidth
                                    value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", Number(e.target.value || 0))}
                                />
                            </Grid>

<Grid size={{xs:12}}>
    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Указать габариты груза</Typography>

    <Grid container spacing={1}>
        <Grid size={{xs:12, lg:4}}>
            <TextField
                 type="number" placeholder="Длина (м)" fullWidth
                value={form.bodyLength ?? ""} onChange={(e) => setField("bodyLength", num(e.target.value))}
                error={!!errors.bodyHeight} helperText={errors.bodyHeight && "Fill all body dimensions"}
            />
        </Grid>
        <Grid size={{xs:12, lg:4}}>
            <TextField
                type="number" placeholder="Ширина (м)" fullWidth
                value={form.bodyWidth ?? ""} onChange={(e) => setField("bodyWidth", num(e.target.value))}
            />
        </Grid>
        <Grid size={{xs:12, lg:4}}>
            <TextField
                type="number" placeholder="Высота (м)" fullWidth
                value={form.bodyHeight ?? ""} onChange={(e) => setField("bodyHeight", num(e.target.value))}
            />
        </Grid>
    </Grid>
</Grid>


                            <Grid size={{xs:12, md:6}}>
                                <TextField
                                    label="Объём (м³):" type="number" fullWidth placeholder="Укажите объём"
                                    value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                                />
                            </Grid>


                            <Grid size={{xs:12, md:6}}>
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
                                        className="price-input-field"
                                        label="Стоимость" type="number" fullWidth
                                        value={form.price ?? ""} onChange={(e) => setField("price", num(e.target.value))}
                                    />
                                </Stack>
                            </Grid>

                            <Grid size={{xs:12, md:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Метод оплаты</Typography>
                                <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentMethod} 
                                    onChange={(e) => setField("paymentMethod", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите метод оплаты</em>;
                                        }
                                        return selected;
                                    }}
                                >
                                    <MenuItem value="">
                                        <em style={{ color: '#999' }}>Выберите метод оплаты</em>
                                    </MenuItem>
                                    {(init ? Object.keys(init.paymentMethods) : []).map((m) => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </Select>
                                {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                            </Grid>

                            <Grid size={{xs:12, md:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Срок оплаты</Typography>
                                <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.paymentTerm} 
                                    onChange={(e) => setField("paymentTerm", e.target.value as string)}
                                    renderValue={(selected) => {
                                        if (!selected || selected === "") {
                                            return <em style={{ color: '#999' }}>Выберите срок оплаты</em>;
                                        }
                                        return selected;
                                    }}
                                >
                                    <MenuItem value="">
                                        <em style={{ color: '#999' }}>Выберите срок оплаты</em>
                                    </MenuItem>
                                    {(init ? Object.keys(init.paymentTerms) : []).map((t) => (
                                        <MenuItem key={t} value={t}>{t}</MenuItem>
                                    ))}
                                </Select>
                                {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                            </Grid>

                            <Grid size={{xs:12, md:6}}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Торг</Typography>
                                <Select
                                    fullWidth 
                                    displayEmpty
                                    value={form.bargaining}
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

                            <Grid size={{xs:12, md:6}}>
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

                            <Grid size={{xs:12, md:6}}>
                                <TextField
                                    label="E-mail" placeholder="email@example.com" fullWidth
                                    value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                                />
                            </Grid>

                            <Grid size={{xs:12}}>
                                <TextField
                                    label="Дополнительная информация" placeholder="Укажите дополнительную информацию"
                                    fullWidth multiline minRows={3} className="additional-info-field"
                                    value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                                />
                            </Grid>

                            <Grid size={{xs:12}}>
                                <Stack direction="row" justifyContent="center" mt={1.5}>
                                    <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit}>
                                        Добавить транспорт
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