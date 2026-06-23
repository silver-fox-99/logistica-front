import { Box, Button, TextField } from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {authApi} from "@/shared/api/authApi.ts";
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {useTranslation} from "react-i18next";


const signInSchema = z.object({
    identify: z
        .string()
        .min(1, "Введите номер телефона или E-mail")
        .transform((v) => {
            const isEmail = z.string().email().safeParse(v).success;
            if (isEmail) return v.trim();
            return v.replace(/[^\d+]/g, "");
        })
        .refine((v) => {
            const isEmail = z.string().email().safeParse(v).success;
            if (isEmail) return true;
            return /^\+?\d{7,15}$/.test(v);
        }, "Введите верный номер телефона или E-mail"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});

type SignInForm = z.infer<typeof signInSchema>;



export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        defaultValues: { identify: "", password: "" },
        mode: "onTouched",
    });

    const { t, i18n } = useTranslation();

    const setUser = useUserStore(s => s.setUser);
    const navigate = useNavigate()
    const handleLocalSubmit = async (data: SignInForm) => {
        try {
            const res = await authApi.login(data)
            const user = res.data
            const {accessToken, refreshToken, ...rest} = user
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            setUser(rest)
            toast.success(t('loginForm.success'))
            navigate('/dashboard/profile')
        } catch (error: any) {
            const message = error?.response?.data?.message || t('loginForm.error')
            toast.error(message)
        }
    };

    return (
        <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(handleLocalSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", mt: "32px" }}
        >
            <TextField
                label={t('loginForm.phone')}
                type="text"
                autoComplete="username"
                fullWidth
                required
                placeholder={i18n.language === "ru" ? "Введите телефон или e-mail" : i18n.language === "uz" ? "Telefon yoki e-mail kiriting" : "Enter phone or e-mail"}
                {...register("identify")}
                error={!!errors.identify}
                helperText={errors.identify?.message}
            />

            <TextField
                label={t('loginForm.password')}
                type="password"
                autoComplete="current-password"
                fullWidth
                required
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
            />

            <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                    background: "#4472B8",
                    fontSize: "16px",
                    textTransform: "capitalize",
                    borderRadius: "5px",
                    height: "42px",
                }}
            >
                {t('loginForm.login')}
            </Button>

            <Link className="button button--reset" to="/reset-password">
                {t('loginForm.forgotPassword')}
            </Link>
        </Box>
    );
}
