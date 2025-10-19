import { useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    FormControlLabel, RadioGroup, Radio, Select, MenuItem, Chip, FormHelperText, InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import api from "@/shared/api/axios";

const CARGO_TYPES = [
    "Palletized cargo","Equipment","Building materials","Metal","Pipes","Food","Big-bag cargo",
    "Container","Cement","Bitumen","Fuel","Flour","Oversize","Cars","Wood","Concrete products","Furniture","Other"
] as const;

const VEHICLE_TYPES = [
    "Curtain (Tautliner)","Reefer","Flatbed","Box","Tipper","Platform","Lowboy",
    "Container carrier","Car carrier","Cement truck","Tow truck","Grain truck","Dump truck"
] as const;

const LOAD_TYPES = ["Rear","Side","Top"] as const;
const TAX_TYPES = ["VAT (20%)","VAT (0%)","No VAT"] as const;
const PAYMENT_METHODS = ["Cash","Bank transfer","Mixed"] as const;
const PAYMENT_TERMS = ["On delivery","Prepayment","Deferred payment"] as const;
const CURRENCIES = ["USD","EUR","UZS"] as const;

type Place = { name: string };
type Dims = { enabled: boolean; length?: number; width?: number; height?: number };

type FormValues = {
    dateFrom: string;
    dateTo: string;
    loadPlaces: Place[];
    unloadPlaces: Place[];
    cargoType: string;
    vehicleType: string;
    loadType: string;
    partialLoad: "no" | "partial" | "available";
    vehiclesCount?: number;
    weightTons?: number;
    volumeM3?: number;
    dims: Dims;
    currency: (typeof CURRENCIES)[number];
    price?: number;
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

export default function AddCargoPage() {
    const [form, setForm] = useState<FormValues>({
        dateFrom: "", dateTo: "",
        loadPlaces: [{ name: "" }], unloadPlaces: [{ name: "" }],
        cargoType: "", vehicleType: "", loadType: "",
        partialLoad: "available", vehiclesCount: 1,
        weightTons: undefined, volumeM3: undefined,
        dims: { enabled: false, length: undefined, width: undefined, height: undefined },
        currency: "USD", price: undefined, tax: "",
        paymentMethod: "", paymentTerm: "", bargaining: "possible",
        contactPrimary: CONTACTS.phones[0], contactSecondary: CONTACTS.phones[1],
        email: CONTACTS.email, note: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const dimsEnabled = form.dims.enabled;

    const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setForm((s) => ({ ...s, [key]: value }));

    const numberOrUndef = (v: string) => (v === "" ? undefined : Number(v));

    const addLoad = () => setField("loadPlaces", [...form.loadPlaces, { name: "" }]);
    const removeLoad = (idx: number) =>
        setField("loadPlaces", form.loadPlaces.filter((_, i) => i !== idx));
    const addUnload = () => setField("unloadPlaces", [...form.unloadPlaces, { name: "" }]);
    const removeUnload = (idx: number) =>
        setField("unloadPlaces", form.unloadPlaces.filter((_, i) => i !== idx));

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.dateFrom) e.dateFrom = "Required";
        if (!form.dateTo) e.dateTo = "Required";
        if (!form.loadPlaces[0]?.name) e.loadPlaces = "At least one loading place";
        if (!form.unloadPlaces[0]?.name) e.unloadPlaces = "At least one unloading place";
        if (!form.cargoType) e.cargoType = "Select cargo type";
        if (!form.vehicleType) e.vehicleType = "Select vehicle type";
        if (!form.loadType) e.loadType = "Select load type";
        if (!form.tax) e.tax = "Select tax type";
        if (!form.paymentMethod) e.paymentMethod = "Select payment method";
        if (!form.paymentTerm) e.paymentTerm = "Select payment term";
        if (!form.contactPrimary) e.contactPrimary = "Choose a phone";
        if (dimsEnabled) {
            if (form.dims.length == null || form.dims.width == null || form.dims.height == null) {
                e.dims = "Fill all dimensions";
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;

        // тут адаптируй под свой DTO бэка
        const payload = { ...form };
        await api.post("/cargo", payload);
        // redirect/notify…
    };

    const dimsHelper = useMemo(
        () => (errors.dims ? errors.dims : "Enter length, width and height in meters"),
        [errors.dims]
    );

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="h6">Add a cargo request</Typography>
                <Typography variant="body2" color="text.secondary">
                    Provide loading/unloading points, cargo parameters and contact information.
                </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" mb={1}>Cargo information</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Fill as much details as possible.
                </Typography>

                <Box component="form" noValidate onSubmit={onSubmit}>
                    <Grid container spacing={2}>
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

                        <Grid size={{xs:12, md:6}}>
                            <Stack spacing={1}>
                                {form.loadPlaces.map((p, idx) => (
                                    <Stack key={idx} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={idx === 0 ? "Loading place" : `Loading place ${idx + 1}`}
                                            placeholder="Start typing a name" fullWidth
                                            value={p.name}
                                            onChange={(e) => {
                                                const next = [...form.loadPlaces];
                                                next[idx] = { name: e.target.value };
                                                setField("loadPlaces", next);
                                            }}
                                            error={!!errors.loadPlaces && idx === 0}
                                            helperText={idx === 0 ? errors.loadPlaces : ""}
                                        />
                                        {idx > 0 && (
                                            <Button variant="text" color="error" onClick={() => removeLoad(idx)}>
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

                        <Grid size={{xs:12, md:6}}>
                            <Stack spacing={1}>
                                {form.unloadPlaces.map((p, idx) => (
                                    <Stack key={idx} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={idx === 0 ? "Unloading place" : `Unloading place ${idx + 1}`}
                                            placeholder="Start typing a name" fullWidth
                                            value={p.name}
                                            onChange={(e) => {
                                                const next = [...form.unloadPlaces];
                                                next[idx] = { name: e.target.value };
                                                setField("unloadPlaces", next);
                                            }}
                                            error={!!errors.unloadPlaces && idx === 0}
                                            helperText={idx === 0 ? errors.unloadPlaces : ""}
                                        />
                                        {idx > 0 && (
                                            <Button variant="text" color="error" onClick={() => removeUnload(idx)}>
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

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Cargo type" fullWidth
                                       value={form.cargoType} onChange={(e) => setField("cargoType", e.target.value)}
                                       error={!!errors.cargoType} helperText={errors.cargoType}>
                                {CARGO_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Vehicle type" fullWidth
                                       value={form.vehicleType} onChange={(e) => setField("vehicleType", e.target.value)}
                                       error={!!errors.vehicleType} helperText={errors.vehicleType}>
                                {VEHICLE_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Load type" fullWidth
                                       value={form.loadType} onChange={(e) => setField("loadType", e.target.value)}
                                       error={!!errors.loadType} helperText={errors.loadType}>
                                {LOAD_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Partial load" fullWidth
                                       value={form.partialLoad} onChange={(e) => setField("partialLoad", e.target.value as FormValues["partialLoad"])}>
                                <MenuItem value="no">No partial load (separate vehicle)</MenuItem>
                                <MenuItem value="partial">Partial load</MenuItem>
                                <MenuItem value="available">Partial load available</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField label="Weight, t" type="number" fullWidth
                                       value={form.weightTons ?? ""} onChange={(e) => setField("weightTons", numberOrUndef(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <TextField label="Volume, m³" type="number" fullWidth
                                       value={form.volumeM3 ?? ""} onChange={(e) => setField("volumeM3", numberOrUndef(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <FormControlLabel
                                control={
                                    <Radio
                                        checked={dimsEnabled}
                                        onChange={() => setField("dims", { ...form.dims, enabled: !dimsEnabled })}
                                    />
                                }
                                label="Specify cargo dimensions"
                            />
                            <Chip label={dimsHelper} variant="outlined" color={errors.dims ? "error" : "default"} sx={{ mb: 1 }} />
                            <FormHelperText error>{errors.dims}</FormHelperText>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1}>
                                <TextField label="Length (m)" type="number" fullWidth disabled={!dimsEnabled}
                                           value={form.dims.length ?? ""} onChange={(e) => setField("dims", { ...form.dims, length: numberOrUndef(e.target.value) })}
                                />
                                <TextField label="Width (m)" type="number" fullWidth disabled={!dimsEnabled}
                                           value={form.dims.width ?? ""} onChange={(e) => setField("dims", { ...form.dims, width: numberOrUndef(e.target.value) })}
                                />
                                <TextField label="Height (m)" type="number" fullWidth disabled={!dimsEnabled}
                                           value={form.dims.height ?? ""} onChange={(e) => setField("dims", { ...form.dims, height: numberOrUndef(e.target.value) })}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <Stack direction="row" spacing={1}>
                                <Select size="small" sx={{ minWidth: 100, alignSelf: "center" }}
                                        value={form.currency} onChange={(e) => setField("currency", e.target.value as FormValues["currency"])}>
                                    {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                                <TextField
                                    label="Price" type="number" fullWidth
                                    InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                                    value={form.price ?? ""} onChange={(e) => setField("price", numberOrUndef(e.target.value))}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Tax type" fullWidth
                                       value={form.tax} onChange={(e) => setField("tax", e.target.value)}
                                       error={!!errors.tax} helperText={errors.tax}>
                                {TAX_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Payment method" fullWidth
                                       value={form.paymentMethod} onChange={(e) => setField("paymentMethod", e.target.value)}
                                       error={!!errors.paymentMethod} helperText={errors.paymentMethod}>
                                {PAYMENT_METHODS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Payment term" fullWidth
                                       value={form.paymentTerm} onChange={(e) => setField("paymentTerm", e.target.value)}
                                       error={!!errors.paymentTerm} helperText={errors.paymentTerm}>
                                {PAYMENT_TERMS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField select label="Bargaining" fullWidth
                                       value={form.bargaining} onChange={(e) => setField("bargaining", e.target.value as FormValues["bargaining"])}>
                                <MenuItem value="possible">Negotiable</MenuItem>
                                <MenuItem value="none">Not negotiable</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <TextField label="Vehicles count" type="number" fullWidth
                                       value={form.vehiclesCount ?? ""} onChange={(e) => setField("vehiclesCount", numberOrUndef(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" mt={1}>Select contacts to show in the order</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                These are your saved contacts from the Profile section. You can change them later.
                            </Typography>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Primary phone</Typography>
                            <RadioGroup
                                value={form.contactPrimary}
                                onChange={(e) => setField("contactPrimary", e.target.value)}
                            >
                                {CONTACTS.phones.map((p) => (
                                    <FormControlLabel key={p} value={p} control={<Radio />} label={p} />
                                ))}
                            </RadioGroup>
                            <FormHelperText error>{errors.contactPrimary}</FormHelperText>
                        </Grid>

                        <Grid size={{xs:12, md:6}}>
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

                        <Grid size={{xs:12, md:6}}>
                            <TextField
                                label="E-mail" placeholder="email@example.com" fullWidth
                                value={form.email ?? ""} onChange={(e) => setField("email", e.target.value || undefined)}
                                error={!!errors.email} helperText={errors.email}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <TextField
                                label="Additional information" placeholder="Provide any extra details"
                                fullWidth multiline minRows={3}
                                value={form.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Stack direction="row" justifyContent="center" mt={1.5}>
                                <Button type="submit" variant="contained" sx={{ minWidth: 280 }}>
                                    Publish cargo
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}
