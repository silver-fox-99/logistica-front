
import { useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    FormControlLabel, Checkbox, Select, MenuItem, Chip, RadioGroup, Radio
} from "@mui/material";
import Grid from "@mui/material/Grid"; 
import { FiPlus, FiTrash2 } from "react-icons/fi";
import api from "@/shared/api/axios";

/* --- options --- */
const VEHICLE_TYPES = [
    "Curtain (Tautliner)", "Reefer", "Box", "Flatbed", "Platform",
    "Tipper", "Lowboy", "Container carrier", "Car carrier", "Dump truck",
    "Grain truck", "Cement truck", "Isotherm", "Oversize", "Other"
] as const;
const LOAD_TYPES = ["Rear", "Side", "Top"] as const;
const TAX_TYPES = ["VAT (20%)", "VAT (0%)", "No VAT"] as const;
const PAYMENT_METHODS = ["Cash", "Bank transfer", "Mixed"] as const;
const PAYMENT_TERMS = ["On delivery", "Prepayment", "Deferred payment"] as const;
const CURRENCIES = ["USD", "EUR", "UZS"] as const;
const PRICE_UNITS = ["Total", "Per ton", "Per km"] as const;

/* --- types --- */
type Place = { name: string };
type FormValues = {
    dateFrom: string;
    dateTo: string;

    loadPlaces: Place[];
    unloadPlaces: Place[];

    vehicleType: string;
    vehiclesCount: number;
    loadType: string;

    capacityTons?: number;
    volumeM3?: number;

    dimsEnabled: boolean;
    bodyLength?: number;
    bodyWidth?: number;
    bodyHeight?: number;

    currency: (typeof CURRENCIES)[number];
    price?: number;
    priceUnit: (typeof PRICE_UNITS)[number];
    tax: string;
    paymentMethod: string;
    paymentTerm: string;
    bargaining: "possible" | "none";

    contactPrimary: string;
    contactSecondary?: string;
    email?: string;
    note?: string;
};

const CONTACTS = {
    phones: ["+380 097 000 0000", "+380 097 000 0001", "+380 097 000 0002"],
    email: "email@gmail.com",
};

