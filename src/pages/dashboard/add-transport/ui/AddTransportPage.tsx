import { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    FormControlLabel, Checkbox, Select, MenuItem, Chip, Autocomplete
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { transportApi, type CreateTransportDto } from "@/shared/api/transportApi";
import {useNavigate} from "react-router-dom";

/* --- labels for vehicleType enum keys --- */
const VEHICLE_TYPES_LABELS: Record<string, string> = {
    ANY: "Any",
    TENT: "Curtain (Tautliner)",
    REFRIGERATOR: "Reefer",
    VAN: "Box/Van",
    PLATFORM: "Platform/Flatbed",
};

const PRICE_UNITS = ["Total", "Per ton", "Per km"] as const;

/* ---------- Types ---------- */
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

    loadPlaces: Place[];    // минимум 1, но можно больше (UI поддерживает)
    unloadPlaces: Place[];

    vehicleType: string;    // enum key из init.vehicleType (ANY/...)
    vehiclesCount: number;

    capacityTons?: number;  // weight_t
    volumeM3?: number;      // volume_m3

    dimsEnabled: boolean;
    bodyLength?: number;
    bodyWidth?: number;
    bodyHeight?: number;

    currency: string;       // enum key из init.currency (USD/EUR/…)
    price?: number;
    priceUnit: (typeof PRICE_UNITS)[number]; // UI-only

    tax: string;            // UI-only
    paymentMethod: string;  // enum key из init.paymentMethods
    paymentTerm: string;    // enum key из init.paymentTerms
    bargaining: "possible" | "none";

    contactSecondary?: string; // -> contact_extra_phone
    email?: string;            // UI-only
    note?: string;
};

/* ---------- Helpers to build geo lookups ---------- */
function buildGeoMaps(geos: Geo[]) {
    const byId = new Map<string, Geo>();
    const countries: Geo[] = [];
    const regionsByCountry = new Map<string, Geo[]>(); // countryId -> regions[]
    const citiesByParent = new Map<string, Geo[]>();    // parentId -> cities[] (parent может быть country или region)

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

    // стабильная сортировка по имени
    countries.sort((a, b) => a.name.localeCompare(b.name));
    regionsByCountry.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    citiesByParent.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));

    return { byId, countries, regionsByCountry, citiesByParent };
}

/* ---------- PlaceRow (UI для одной точки) ---------- */
type PlaceRowProps = {
    labelPrefix: string; // "Loading" | "Unloading"
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
    // Город может висеть на стране или на регионе — дадим оба списка
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
        <Stack spacing={1}>
            <Stack direction={{ xs: "column", sm: "column" }} spacing={1} alignItems="stretch">
                <Autocomplete
                    options={countries}
                    getOptionLabel={(o) => o.name}
                    value={countryValue}
                    onChange={(_, v) => {
                        // при смене страны сбрасываем регион/город
                        onChange({ ...place, countryId: v?.id ?? null, regionId: null, cityId: null });
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label={`${labelPrefix} country`} placeholder="Select country" />
                    )}
                    sx={{ flex: 1, minWidth: 220 }}
                />

                <Autocomplete
                    options={regions}
                    getOptionLabel={(o) => o.name}
                    value={regionValue}
                    onChange={(_, v) => {
                        // при смене региона сбрасываем город
                        onChange({ ...place, regionId: v?.id ?? null, cityId: null });
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label={`${labelPrefix} region`} placeholder="Select region (optional)" />
                    )}
                    disabled={!selectedCountry || regions.length === 0}
                    sx={{ flex: 1, minWidth: 220 }}
                />

                <Autocomplete
                    options={mergedCities}
                    getOptionLabel={(o) => o.name}
                    value={cityValue}
                    onChange={(_, v) => onChange({ ...place, cityId: v?.id ?? null })}
                    renderInput={(params) => (
                        <TextField {...params} label={`${labelPrefix} city`} placeholder="Select city (optional)"/>
                    )}
                    disabled={!selectedCountry || mergedCities.length === 0}
                    sx={{ flex: 1, minWidth: 220 }}
                />

                {showRemove && (
                    <Button variant="text" color="error" onClick={onRemove} sx={{ alignSelf: "center", minWidth: 40 }}>
                        <FiTrash2 />
                    </Button>
                )}
            </Stack>

            {!!errorText && (
                <Typography variant="caption" color="error">{errorText}</Typography>
            )}
        </Stack>
    );
}

