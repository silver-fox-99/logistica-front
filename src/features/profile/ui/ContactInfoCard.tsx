import { useEffect, useState } from "react";
import {
    Paper, Stack, Typography, TextField, Button, Box, Checkbox
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
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
    geo?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    isPublic?: boolean;
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
        isPublic: z.boolean().optional(),
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
            geo: data.geo ?? "",
            isPublic: data.isPublic ?? true,
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
            geo: data.geo ?? "",
            isPublic: data.isPublic ?? true,
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
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper"
            }}
        >
            <form onSubmit={handleSubmit(submit)} noValidate>
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                fontSize: "1.25rem",
                                color: "#0c2340",
                                mb: 0.5
                            }}
                        >
                            {t('profile.contactInfo.title', "Общая информация")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                fontSize: "0.9rem"
                            }}
                        >
                            {t('profile.contactInfo.description', "Здесь отображается основная информация о вашем профиле. Эти данные видны другим пользователям")}
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Left Column */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2.5}>
                                {/* Имя */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>Имя</Typography>
                                    <TextField
                                        placeholder="Иван"
                                        fullWidth
                                        disabled={!editing}
                                        {...register("firstName")}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                bgcolor: editing ? "background.paper" : "#FAFBFD",
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Основной телефон */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>
                                        Основной телефон
                                    </Typography>
                                    <Controller
                                        name="phoneMain"
                                        control={control}
                                        render={({ field }) => (
                                            <MuiTelInput
                                                {...field}
                                                disabled
                                                defaultCountry="UZ"
                                                forceCallingCode
                                                placeholder="+998 (90) 123-45-67"
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "8px",
                                                        bgcolor: "#FAFBFD",
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* E-mail */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>
                                        E-mail
                                    </Typography>
                                    <TextField
                                        placeholder="email@example.com"
                                        fullWidth
                                        disabled
                                        {...register("email")}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                bgcolor: "#FAFBFD",
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Telegram chat */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>
                                        Telegram chat <span style={{ fontWeight: 400, color: "#A0AEC0", fontSize: "0.8rem" }}>(опционально)</span>
                                    </Typography>
                                    <TextField
                                        placeholder="@username"
                                        fullWidth
                                        disabled={!editing}
                                        {...register("telegram")}
                                        error={!!errors.telegram}
                                        helperText={errors.telegram?.message}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                bgcolor: editing ? "background.paper" : "#FAFBFD",
                                            }
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Grid>

                        {/* Right Column */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2.5}>
                                {/* Фамилия */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>Фамилия</Typography>
                                    <TextField
                                        placeholder="Иванов"
                                        fullWidth
                                        disabled={!editing}
                                        {...register("lastName")}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                bgcolor: editing ? "background.paper" : "#FAFBFD",
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Геолокация */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>Геолокация</Typography>
                                    <TextField
                                        placeholder="Узбекистан"
                                        fullWidth
                                        disabled={!editing}
                                        {...register("geo")}
                                        error={!!errors.geo}
                                        helperText={errors.geo?.message}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                bgcolor: editing ? "background.paper" : "#FAFBFD",
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Дополнительный телефон */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>
                                        Дополнительный телефон <span style={{ fontWeight: 400, color: "#A0AEC0", fontSize: "0.8rem" }}>(опционально)</span>
                                    </Typography>
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
                                                placeholder="+998 (90) 123-45-12"
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "8px",
                                                        bgcolor: editing ? "background.paper" : "#FAFBFD",
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* WhatsApp */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: "#0c2340" }}>
                                        WhatsApp <span style={{ fontWeight: 400, color: "#A0AEC0", fontSize: "0.8rem" }}>(опционально)</span>
                                    </Typography>
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
                                                placeholder="+998 (90) 123-45-89"
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "8px",
                                                        bgcolor: editing ? "background.paper" : "#FAFBFD",
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Bottom row: Checkbox and Actions */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            flexWrap: "wrap",
                            gap: 2,
                            pt: 1
                        }}
                    >
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", maxWidth: "600px" }}>
                            <Controller
                                name="isPublic"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Checkbox
                                        checked={!!value}
                                        onChange={(e) => onChange(e.target.checked)}
                                        disabled={!editing}
                                        sx={{
                                            color: "primary.main",
                                            p: 0,
                                            mt: 0.3,
                                            "&.Mui-checked": {
                                                color: "primary.main",
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Stack spacing={0.5}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 700,
                                        color: "primary.main",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5
                                    }}
                                >
                                    Публичный профиль
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Публичный профиль позволяет другим пользователям находить вас на платформе и видеть информацию о вас
                                </Typography>
                            </Stack>
                        </Box>

                        <Box sx={{ ml: "auto" }}>
                            {editing ? (
                                <Stack direction="row" spacing={1.5}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            reset();
                                            setEditing(false);
                                        }}
                                        disabled={isSubmitting || saving}
                                        sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1, borderRadius: "8px" }}
                                    >
                                        {t('profile.contactInfo.cancel', "Отмена")}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isSubmitting || saving}
                                        sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1, borderRadius: "8px" }}
                                    >
                                        {t('profile.contactInfo.save', "Сохранить")}
                                    </Button>
                                </Stack>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={() => setEditing(true)}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.2,
                                        borderRadius: "8px",
                                        bgcolor: "primary.main",
                                        "&:hover": {
                                            bgcolor: "primary.dark",
                                        }
                                    }}
                                >
                                    {t('profile.contactInfo.edit', "Редактировать")}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Stack>
            </form>
        </Paper>
    );
}
