import { useEffect, useState } from "react";
import {
    Paper, Stack, Typography, TextField, InputAdornment, Button, Box
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {FiGlobe, FiMail} from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { parsePhoneNumber } from "libphonenumber-js";

export type ContactInfo = {
    firstName?: string;
    lastName?: string;
    phoneMain?: string;
    phoneAlt?: string;
    telegram?: string;
    whatsapp?: string;
    email?: string;
    geo?: string
};

type Props = {
    data: ContactInfo;
    onSave?: (values: ContactInfo & { phoneMainE164?: string; phoneAltE164?: string }) => Promise<void> | void;
    saving?: boolean;
};

export default function ContactInfoCard({ data, onSave, saving }: Props) {
    const [editing, setEditing] = useState(false);
    const { t } = useTranslation();
    
    const schema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phoneMain: z.string().optional().refine((v) => !v || matchIsValidTel(v), t('profile.validation.invalidPhone')),
        phoneAlt: z.string().optional().refine((v) => !v || matchIsValidTel(v), t('profile.validation.invalidPhone')),
        telegram: z.string().optional(),
        geo: z.string().optional(),
        whatsapp: z.string().optional().refine((v) => !v || matchIsValidTel(v), t('profile.validation.invalidPhone')),
        email: z.string().optional().refine((v) => !v || z.string().email().safeParse(v).success, t('profile.validation.invalidEmail')),
    });

    const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            phoneMain: data.phoneMain ?? "",
            phoneAlt: data.phoneAlt ?? "",
            telegram: data.telegram ?? "",
            whatsapp: data.whatsapp ?? "",
            email: data.email ?? "",
            geo: data.geo ?? ""
        },
        mode: "onTouched",
    });

    useEffect(() => {
        reset({
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            phoneMain: data.phoneMain ?? "",
            phoneAlt: data.phoneAlt ?? "",
            telegram: data.telegram ?? "",
            whatsapp: data.whatsapp ?? "",
            email: data.email ?? "",
            geo: data.geo ?? ""
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box className="contact-info-card__icon">
                            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7"/>
                                <path d="M20.833 13.889c.48 0 .868.388.868.868v5.208h5.209a.868.868 0 1 1 0 1.736H21.7v5.209a.868.868 0 1 1-1.736 0V21.7h-5.208a.868.868 0 0 1 0-1.736h5.208v-5.208c0-.48.389-.868.868-.868" fill="#4472B8"/>
                            </svg>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" mb={1} className="contact-info-card__title">
                                {t('profile.contactInfo.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2} className="contact-info-card__subtitle">
                                {t('profile.contactInfo.description')}
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Имя</Typography>
                            <TextField
                                placeholder="Ваше имя"
                                fullWidth
                                disabled={!editing}
                                {...register("firstName")}
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Фамилия</Typography>
                            <TextField
                                placeholder="Ваша фамилия"
                                fullWidth
                                disabled={!editing}
                                {...register("lastName")}
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{t('profile.contactInfo.phoneMain')}</Typography>
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

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{t('profile.contactInfo.phoneAlt')}</Typography>
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

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{t('profile.contactInfo.telegram')}</Typography>
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

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{t('profile.contactInfo.whatsapp')}</Typography>
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

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{t('profile.contactInfo.email')}</Typography>
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

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{t('profile.contactInfo.geo')}</Typography>
                            <TextField
                                placeholder={t('profile.contactInfo.geoPlaceholder')}
                                fullWidth
                                disabled={!editing}
                                {...register("geo")}
                                error={!!errors.geo}
                                helperText={errors.geo?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiGlobe />
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
                                        reset();
                                        setEditing(false);
                                    }}
                                    disabled={isSubmitting || saving}
                                    sx={{ textTransform: "none" }}
                                >
                                    {t('profile.contactInfo.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting || saving}
                                    sx={{ textTransform: "none" }}
                                >
                                    {t('profile.contactInfo.save')}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() => setEditing(true)}
                                sx={{ textTransform: "none" }}
                            >
                                {t('profile.contactInfo.edit')}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </form>
        </Paper>
    );
}
