import { useEffect, useState } from "react";
import {
    Paper, Stack, Typography, TextField, InputAdornment, Button
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {  FiMail } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { parsePhoneNumber } from "libphonenumber-js";

export type ContactInfo = {
    phoneMain?: string;
    phoneAlt?: string;
    telegram?: string;
    whatsapp?: string;
    email?: string;
};

type Props = {
    data: ContactInfo;
    onSave?: (values: ContactInfo & { phoneMainE164?: string; phoneAltE164?: string }) => Promise<void> | void;
    saving?: boolean;
};

const schema = z.object({
    phoneMain: z.string().optional().refine((v) => !v || matchIsValidTel(v), "Enter a valid phone"),
    phoneAlt: z.string().optional().refine((v) => !v || matchIsValidTel(v), "Enter a valid phone"),
    telegram: z.string().optional(),
    whatsapp: z.string().optional().refine((v) => !v || matchIsValidTel(v), "Enter a valid phone"),
    email: z.string().optional().refine((v) => !v || z.string().email().safeParse(v).success, "Invalid email"),
});

export default function ContactInfoCard({ data, onSave, saving }: Props) {
    const [editing, setEditing] = useState(false);

    const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneMain: data.phoneMain ?? "",
            phoneAlt: data.phoneAlt ?? "",
            telegram: data.telegram ?? "",
            whatsapp: data.whatsapp ?? "",
            email: data.email ?? "",
        },
        mode: "onTouched",
    });


    useEffect(() => {
        reset({
            phoneMain: data.phoneMain ?? "",
            phoneAlt: data.phoneAlt ?? "",
            telegram: data.telegram ?? "",
            whatsapp: data.whatsapp ?? "",
            email: data.email ?? "",
        });
    }, [data, reset]);

    const toE164 = (v?: string) => {
        try {
            if (!v) return undefined;
            const p = parsePhoneNumber(v);
            return p?.number ?? undefined;
        } catch {
            return undefined;
        }
    };

    const submit = async (vals: z.infer<typeof schema>) => {
        await onSave?.({
            ...vals,
            phoneMainE164: toE164(vals.phoneMain),
            phoneAltE164: toE164(vals.phoneAlt),
        });
        setEditing(false);
    };

    return (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <form onSubmit={handleSubmit(submit)} noValidate>
                <Stack spacing={1.5}>
                    <Typography variant="h6">Contact information</Typography>
                    <Typography variant="body2" color="text.secondary" maxWidth={720}>
                        Your primary email is used to sign in and to receive important notifications.
                    </Typography>

                    <Grid container spacing={2}>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Primary phone</Typography>
                            <Controller
                                name="phoneMain"
                                control={control}
                                render={({ field }) => (
                                    <MuiTelInput
                                        {...field}
                                        disabled={!editing}
                                        defaultCountry="UZ"
                                        forceCallingCode
                                        error={!!errors.phoneMain}
                                        helperText={errors.phoneMain?.message}
                                        placeholder="+1 (555) 000-0000"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                                    />
                                )}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Additional phone</Typography>
                            <Controller
                                name="phoneAlt"
                                control={control}
                                render={({ field }) => (
                                    <MuiTelInput
                                        {...field}
                                        disabled={!editing}
                                        defaultCountry="UZ"
                                        forceCallingCode
                                        error={!!errors.phoneAlt}
                                        helperText={errors.phoneAlt?.message}
                                        placeholder="+1 (555) 000-0000"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                                    />
                                )}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Telegram</Typography>
                            <TextField
                                placeholder="@username"
                                fullWidth
                                disabled={!editing}
                                {...register("telegram")}
                                error={!!errors.telegram}
                                helperText={errors.telegram?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaTelegramPlane />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>WhatsApp</Typography>
                            <Controller
                                name="whatsapp"
                                control={control}
                                render={({ field }) => (
                                    <MuiTelInput
                                        {...field}
                                        disabled={!editing}
                                        defaultCountry="UZ"
                                        forceCallingCode
                                        error={!!errors.whatsapp}
                                        helperText={errors.whatsapp?.message}
                                        placeholder="+1 (555) 000-0000"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                                    />
                                )}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>E-mail</Typography>
                            <TextField
                                placeholder="email@example.com"
                                fullWidth
                                disabled={!editing}
                                {...register("email")}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiMail />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                            />
                        </Grid>
                    </Grid>


                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        {editing ? (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        reset();        // вернуть исходные значения
                                        setEditing(false);
                                    }}
                                    disabled={isSubmitting || saving}
                                    sx={{ textTransform: "none" }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting || saving}
                                    sx={{ textTransform: "none" }}
                                >
                                    Save
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() => setEditing(true)}
                                sx={{ textTransform: "none" }}
                            >
                                Edit
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </form>
        </Paper>
    );
}
