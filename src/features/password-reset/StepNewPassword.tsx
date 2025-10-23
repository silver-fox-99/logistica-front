
import { useState } from "react";
import { Button, Stack, TextField, Alert, InputAdornment, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";

const schema = z.object({
    password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
    confirm: z.string().min(1, "Подтвердите пароль"),
}).refine(v => v.password === v.confirm, { path: ["confirm"], message: "Пароли не совпадают" });

type FormValues = z.infer<typeof schema>;

export default function StepNewPassword({
                                            onSubmit,
                                            submitWith,
                                        }: {
    onSubmit?: () => void;
    submitWith: (password: string) => Promise<void>;
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { password: "", confirm: "" },
    });

    const [loading, setLoading] = useState(false);
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const submit = async (v: FormValues) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await submitWith(v.password);
            setSuccess("Ваш пароль был обновлен");
            reset({ password: "", confirm: "" });
            onSubmit?.();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось обновить пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack spacing={2}>
                <TextField
                    label="Новый пароль"
                    type={show1 ? "text" : "password"}
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton edge="end" onClick={() => setShow1(v => !v)}>{show1 ? <FiEyeOff /> : <FiEye />}</IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Подтвердите новый пароль"
                    type={show2 ? "text" : "password"}
                    {...register("confirm")}
                    error={!!errors.confirm}
                    helperText={errors.confirm?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton edge="end" onClick={() => setShow2(v => !v)}>{show2 ? <FiEyeOff /> : <FiEye />}</IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Пожалуйста, подождите..." : "Сохранить новый пароль"}
                </Button>
            </Stack>
        </form>
    );
}
