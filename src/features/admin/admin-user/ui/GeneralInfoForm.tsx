import { useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, CardContent, Stack, TextField, InputAdornment, Button } from "@mui/material";
import { FiUser, FiPhone, FiMail, FiSave, FiLoader, FiBriefcase } from "react-icons/fi";
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
};

export function GeneralInfoForm({ user, onUpdated }: { user: AdminUser; onUpdated: (u: AdminUser) => void; }) {
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<FormValues>({
        defaultValues: {
            first_name: user.first_name ?? "",
            last_name:  user.last_name ?? "",
            phone:      user.phone ?? "",
            email:      user.email ?? "",
            avatar:     user.avatar ?? "",
            type:       user.type ?? "",
        },
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
            };

            const payload = diffPayload<FormValues>(
                {
                    first_name: user.first_name ?? null,
                    last_name:  user.last_name ?? null,
                    phone:      user.phone ?? undefined,
                    email:      user.email ?? null,
                    avatar:     user.avatar ?? null,
                    type:       user.type ?? null,
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
            reset({
                first_name: res.data.user.first_name ?? "",
                last_name:  res.data.user.last_name ?? "",
                phone:      res.data.user.phone ?? "",
                email:      res.data.user.email ?? "",
                avatar:     res.data.user.avatar ?? "",
                type:       res.data.user.type ?? "",
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при обновлении пользователя';
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <form onSubmit={handleSubmit(submit)}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Имя"
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
                                    {...register("last_name", {
                                        setValueAs: (v) => (typeof v === "string" ? v : ""),
                                        maxLength: { value: 120, message: "Максимум 120 символов" },
                                    })}
                                    error={!!errors.last_name}
                                    helperText={errors.last_name?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiUser/></InputAdornment> }}
                                />
                                <TextField
                                    label="Телефон (E.164)"
                                    {...register("phone", {
                                        setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                        validate: (v) => !v || (phoneRegex.test(v) && v.length >= 10 && v.length <= 20) || "Телефон должен быть в формате E.164 и содержать 10-20 символов",
                                    })}
                                    error={!!errors.phone}
                                    helperText={errors.phone?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone/></InputAdornment> }}
                                />
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Email адрес"
                                    {...register("email", {
                                        setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                        validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email неверный",
                                    })}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FiMail/></InputAdornment> }}
                                />
                                <TextField
                                    label="Аватар URL"
                                    {...register("avatar", {
                                        setValueAs: (v) => (typeof v === "string" ? v.trim() : ""),
                                        validate: (v) => !v || /^https?:\/\//i.test(v) || "Должен быть валидным URL",
                                    })}
                                    error={!!errors.avatar}
                                    helperText={errors.avatar?.message}
                                />
                                <TextField
                                    label="Тип пользователя"
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
