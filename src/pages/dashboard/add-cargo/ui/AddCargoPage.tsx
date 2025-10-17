import { useFieldArray, useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box, Paper, Stack, Typography, TextField, Button, Divider, RadioGroup, FormControlLabel, Radio,
    InputAdornment, MenuItem, Select, FormHelperText, FormControl, Chip
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiPlus, FiTrash2 } from "react-icons/fi";

/* ---------- options (можно вынести в shared/config) ---------- */
const CARGO_TYPES = [
    "Palletized cargo", "Equipment", "Building materials", "Metal", "Pipes",
    "Food", "Big-bag cargo", "Container", "Cement", "Bitumen", "Fuel", "Flour",
    "Oversize", "Cars", "Wood", "Concrete products", "Furniture", "Other"
];
const VEHICLE_TYPES = [
    "Curtain (Tautliner)", "Reefer", "Flatbed", "Box", "Tipper", "Platform", "Lowboy",
    "Container carrier", "Car carrier", "Cement truck", "Tow truck", "Grain truck", "Dump truck"
];
const LOAD_TYPES = ["Rear", "Side", "Top"];
const TAX_TYPES = ["VAT (20%)", "VAT (0%)", "No VAT"];
const PAYMENT_METHODS = ["Cash", "Bank transfer", "Mixed"];
const PAYMENT_TERMS = ["On delivery", "Prepayment", "Deferred payment"];
const CURRENCIES = ["USD", "EUR", "UZS"] as const;

