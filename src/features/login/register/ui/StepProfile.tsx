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
import {authApi} from "@/shared/api/authApi.ts";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "@/entities/user/model/user.store.ts";

const schema = z.object({
    firstName: z.string().trim().min(2, "Имя должно быть не короче 2 символов"),
    lastName: z.string().trim().min(2, "Фамилия должна быть не короче 2 символов"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
    confirmPassword: z.string().min(1, "Подтверждение пароля должно быть не короче 1 символа"),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароль и подтверждение пароля не совпадают",
});

export type ProfileFormValues = z.infer<typeof schema>;

type StepProfileProps = {
    defaultValues?: Partial<ProfileFormValues>;
};

export default function StepProfile({ defaultValues }: StepProfileProps) {
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const navigate = useNavigate()
    const setUser = useUserStore(s => s.setUser);


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
           toast.success('Регистрация успешно завершена!')
           navigate('/dashboard/profile')
       } catch (error: any) {
           const message = error?.response?.data?.message || 'Ошибка при регистрации'
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
                label="Имя*"
                placeholder="Ваше имя (как в документе)"
                autoComplete="given-name"
                fullWidth
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
                label="Фамилия*"
                placeholder="Ваша фамилия (как в документе)"
                autoComplete="family-name"
                fullWidth
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
                label="Пароль*"
                placeholder="Введите пароль"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                fullWidth
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message ?? "Пароль должен быть не короче 6 символов"}
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
                label="Повторите пароль*"
                placeholder="Подтвердите пароль"
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
                    *Пароль должен быть не короче 6 символов
                </Typography>
            </Stack>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ height: 44, textTransform: "none" }}
            >
                Зарегистрироваться
            </Button>
        </Box>
    );
}
