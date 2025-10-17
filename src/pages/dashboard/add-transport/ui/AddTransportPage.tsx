import { useFieldArray, useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider,
    FormControlLabel, Checkbox, Select, MenuItem, Chip, RadioGroup, Radio
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiPlus, FiTrash2 } from "react-icons/fi";

/* --- options --- */
const VEHICLE_TYPES = [
    "Curtain (Tautliner)", "Reefer", "Box", "Flatbed", "Platform",
    "Tipper", "Lowboy", "Container carrier", "Car carrier", "Dump truck",
    "Grain truck", "Cement truck", "Isotherm", "Oversize", "Other"
];
const LOAD_TYPES = ["Rear", "Side", "Top"];
const TAX_TYPES = ["VAT (20%)", "VAT (0%)", "No VAT"];
const PAYMENT_METHODS = ["Cash", "Bank transfer", "Mixed"];
const PAYMENT_TERMS = ["On delivery", "Prepayment", "Deferred payment"];
const CURRENCIES = ["USD", "EUR", "UZS"] as const;
const PRICE_UNITS = ["Total", "Per ton", "Per km"] as const;

/* --- validation --- */
const schema = z.object({
    dateFrom: z.string().min(1, "Required"),
    dateTo: z.string().min(1, "Required"),

    loadPlaces: z.array(z.object({ name: z.string().min(1, "Required") })).min(1),
    unloadPlaces: z.array(z.object({ name: z.string().min(1, "Required") })).min(1),

    vehicleType: z.string().min(1, "Select vehicle type"),
    vehiclesCount: z.coerce.number().int().min(1, "Min 1").max(100, "Max 100"),
    loadType: z.string().min(1, "Select load type"),

    capacityTons: z.coerce.number().gte(0).optional(),
    volumeM3: z.coerce.number().gte(0).optional(),

    dimsEnabled: z.boolean(),
    bodyLength: z.coerce.number().gte(0).optional(),
    bodyWidth: z.coerce.number().gte(0).optional(),
    bodyHeight: z.coerce.number().gte(0).optional(),
}).refine((v) => !v.dimsEnabled || (!!v.bodyLength && !!v.bodyWidth && !!v.bodyHeight), {
    message: "Fill all body dimensions",
    path: ["bodyHeight"],
}).and(z.object({
    currency: z.enum(CURRENCIES),
    price: z.coerce.number().gte(0).optional(),
    priceUnit: z.enum(PRICE_UNITS),
    tax: z.string().min(1, "Select tax type"),
    paymentMethod: z.string().min(1, "Select payment method"),
    paymentTerm: z.string().min(1, "Select payment term"),
    bargaining: z.enum(["possible", "none"]),
    contactPrimary: z.string().min(1, "Choose a phone"),
    contactSecondary: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    note: z.string().optional(),
}));

type FormValues = z.infer<typeof schema>;

/* mock contacts из профиля */
const CONTACTS = {
    phones: ["+380 097 000 0000", "+380 097 000 0001", "+380 097 000 0002"],
    email: "email@gmail.com",
};

