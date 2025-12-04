import { useState } from "react";
import { Button, Stack, TextField, Alert, InputAdornment, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {authApi} from "@/shared/api/authApi.ts";

type FormValues = {
    password: string;
    confirm: string;
};

export default function StepNewPassword({
                                            onSubmit,
                                        }: {
    onSubmit?: () => void;
}) {
    const { t } = useTranslation();

    const primaryBtnSx = {
        height: 42,
        borderRadius: "5px",
        textTransform: "none",
        fontWeight: 700,
        background: "#4472B8",
        color: "#EEF4F7",
        "&:hover": {
            background: "#EEF4F7",
            color: "#4472B8",
            borderColor: "#4472B8",
        },
    };

    const schema = z.object({
        password: z.string().min(8, t("forgotPassword.newPasswordRequired")),
        confirm: z.string().min(1, t("forgotPassword.confirmPasswordRequired")),
    }).refine(v => v.password === v.confirm, { path: ["confirm"], message: t("forgotPassword.confirmPasswordMismatch") });

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
            await authApi.resetPassword(v.password);
            setSuccess(t("forgotPassword.passwordUpdated"));
            reset({ password: "", confirm: "" });
            onSubmit?.();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? t("forgotPassword.passwordUpdateError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack spacing={2}>
                <TextField
                    label={t("forgotPassword.newPasswordLabel")}
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
                    label={t("forgotPassword.confirmPasswordLabel")}
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

                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    sx={primaryBtnSx}
                >
                    {loading ? t("forgotPassword.pleaseWait") : t("forgotPassword.savePasswordButton")}
                </Button>
            </Stack>
        </form>
    );
}