/* ===================== PAGE ===================== */

export default function AddTransportPage() {
    const [init, setInit] = useState<Awaited<ReturnType<typeof transportApi.init>> | null>(null);
    const [loadingInit, setLoadingInit] = useState(true);

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

    /* ----- load init ----- */
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

    /* ----- validation ----- */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = "Required";
        if (!form.dateTo) e.dateTo = "Required";

        // Бэк требует минимум 2 точки — мы проверяем, что первая loading и первая unloading указаны хотя бы по стране.
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

    /* ----- map IDs -> names for DTO ----- */
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

    /* ----- UI -> DTO ----- */
    const toDto = (v: FormValues): CreateTransportDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        // Берём первый loading и первый unloading как обязательные.
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

    return (
        <Box>
            {/* header */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="h6">Add a transport request</Typography>
                <Typography variant="body2" color="text.secondary">
                    Provide loading/unloading points, vehicle parameters and contact information.
                </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" mb={1}>Transport information</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Fill as many details as possible about your vehicle.
                </Typography>

                <Box component="form" onSubmit={onSubmit} noValidate>
                    <Grid container spacing={2}>
                        {/* Dates */}
                        <Grid size={{xs:12, md:6}}>
                            <TextField
                                label="Loading date from" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                error={!!errors.dateFrom} helperText={errors.dateFrom}
                            />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <TextField
                                label="Loading date to" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                error={!!errors.dateTo} helperText={errors.dateTo}
                            />
                        </Grid>

                        {/* Loading places (from init.geos) */}
                        <Grid size={{xs:12, md:6}}>
                            <Stack flexDirection="column" spacing={1}>
                                {form.loadPlaces.map((p, i) => (
                                    <PlaceRow
                                        key={i}
                                        labelPrefix={i === 0 ? "Loading" : `Loading ${i + 1}`}
                                        place={p}
                                        geos={init?.geos ?? null}
                                        errorKey={i === 0 ? errors.loadPlaces : undefined}
                                        showRemove={i > 0}
                                        onRemove={() => rmLoad(i)}
                                        onChange={(np) => updateLoad(i, np)}
                                    />
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={addLoad}>
                                    Add loading point
                                </Button>
                            </Stack>
                        </Grid>

                        {/* Unloading places (from init.geos) */}
                        <Grid size={{xs:12, md:6}}>
                            <Stack  flexDirection="column" spacing={1}>
                                {form.unloadPlaces.map((p, i) => (
                                    <PlaceRow
                                        key={i}
                                        labelPrefix={i === 0 ? "Unloading" : `Unloading ${i + 1}`}
                                        place={p}
                                        geos={init?.geos ?? null}
                                        errorKey={i === 0 ? errors.unloadPlaces : undefined}
                                        showRemove={i > 0}
                                        onRemove={() => rmUnload(i)}
                                        onChange={(np) => updateUnload(i, np)}
                                    />
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={addUnload}>
                                    Add unloading point
                                </Button>
                            </Stack>
                        </Grid>

                        {/* Vehicle */}
                        <Grid size={{xs:12, md:6}}>
                            <Select
                                fullWidth displayEmpty
                                value={form.vehicleType}
                                onChange={(e) => setField("vehicleType", e.target.value as string)}
                            >
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
                                label="Vehicles count" type="number" fullWidth
                                value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", Number(e.target.value || 0))}
                            />
                        </Grid>

                        {/* Capacity / Volume */}
                        <Grid size={{xs:12, md:6}}>
                            <TextField
                                label="Payload capacity, t" type="number" fullWidth
                                value={form.capacityTons ?? ""} onChange={(e) => setField("capacityTons", num(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <TextField
                                label="Volume, m³" type="number" fullWidth
                                value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", num(e.target.value))}
                            />
                        </Grid>

                        {/* Body dimensions */}
                        <Grid size={{xs:12}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.dimsEnabled}
                                        onChange={(e) => setField("dimsEnabled", e.target.checked)}
                                    />
                                }
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>Specify cargo body dimensions</span>
                                        <Chip label="Enter length, width and height in meters" variant="outlined" />
                                    </Stack>
                                }
                            />
                            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                <Grid size={{xs:12, sm:4}}>
                                    <TextField
                                        label="Length (m)" type="number" fullWidth disabled={!form.dimsEnabled}
                                        value={form.bodyLength ?? ""} onChange={(e) => setField("bodyLength", num(e.target.value))}
                                        error={!!errors.bodyHeight} helperText={errors.bodyHeight && "Fill all body dimensions"}
                                    />
                                </Grid>
                                <Grid size={{xs:12, sm:4}}>
                                    <TextField
                                        label="Width (m)" type="number" fullWidth disabled={!form.dimsEnabled}
                                        value={form.bodyWidth ?? ""} onChange={(e) => setField("bodyWidth", num(e.target.value))}
                                    />
                                </Grid>
                                <Grid size={{xs:12, sm:4}}>
                                    <TextField
                                        label="Height (m)" type="number" fullWidth disabled={!form.dimsEnabled}
                                        value={form.bodyHeight ?? ""} onChange={(e) => setField("bodyHeight", num(e.target.value))}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Pricing */}
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
                                    label="Price" type="number" fullWidth
                                    value={form.price ?? ""} onChange={(e) => setField("price", num(e.target.value))}
                                />
                                <Select
                                    size="small" sx={{ minWidth: 120, alignSelf: "center" }}
                                    value={form.priceUnit} onChange={(e) => setField("priceUnit", e.target.value as FormValues["priceUnit"])}
                                >
                                    {PRICE_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                </Select>
                            </Stack>
                        </Grid>

                        {/* Payments */}
                        <Grid size={{xs:12, md:6}}>
                            <Select
                                fullWidth displayEmpty
                                value={form.paymentMethod} onChange={(e) => setField("paymentMethod", e.target.value as string)}
                            >
                                {(init ? Object.keys(init.paymentMethods) : []).map((m) => (
                                    <MenuItem key={m} value={m}>{m}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentMethod && <Typography variant="caption" color="error">{errors.paymentMethod}</Typography>}
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <Select
                                fullWidth displayEmpty
                                value={form.paymentTerm} onChange={(e) => setField("paymentTerm", e.target.value as string)}
                            >
                                {(init ? Object.keys(init.paymentTerms) : []).map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                            {errors.paymentTerm && <Typography variant="caption" color="error">{errors.paymentTerm}</Typography>}
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <Select
                                fullWidth value={form.bargaining}
                                onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                            >
                                <MenuItem value="possible">Negotiable</MenuItem>
                                <MenuItem value="none">Not negotiable</MenuItem>
                            </Select>
                        </Grid>

                        {/* Contacts: only Additional phone -> contact_extra_phone */}
                        <Grid size={{xs:12}}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" mt={1}>Select contacts to show in the order</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Additional phone will be shown in the order.
                            </Typography>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
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

                        {/* Email (UI-only) */}
                        <Grid size={{xs:12, md:6}}>
                            <TextField
                                label="E-mail" placeholder="email@example.com" fullWidth
                                value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                            />
                        </Grid>

                        {/* Note */}
                        <Grid size={{xs:12}}>
                            <TextField
                                label="Additional information" placeholder="Provide any extra details"
                                fullWidth multiline minRows={3}
                                value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                            />
                        </Grid>

                        {/* Submit */}
                        <Grid size={{xs:12}}>
                            <Stack direction="row" justifyContent="center" mt={1.5}>
                                <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit}>
                                    Add vehicle
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}