export default function AddTransportPage() {
    const {
        register, control, handleSubmit, formState: { errors, isSubmitting },
        watch, setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            dateFrom: "", dateTo: "",
            loadPlaces: [{ name: "" }], unloadPlaces: [{ name: "" }],
            vehicleType: "", vehiclesCount: 1, loadType: "",
            capacityTons: undefined, volumeM3: undefined,
            dimsEnabled: false, bodyLength: undefined, bodyWidth: undefined, bodyHeight: undefined,
            currency: "USD", price: undefined, priceUnit: "Total",
            tax: "", paymentMethod: "", paymentTerm: "", bargaining: "possible",
            contactPrimary: CONTACTS.phones[0], contactSecondary: CONTACTS.phones[1], email: CONTACTS.email,
            note: "",
        },
        mode: "onTouched",
    });

    const { fields: loadFields, append: addLoad, remove: rmLoad } = useFieldArray({ control, name: "loadPlaces" });
    const { fields: unloadFields, append: addUnload, remove: rmUnload } = useFieldArray({ control, name: "unloadPlaces" });

    const dimsEnabled = watch("dimsEnabled");

    const onSubmit = async (data: FormValues) => {
        // TODO: call API
        console.log("create transport request:", data);
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

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Grid container spacing={2}>
                        {/* Dates */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Loading date from"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                {...register("dateFrom")}
                                error={!!errors.dateFrom}
                                helperText={errors.dateFrom?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Loading date to"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                {...register("dateTo")}
                                error={!!errors.dateTo}
                                helperText={errors.dateTo?.message}
                            />
                        </Grid>

                        {/* Places */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                {loadFields.map((f, i) => (
                                    <Stack key={f.id} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={i === 0 ? "Loading place" : `Loading place ${i + 1}`}
                                            placeholder="Start typing a name"
                                            fullWidth
                                            {...register(`loadPlaces.${i}.name` as const)}
                                            error={!!errors.loadPlaces?.[i]?.name}
                                            helperText={errors.loadPlaces?.[i]?.name?.message}
                                        />
                                        {i > 0 && (
                                            <Button variant="text" color="error" onClick={() => rmLoad(i)}>
                                                <FiTrash2 />
                                            </Button>
                                        )}
                                    </Stack>
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={() => addLoad({ name: "" })}>
                                    Add loading place
                                </Button>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                {unloadFields.map((f, i) => (
                                    <Stack key={f.id} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={i === 0 ? "Unloading place" : `Unloading place ${i + 1}`}
                                            placeholder="Start typing a name"
                                            fullWidth
                                            {...register(`unloadPlaces.${i}.name` as const)}
                                            error={!!errors.unloadPlaces?.[i]?.name}
                                            helperText={errors.unloadPlaces?.[i]?.name?.message}
                                        />
                                        {i > 0 && (
                                            <Button variant="text" color="error" onClick={() => rmUnload(i)}>
                                                <FiTrash2 />
                                            </Button>
                                        )}
                                    </Stack>
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={() => addUnload({ name: "" })}>
                                    Add unloading place
                                </Button>
                            </Stack>
                        </Grid>

                        {/* Vehicle & load */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select label="Vehicle type" fullWidth
                                {...register("vehicleType")} error={!!errors.vehicleType} helperText={errors.vehicleType?.message}
                            >
                                {VEHICLE_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Vehicles count" type="number" fullWidth
                                {...register("vehiclesCount")} error={!!errors.vehiclesCount} helperText={errors.vehiclesCount?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select label="Load type" fullWidth
                                {...register("loadType")} error={!!errors.loadType} helperText={errors.loadType?.message}
                            >
                                {LOAD_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Payload capacity, t" type="number" fullWidth
                                       {...register("capacityTons")} error={!!errors.capacityTons} helperText={errors.capacityTons?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Volume, m³" type="number" fullWidth
                                       {...register("volumeM3")} error={!!errors.volumeM3} helperText={errors.volumeM3?.message}
                            />
                        </Grid>

                        {/* Body dimensions (optional) */}
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={dimsEnabled}
                                        onChange={(e) => setValue("dimsEnabled", e.target.checked)}
                                    />
                                }
                                label={<Stack direction="row" spacing={1} alignItems="center">
                                    <span>Specify cargo body dimensions</span>
                                    <Chip label="Enter length, width and height in meters" variant="outlined" />
                                </Stack>}
                            />
                            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField label="Length (m)" type="number" fullWidth disabled={!dimsEnabled}
                                               {...register("bodyLength")} error={!!errors.bodyLength} helperText={errors.bodyHeight && "Fill all body dimensions"}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField label="Width (m)" type="number" fullWidth disabled={!dimsEnabled}
                                               {...register("bodyWidth")} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField label="Height (m)" type="number" fullWidth disabled={!dimsEnabled}
                                               {...register("bodyHeight")} />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Pricing */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack direction="row" spacing={1}>
                                <Controller
                                    name="currency"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} size="small" sx={{ minWidth: 100, alignSelf: "center" }}>
                                            {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                                <TextField label="Price" type="number" fullWidth {...register("price")} />
                                <Controller
                                    name="priceUnit"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} size="small" sx={{ minWidth: 120, alignSelf: "center" }}>
                                            {PRICE_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Tax type" fullWidth
                                       {...register("tax")} error={!!errors.tax} helperText={errors.tax?.message}
                            >
                                {TAX_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Payment method" fullWidth
                                       {...register("paymentMethod")} error={!!errors.paymentMethod} helperText={errors.paymentMethod?.message}
                            >
                                {PAYMENT_METHODS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Payment term" fullWidth
                                       {...register("paymentTerm")} error={!!errors.paymentTerm} helperText={errors.paymentTerm?.message}
                            >
                                {PAYMENT_TERMS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Bargaining" fullWidth {...register("bargaining")}>
                                <MenuItem value="possible">Negotiable</MenuItem>
                                <MenuItem value="none">Not negotiable</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Contacts */}
                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" mt={1}>Select contacts to show in the order</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                These are your saved contacts from the Profile section.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Primary phone</Typography>
                            <RadioGroup {...register("contactPrimary")} defaultValue={CONTACTS.phones[0]}>
                                {CONTACTS.phones.map((p) => (
                                    <FormControlLabel key={p} value={p} control={<Radio />} label={p} />
                                ))}
                            </RadioGroup>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Additional phone</Typography>
                            <RadioGroup {...register("contactSecondary")} defaultValue={CONTACTS.phones[1]}>
                                <FormControlLabel value="" control={<Radio />} label="No additional phone" />
                                {CONTACTS.phones.map((p) => (
                                    <FormControlLabel key={p} value={p} control={<Radio />} label={p} />
                                ))}
                            </RadioGroup>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="E-mail"
                                placeholder="email@example.com"
                                fullWidth
                                {...register("email")}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>

                        {/* Note */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Additional information"
                                placeholder="Provide any extra details"
                                fullWidth
                                multiline
                                minRows={3}
                                {...register("note")}
                            />
                        </Grid>

                        {/* Submit */}
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" justifyContent="center" mt={1.5}>
                                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 280 }}>
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