export default function AddTransportPage() {
    const [form, setForm] = useState<FormValues>({
        dateFrom: "", dateTo: "",
        loadPlaces: [{ name: "" }], unloadPlaces: [{ name: "" }],

        vehicleType: "", vehiclesCount: 1, loadType: "",

        capacityTons: undefined, volumeM3: undefined,
        dimsEnabled: false, bodyLength: undefined, bodyWidth: undefined, bodyHeight: undefined,

        currency: "USD", price: undefined, priceUnit: "Total",
        tax: "", paymentMethod: "", paymentTerm: "", bargaining: "possible",

        contactPrimary: CONTACTS.phones[0], contactSecondary: CONTACTS.phones[1],
        email: CONTACTS.email,

        note: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setForm((s) => ({ ...s, [key]: value }));

    const num = (v: string) => (v === "" ? undefined : Number(v));

    /* places helpers */
    const addLoad = () => setField("loadPlaces", [...form.loadPlaces, { name: "" }]);
    const rmLoad = (i: number) =>
        setField("loadPlaces", form.loadPlaces.filter((_, idx) => idx !== i));
    const addUnload = () => setField("unloadPlaces", [...form.unloadPlaces, { name: "" }]);
    const rmUnload = (i: number) =>
        setField("unloadPlaces", form.unloadPlaces.filter((_, idx) => idx !== i));

    /* simple validation */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = "Required";
        if (!form.dateTo) e.dateTo = "Required";
        if (!form.loadPlaces[0]?.name) e.loadPlaces = "At least one loading place";
        if (!form.unloadPlaces[0]?.name) e.unloadPlaces = "At least one unloading place";
        if (!form.vehicleType) e.vehicleType = "Select vehicle type";
        if (!form.loadType) e.loadType = "Select load type";
        if (!form.tax) e.tax = "Select tax type";
        if (!form.paymentMethod) e.paymentMethod = "Select payment method";
        if (!form.paymentTerm) e.paymentTerm = "Select payment term";
        if (form.dimsEnabled) {
            if (form.bodyLength == null || form.bodyWidth == null || form.bodyHeight == null) {
                e.bodyHeight = "Fill all body dimensions";
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;

        // TODO: адаптируй payload под свой DTO бэка
        await api.post("/transport", form);
        // redirect/notify...
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
                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                label="Loading date from" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateFrom} onChange={(e) => setField("dateFrom", e.target.value)}
                                error={!!errors.dateFrom} helperText={errors.dateFrom}
                            />
                        </Grid>
                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                label="Loading date to" type="date" InputLabelProps={{ shrink: true }} fullWidth
                                value={form.dateTo} onChange={(e) => setField("dateTo", e.target.value)}
                                error={!!errors.dateTo} helperText={errors.dateTo}
                            />
                        </Grid>

                        {/* Places */}
                        <Grid size={{xs:12, md: 6}}>
                            <Stack spacing={1}>
                                {form.loadPlaces.map((p, i) => (
                                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={i === 0 ? "Loading place" : `Loading place ${i + 1}`}
                                            placeholder="Start typing a name" fullWidth
                                            value={p.name}
                                            onChange={(e) => {
                                                const next = [...form.loadPlaces];
                                                next[i] = { name: e.target.value };
                                                setField("loadPlaces", next);
                                            }}
                                            error={!!errors.loadPlaces && i === 0}
                                            helperText={i === 0 ? errors.loadPlaces : ""}
                                        />
                                        {i > 0 && (
                                            <Button variant="text" color="error" onClick={() => rmLoad(i)}>
                                                <FiTrash2 />
                                            </Button>
                                        )}
                                    </Stack>
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={addLoad}>
                                    Add loading place
                                </Button>
                            </Stack>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <Stack spacing={1}>
                                {form.unloadPlaces.map((p, i) => (
                                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={i === 0 ? "Unloading place" : `Unloading place ${i + 1}`}
                                            placeholder="Start typing a name" fullWidth
                                            value={p.name}
                                            onChange={(e) => {
                                                const next = [...form.unloadPlaces];
                                                next[i] = { name: e.target.value };
                                                setField("unloadPlaces", next);
                                            }}
                                            error={!!errors.unloadPlaces && i === 0}
                                            helperText={i === 0 ? errors.unloadPlaces : ""}
                                        />
                                        {i > 0 && (
                                            <Button variant="text" color="error" onClick={() => rmUnload(i)}>
                                                <FiTrash2 />
                                            </Button>
                                        )}
                                    </Stack>
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={addUnload}>
                                    Add unloading place
                                </Button>
                            </Stack>
                        </Grid>

                        {/* Vehicle & load */}
                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                select label="Vehicle type" fullWidth
                                value={form.vehicleType} onChange={(e) => setField("vehicleType", e.target.value)}
                                error={!!errors.vehicleType} helperText={errors.vehicleType}
                            >
                                {VEHICLE_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                label="Vehicles count" type="number" fullWidth
                                value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", Number(e.target.value || 0))}
                            />
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                select label="Load type" fullWidth
                                value={form.loadType} onChange={(e) => setField("loadType", e.target.value)}
                                error={!!errors.loadType} helperText={errors.loadType}
                            >
                                {LOAD_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                label="Payload capacity, t" type="number" fullWidth
                                value={form.capacityTons ?? ""} onChange={(e) => setField("capacityTons", num(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
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
                                <Grid size={{xs:12, sm:4}} >
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
                                <Grid size={{xs:12, sm:4}} >
                                    <TextField
                                        label="Height (m)" type="number" fullWidth disabled={!form.dimsEnabled}
                                        value={form.bodyHeight ?? ""} onChange={(e) => setField("bodyHeight", num(e.target.value))}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Pricing */}
                        <Grid size={{xs:12, md: 6}}>
                            <Stack direction="row" spacing={1}>
                                <Select
                                    size="small" sx={{ minWidth: 100, alignSelf: "center" }}
                                    value={form.currency} onChange={(e) => setField("currency", e.target.value as FormValues["currency"])}
                                >
                                    {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
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

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                select label="Tax type" fullWidth
                                value={form.tax} onChange={(e) => setField("tax", e.target.value)}
                                error={!!errors.tax} helperText={errors.tax}
                            >
                                {TAX_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                select label="Payment method" fullWidth
                                value={form.paymentMethod} onChange={(e) => setField("paymentMethod", e.target.value)}
                                error={!!errors.paymentMethod} helperText={errors.paymentMethod}
                            >
                                {PAYMENT_METHODS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                select label="Payment term" fullWidth
                                value={form.paymentTerm} onChange={(e) => setField("paymentTerm", e.target.value)}
                                error={!!errors.paymentTerm} helperText={errors.paymentTerm}
                            >
                                {PAYMENT_TERMS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                select label="Bargaining" fullWidth
                                value={form.bargaining} onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}
                            >
                                <MenuItem value="possible">Negotiable</MenuItem>
                                <MenuItem value="none">Not negotiable</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Contacts */}
                        <Grid size={{xs:12}}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" mt={1}>Select contacts to show in the order</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                These are your saved contacts from the Profile section.
                            </Typography>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Primary phone</Typography>
                            <RadioGroup
                                value={form.contactPrimary}
                                onChange={(e) => setField("contactPrimary", e.target.value)}
                            >
                                {CONTACTS.phones.map((p) => (
                                    <FormControlLabel key={p} value={p} control={<Radio />} label={p} />
                                ))}
                            </RadioGroup>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Additional phone</Typography>
                            <RadioGroup
                                value={form.contactSecondary ?? ""}
                                onChange={(e) => setField("contactSecondary", e.target.value || undefined)}
                            >
                                <FormControlLabel value="" control={<Radio />} label="No additional phone" />
                                {CONTACTS.phones.map((p) => (
                                    <FormControlLabel key={p} value={p} control={<Radio />} label={p} />
                                ))}
                            </RadioGroup>
                        </Grid>

                        <Grid size={{xs:12, md: 6}}>
                            <TextField
                                label="E-mail" placeholder="email@example.com" fullWidth
                                value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                                error={!!errors.email} helperText={errors.email}
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
                                <Button type="submit" variant="contained" sx={{ minWidth: 280 }}>
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
