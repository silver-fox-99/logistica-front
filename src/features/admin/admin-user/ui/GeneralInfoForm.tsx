import { useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, CardContent, Stack, TextField, InputAdornment, Button, Chip, Typography } from "@mui/material";
import { FiUser, FiPhone, FiMail, FiSave, FiLoader, FiBriefcase, FiSend, FiCheck, FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";
import { diffPayload } from "../model/diffPayload";

const phoneRegex = /^\+?[1-9]\d{1,19}$/;

type FormValues = {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string;
    email?: string | null;
    avatar?: string | null;
    type?: string | null;
    telegram_chat_id?: string | null;
    discount_percent?: string | null;
    discount_expires_at?: string | null;
    discount_reason?: string | null;
};

const buildDefaultValues = (u: AdminUser): FormValues => ({
    first_name: u.first_name ?? "",
    last_name:  u.last_name ?? "",
    phone:      u.phone ?? "",
    email:      u.email ?? "",
    avatar:     u.avatar ?? "",
    type:       u.type ?? "",
    telegram_chat_id: u.telegram_chat_id ?? "",
    discount_percent: u.discount_percent !== null && u.discount_percent !== undefined ? String(u.discount_percent) : "",
    discount_expires_at: u.discount_expires_at ? u.discount_expires_at.slice(0, 10) : "",
    discount_reason: u.discount_reason ?? "",
});

export function GeneralInfoForm({ user, onUpdated }: { user: AdminUser; onUpdated: (u: AdminUser) => void; }) {
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<FormValues>({
        defaultValues: buildDefaultValues(user),
    });

    const [busy, setBusy] = useState(false);

    const submit = async (values: FormValues) => {
        setBusy(true);
        try {
            const normalized: FormValues = {
                first_name: values.first_name?.trim() ? values.first_name.trim() : null,
                last_name:  values.last_name?.trim()  ? values.last_name.trim()  : null,
                phone:      values.phone?.trim()      ? values.phone.trim()      : undefined,
                email:      values.email?.trim()      ? values.email.trim()      : null,
                avatar:     values.avatar?.trim()     ? values.avatar.trim()     : null,
                type:       values.type?.trim()       ? values.type.trim()       : null,
                telegram_chat_id: values.telegram_chat_id?.trim() ? values.telegram_chat_id.trim() : null,
                discount_percent: values.discount_percent?.trim() ? String(Number(values.discount_percent)) : null,
                discount_expires_at: values.discount_expires_at?.trim() ? new Date(values.discount_expires_at).toISOString() : null,
                discount_reason: values.discount_reason?.trim() ? values.discount_reason.trim() : null,
            };

            const payload = diffPayload<FormValues>(
                {
                    first_name: user.first_name ?? null,
                    last_name:  user.last_name ?? null,
                    phone:      user.phone ?? undefined,
                    email:      user.email ?? null,
                    avatar:     user.avatar ?? null,
                    type:       user.type ?? null,
                    telegram_chat_id: user.telegram_chat_id ?? null,
                    discount_percent: user.discount_percent !== null && user.discount_percent !== undefined ? String(user.discount_percent) : null,
                    discount_expires_at: user.discount_expires_at ?? null,
                    discount_reason: user.discount_reason ?? null,
                },
                normalized
            );

            if (payload.phone && (!phoneRegex.test(payload.phone) || payload.phone.length < 10 || payload.phone.length > 20)) {
                toast.error("Телефон должен быть в формате E.164 и содержать 10-20 символов");
                setBusy(false);
                return;
            }
            if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
                toast.error("Email неверный");
                setBusy(false);
                return;
            }
            if (payload.avatar && !/^https?:\/\//i.test(payload.avatar)) {
                toast.error("Аватар должен быть валидным URL");
                setBusy(false);
                return;
            }

            if (Object.keys(payload).length) {
                await adminUserApi.patch(user.id, payload as any);
            }
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            toast.success('Информация о пользователе обновлена');
            reset(buildDefaultValues(res.data.user));
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при обновлении пользователя';
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyPhone = async () => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { phone_verified_at: new Date().toISOString() });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            toast.success("Номер телефона успешно подтвержден");
            reset(buildDefaultValues(res.data.user));
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при верификации телефона";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const handleUnverifyPhone = async () => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { phone_verified_at: null });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            toast.success("Верификация телефона сброшена");
            reset(buildDefaultValues(res.data.user));
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при сбросе верификации телефона";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyEmail = async () => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { email_verified_at: new Date().toISOString() });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            toast.success("Email адрес успешно подтвержден");
            reset(buildDefaultValues(res.data.user));
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при верификации email";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const handleUnverifyEmail = async () => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { email_verified_at: null });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            toast.success("Верификация email сброшена");
            reset(buildDefaultValues(res.data.user));
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при сбросе верификации email";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <form onSubmit={handleSubmit(submit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Имя"
                                    fullWidth
                                    {...register("first_name", {
                                        setValueAs: (v) => (typeof v === "string" ? v : ""),
                                        maxLength: { value: 120, message: "Максимум 120 символов" },
                                    })}
                                    error={!!errors.first_name}
                                    helperText={errors.first_name?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiUser/></InputAdornment> }}
                                />
                                <TextField
                                    label="Фамилия"
                                    fullWidth
                                    {...register("last_name", {
                                        setValueAs: (v) => (typeof v === "string" ? v : ""),
                                        maxLength: { value: 120, message: "Максимум 120 символов" },
                                    })}
                                    error={!!errors.last_name}
                                    helperText={errors.last_name?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiUser/></InputAdornment> }}
                                />

                                <Stack spacing={1}>
                                    <TextField
                                        label="Телефон (E.164)"
                                        fullWidth
                                        {...register("phone", {
                                            setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                            validate: (v) => !v || (phoneRegex.test(v) && v.length >= 10 && v.length <= 20) || "Телефон должен быть в формате E.164 и содержать 10-20 символов",
                                        })}
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone/></InputAdornment> }}
                                    />
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {user.phone_verified_at ? (
                                            <>
                                                <Chip size="small" color="success" icon={<FiCheck />} label="Подтвержден" variant="outlined" />
                                                <Button size="small" variant="text" color="warning" onClick={handleUnverifyPhone} disabled={busy} sx={{ fontSize: '0.75rem' }}>
                                                    Снять подтверждение
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Chip size="small" color="warning" icon={<FiX />} label="Не подтвержден" variant="outlined" />
                                                <Button size="small" variant="text" color="success" onClick={handleVerifyPhone} disabled={busy} sx={{ fontSize: '0.75rem' }}>
                                                    Подтвердить телефон
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2.5}>
                                <Stack spacing={1}>
                                    <TextField
                                        label="Email адрес"
                                        fullWidth
                                        {...register("email", {
                                            setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                            validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email неверный",
                                        })}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><FiMail/></InputAdornment> }}
                                    />
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {user.email_verified_at ? (
                                            <>
                                                <Chip size="small" color="success" icon={<FiCheck />} label="Подтвержден" variant="outlined" />
                                                <Button size="small" variant="text" color="warning" onClick={handleUnverifyEmail} disabled={busy} sx={{ fontSize: '0.75rem' }}>
                                                    Снять подтверждение
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Chip size="small" color="warning" icon={<FiX />} label="Не подтвержден" variant="outlined" />
                                                <Button size="small" variant="text" color="success" onClick={handleVerifyEmail} disabled={busy} sx={{ fontSize: '0.75rem' }}>
                                                    Подтвердить email
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Stack>

                                <TextField
                                    label="Telegram Chat ID"
                                    fullWidth
                                    {...register("telegram_chat_id", {
                                        setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                        maxLength: { value: 100, message: "Максимум 100 символов" },
                                    })}
                                    error={!!errors.telegram_chat_id}
                                    helperText={errors.telegram_chat_id?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiSend/></InputAdornment> }}
                                />

                                <TextField
                                    label="Тип пользователя"
                                    fullWidth
                                    {...register("type", {
                                        setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                        maxLength: { value: 120, message: "Максимум 120 символов" },
                                    })}
                                    error={!!errors.type}
                                    helperText={errors.type?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiBriefcase/></InputAdornment> }}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Аватар URL"
                                fullWidth
                                {...register("avatar", {
                                    setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                    validate: (v) => !v || /^https?:\/\//i.test(v) || "Должен быть валидным URL",
                                })}
                                error={!!errors.avatar}
                                helperText={errors.avatar?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1, mb: 1 }}>
                                Персональная скидка
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Скидка (%)"
                                        fullWidth
                                        type="number"
                                        {...register("discount_percent", {
                                            validate: (v) => !v || (Number(v) >= 0 && Number(v) <= 100) || "Скидка должна быть от 0% до 100%",
                                        })}
                                        error={!!errors.discount_percent}
                                        helperText={errors.discount_percent?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Дата истечения"
                                        fullWidth
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        {...register("discount_expires_at")}
                                        error={!!errors.discount_expires_at}
                                        helperText={errors.discount_expires_at?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Причина скидки"
                                        fullWidth
                                        {...register("discount_reason", {
                                            maxLength: { value: 255, message: "Максимум 255 символов" },
                                        })}
                                        error={!!errors.discount_reason}
                                        helperText={errors.discount_reason?.message}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                            <Button type="submit" variant="contained" startIcon={busy ? <FiLoader/> : <FiSave/>} disabled={busy || !isDirty}>
                                {busy ? "Сохранение…" : "Сохранить информацию"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
}
