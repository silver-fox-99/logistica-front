import { useState } from "react";
import {
    Box,
    Stack,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {authApi} from "@/shared/api/authApi.ts";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "@/entities/user/model/user.store.ts";

export type ProfileFormValues = {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
};

type StepProfileProps = {
    defaultValues?: Partial<ProfileFormValues>;
};

export default function StepProfile({ defaultValues }: StepProfileProps) {
    const { t } = useTranslation();
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const navigate = useNavigate()
    const setUser = useUserStore(s => s.setUser);

    const schema = z.object({
        firstName: z.string().trim().min(2, t("register.firstNameRequired")),
        lastName: z.string().trim().min(2, t("register.lastNameRequired")),
        password: z.string().min(6, t("register.passwordRequired")),
        confirmPassword: z.string().min(1, t("register.confirmPasswordRequired")),
    }).refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: t("register.confirmPasswordMismatch"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            ...defaultValues,
        },
        mode: "onTouched",
    });

    const submit = async (data: ProfileFormValues) => {
       try {
           const res = await authApi.completeRegister(data)
           setUser(res.data)
           toast.success(t("register.registrationSuccess"))
           navigate('/dashboard/profile')
       } catch (error: any) {
           const message = error?.response?.data?.message || t("register.registrationError")
           toast.error(message)
       }
    };

    return (
        <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(submit)}
            sx={{ display: "grid", gap: 2 }}
        >
            <TextField
                label={t("register.firstNameLabel")}
                placeholder={t("register.firstNamePlaceholder")}
                autoComplete="given-name"
                fullWidth
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
                label={t("register.lastNameLabel")}
                placeholder={t("register.lastNamePlaceholder")}
                autoComplete="family-name"
                fullWidth
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
                label={t("register.passwordLabel")}
                placeholder={t("register.passwordPlaceholder")}
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                fullWidth
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message ?? t("register.passwordRequired")}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPwd((s) => !s)} edge="end">
                                {showPwd ? <FiEyeOff /> : <FiEye />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <TextField
                label={t("register.confirmPasswordLabel")}
                placeholder={t("register.confirmPasswordPlaceholder")}
                type={showPwd2 ? "text" : "password"}
                autoComplete="new-password"
                fullWidth
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPwd2((s) => !s)} edge="end">
                                {showPwd2 ? <FiEyeOff /> : <FiEye />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                    {t("register.passwordHint")}
                </Typography>
            </Stack>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ height: 44, textTransform: "none" }}
            >
                {t("register.registerButton")}
            </Button>
        </Box>
    );
}
