import { useEffect, useState } from "react";
import {
    Paper, Stack, Typography, TextField, InputAdornment, Button, Box, Chip
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { parsePhoneNumber } from "libphonenumber-js";
import VerifyPhoneModal from "./VerifyPhoneModal";

export type ContactInfo = {
    firstName?: string;
    lastName?: string;
    phoneMain?: string;
    phoneAlt?: string;
    telegram?: string;
    whatsapp?: string;
    email?: string;
    geo?: string;
    phoneVerified?: boolean;
};

type Props = {
    data: ContactInfo;
    onSave?: (values: ContactInfo & { phoneMainE164?: string; phoneAltE164?: string }) => Promise<void> | void;
    saving?: boolean;
    onPhoneVerified?: () => void;
};

export default function ContactInfoCard({ data, onSave, saving, onPhoneVerified }: Props) {
    const [editing, setEditing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
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
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="body2">{t('profile.contactInfo.phoneMain')}</Typography>
                                <Chip
                                    size="small"
                                    icon={data.phoneVerified ? <FiCheckCircle /> : <FiAlertCircle />}
                                    label={data.phoneVerified ? t('profile.contactInfo.phoneVerified') : t('profile.contactInfo.phoneUnverified')}
                                    color={data.phoneVerified ? "success" : "warning"}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: "0.75rem" }}
                                />
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Controller
                                    name="phoneMain"
                                    control={control}
                                    render={({ field }) => (
                                        <MuiTelInput
                                            {...field}
                                            disabled
                                            defaultCountry="UZ"
                                            forceCallingCode
                                            placeholder="+1 (555) 000-0000"
                                            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "action.disabledBackground" } }}
                                        />
                                    )}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={() => setModalOpen(true)}
                                    sx={{ height: 40, borderRadius: 1.5, textTransform: "none" }}
                                >
                                    {data.phoneVerified ? t('profile.contactInfo.changePhone') : (data.phoneMain ? t('profile.contactInfo.verifyPhone') : t('profile.contactInfo.changePhone'))}
                                </Button>
                            </Stack>
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
            {modalOpen && (
                <VerifyPhoneModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => onPhoneVerified?.()}
                    initialPhone={data.phoneMain}
                />
            )}
        </Paper>
    );
}