/* ---------- validation ---------- */
const schema = z.object({
    dateFrom: z.string().min(1, "Required"),
    dateTo: z.string().min(1, "Required"),
    loadPlaces: z.array(z.object({ name: z.string().min(1, "Required") })).min(1),
    unloadPlaces: z.array(z.object({ name: z.string().min(1, "Required") })).min(1),

    cargoType: z.string().min(1, "Select cargo type"),
    vehicleType: z.string().min(1, "Select vehicle type"),
    loadType: z.string().min(1, "Select load type"),
    partialLoad: z.enum(["no", "partial", "available"]),
    vehiclesCount: z.coerce.number().int().min(1).max(100).optional(),

    weightTons: z.coerce.number().gte(0).optional(),
    volumeM3: z.coerce.number().gte(0).optional(),
    dims: z
        .object({
            enabled: z.boolean(),
            length: z.coerce.number().gte(0).optional(),
            width: z.coerce.number().gte(0).optional(),
            height: z.coerce.number().gte(0).optional(),
        })
        .refine(
            (d) => !d.enabled || (d.length && d.width && d.height),
            { message: "Fill all dimensions", path: ["height"] }
        ),

    currency: z.enum(CURRENCIES),
    price: z.coerce.number().gte(0).optional(),
    tax: z.string().min(1, "Select tax type"),
    paymentMethod: z.string().min(1, "Select payment method"),
    paymentTerm: z.string().min(1, "Select payment term"),
    bargaining: z.enum(["possible", "none"]),

    contactPrimary: z.string().min(1, "Choose a phone"),
    contactSecondary: z.string().optional(),
    email: z.string().email("Invalid email").optional(),

    note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ---------- mocks: контакты из профиля ---------- */
const CONTACTS = {
    phones: ["+380 097 000 0000", "+380 097 000 0001", "+380 097 000 0002"],
    email: "email@gmail.com",
};

export default function AddCargoPage() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            dateFrom: "",
            dateTo: "",
            loadPlaces: [{ name: "" }],
            unloadPlaces: [{ name: "" }],
            cargoType: "",
            vehicleType: "",
            loadType: "",
            partialLoad: "available",
            vehiclesCount: 1,
            weightTons: undefined,
            volumeM3: undefined,
            dims: { enabled: false, length: undefined, width: undefined, height: undefined },
            currency: "USD",
            price: undefined,
            tax: "",
            paymentMethod: "",
            paymentTerm: "",
            bargaining: "possible",
            contactPrimary: CONTACTS.phones[0],
            contactSecondary: CONTACTS.phones[1],
            email: CONTACTS.email,
            note: "",
        },
        mode: "onTouched",
    });

    const { fields: loadFields, append: appendLoad, remove: removeLoad } = useFieldArray({
        control, name: "loadPlaces",
    });
    const { fields: unloadFields, append: appendUnload, remove: removeUnload } = useFieldArray({
        control, name: "unloadPlaces",
    });

    const dimsEnabled = watch("dims.enabled");

    const onSubmit = async (data: FormValues) => {
        // здесь вызов API
        console.log("create cargo request:", data);
    };

    return (
        <Box>
            {/* header */}
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

                <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        {/* dates */}
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

                        {/* load/unload places */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                {loadFields.map((f, idx) => (
                                    <Stack key={f.id} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={idx === 0 ? "Loading place" : `Loading place ${idx + 1}`}
                                            placeholder="Start typing a name"
                                            fullWidth
                                            {...register(`loadPlaces.${idx}.name` as const)}
                                            error={!!errors.loadPlaces?.[idx]?.name}
                                            helperText={errors.loadPlaces?.[idx]?.name?.message}
                                        />
                                        {idx > 0 && (
                                            <Button variant="text" color="error" onClick={() => removeLoad(idx)}><FiTrash2 /></Button>
                                        )}
                                    </Stack>
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={() => appendLoad({ name: "" })}>
                                    Add loading place
                                </Button>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                {unloadFields.map((f, idx) => (
                                    <Stack key={f.id} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label={idx === 0 ? "Unloading place" : `Unloading place ${idx + 1}`}
                                            placeholder="Start typing a name"
                                            fullWidth
                                            {...register(`unloadPlaces.${idx}.name` as const)}
                                            error={!!errors.unloadPlaces?.[idx]?.name}
                                            helperText={errors.unloadPlaces?.[idx]?.name?.message}
                                        />
                                        {idx > 0 && (
                                            <Button variant="text" color="error" onClick={() => removeUnload(idx)}><FiTrash2 /></Button>
                                        )}
                                    </Stack>
                                ))}
                                <Button startIcon={<FiPlus />} variant="outlined" onClick={() => appendUnload({ name: "" })}>
                                    Add unloading place
                                </Button>
                            </Stack>
                        </Grid>

                        {/* selects & parameters */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Cargo type" fullWidth
                                       {...register("cargoType")} error={!!errors.cargoType} helperText={errors.cargoType?.message}>
                                {CARGO_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Vehicle type" fullWidth
                                       {...register("vehicleType")} error={!!errors.vehicleType} helperText={errors.vehicleType?.message}>
                                {VEHICLE_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Load type" fullWidth
                                       {...register("loadType")} error={!!errors.loadType} helperText={errors.loadType?.message}>
                                {LOAD_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Partial load" fullWidth
                                       {...register("partialLoad")}>
                                <MenuItem value="no">No partial load (separate vehicle)</MenuItem>
                                <MenuItem value="partial">Partial load</MenuItem>
                                <MenuItem value="available">Partial load available</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Weight, t" type="number" fullWidth
                                       {...register("weightTons")} error={!!errors.weightTons} helperText={errors.weightTons?.message} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Volume, m³" type="number" fullWidth
                                       {...register("volumeM3")} error={!!errors.volumeM3} helperText={errors.volumeM3?.message} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControl error={!!errors.dims?.height}>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                checked={dimsEnabled}
                                                onChange={() => setValue("dims.enabled", !dimsEnabled)}
                                            />
                                        }
                                        label="Specify cargo dimensions"
                                    />
                                    <Chip label="Enter length, width and height in meters" variant="outlined" />
                                </Stack>
                                <FormHelperText>{errors.dims?.height?.message}</FormHelperText>
                            </FormControl>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1}>
                                <TextField label="Length (m)" type="number" fullWidth disabled={!dimsEnabled}
                                           {...register("dims.length")} />
                                <TextField label="Width (m)" type="number" fullWidth disabled={!dimsEnabled}
                                           {...register("dims.width")} />
                                <TextField label="Height (m)" type="number" fullWidth disabled={!dimsEnabled}
                                           {...register("dims.height")} />
                            </Stack>
                        </Grid>

                        {/* price block */}
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
                                <TextField
                                    label="Price"
                                    type="number"
                                    fullWidth
                                    InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
                                    {...register("price")}
                                    error={!!errors.price}
                                    helperText={errors.price?.message}
                                />
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Tax type" fullWidth
                                       {...register("tax")} error={!!errors.tax} helperText={errors.tax?.message}>
                                {TAX_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Payment method" fullWidth
                                       {...register("paymentMethod")} error={!!errors.paymentMethod} helperText={errors.paymentMethod?.message}>
                                {PAYMENT_METHODS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Payment term" fullWidth
                                       {...register("paymentTerm")} error={!!errors.paymentTerm} helperText={errors.paymentTerm?.message}>
                                {PAYMENT_TERMS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select label="Bargaining" fullWidth {...register("bargaining")}>
                                <MenuItem value="possible">Negotiable</MenuItem>
                                <MenuItem value="none">Not negotiable</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Vehicles count" type="number" fullWidth {...register("vehiclesCount")} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" mt={1}>Select contacts to show in the order</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                These are your saved contacts from the Profile section. You can change them later.
                            </Typography>
                        </Grid>

                        {/* contacts (радио) */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Primary phone</Typography>
                            <RadioGroup
                                {...register("contactPrimary")}
                                defaultValue={CONTACTS.phones[0]}
                            >
                                {CONTACTS.phones.map((p) => (
                                    <FormControlLabel key={p} value={p} control={<Radio />} label={p} />
                                ))}
                            </RadioGroup>
                            <FormHelperText error>{errors.contactPrimary?.message}</FormHelperText>
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

                        {/* note */}
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

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" justifyContent="center" mt={1.5}>
                                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 280 }}>
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
