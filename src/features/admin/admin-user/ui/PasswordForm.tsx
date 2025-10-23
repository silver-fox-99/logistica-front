import { useState } from "react";
import { Card, CardContent, Stack, TextField, Button } from "@mui/material";
import { FiLock, FiSave, FiLoader } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

const schema = z.object({
    password: z.string().min(8, "Минимум 8 символов").max(128, "Максимум 128 символов"),
});

type FormValues = z.infer<typeof schema>;

export function PasswordForm({ user, onUpdated }: { user: AdminUser; onUpdated: (u: AdminUser) => void; }) {
    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { password: "" },
    });
    const [busy, setBusy] = useState(false);

    const submit = async (values: FormValues) => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { password: values.password });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            toast.success('Пароль успешно обновлен');
            reset({ password: "" });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при обновлении пароля';
            toast.error(message);
        } finally { setBusy(false); }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <form onSubmit={handleSubmit(submit)}>
                    <Stack spacing={2}>
                        <TextField
                            label="Новый пароль"
                            type="password"
                            {...register("password")}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            InputProps={{ startAdornment: <FiLock style={{ marginRight: 8 }} /> as any }}
                        />
                        <Button type="submit" variant="contained" startIcon={busy ? <FiLoader/> : <FiSave/>} disabled={busy || !isDirty}>
                            {busy ? "Обновление…" : "Обновить пароль"}
                        </Button>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}
