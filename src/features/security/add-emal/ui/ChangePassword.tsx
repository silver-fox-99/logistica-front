import { useState } from "react";
import {
    Paper, Box, Button, Stack,
    TextField, Typography, IconButton, InputAdornment
} from "@mui/material";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { securityApi } from "@/shared/api/securityApi";

type FormValues = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export function ChangePasswordCard() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const schema = z.object({
        oldPassword: z.string().min(1, t('security.validation.currentPasswordRequired')),
        newPassword: z.string().min(8, t('security.validation.newPasswordMin')),
        confirmPassword: z.string().min(1, t('security.validation.confirmPasswordRequired')),
    }).refine((val) => val.newPassword === val.confirmPassword, {
        path: ["confirmPassword"],
        message: t('security.validation.passwordsMismatch'),
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async ({ oldPassword, newPassword }: FormValues) => {
        setLoading(true);
        try {
            await securityApi.changePassword(oldPassword, newPassword);
            toast.success(t('security.changePassword.successMessage'));
            reset({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e: any) {
            const message = e?.response?.data?.message ?? t('security.changePassword.errorMessage');
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider" }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', bgcolor: '#EEF4F7', color: 'primary.main', flexShrink: 0 }}>
                        <FiLock />
                    </Box>
                    <Typography variant="h6">{t('security.changePassword.title')}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('security.changePassword.description')}
                </Typography>

                <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label={t('security.changePassword.currentPassword')}
                        type={showOld ? "text" : "password"}
                        {...register("oldPassword")}
                        error={!!errors.oldPassword}
                        helperText={errors.oldPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowOld(v => !v)} edge="end" aria-label={t('security.changePassword.togglePassword')}>
                                        {showOld ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label={t('security.changePassword.newPassword')}
                        type={showNew ? "text" : "password"}
                        {...register("newPassword")}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNew(v => !v)} edge="end" aria-label={t('security.changePassword.togglePassword')}>
                                        {showNew ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label={t('security.changePassword.confirmPassword')}
                        type={showConfirm ? "text" : "password"}
                        {...register("confirmPassword")}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" aria-label={t('security.changePassword.togglePassword')}>
                                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ pt: 0.5 }}>
                        <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 700, px: 2.5 }}>
                            {loading ? t('security.changePassword.pleaseWait') : t('security.changePassword.changeButton')}
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
}
