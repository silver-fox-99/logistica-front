import { Box, Button, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { authApi } from "@/shared/api/authApi.ts";
import { useUserStore } from "@/entities/user/model/user.store.ts";
import { useTranslation } from "react-i18next";

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
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleLocalSubmit = async (data: SignInForm) => {
    try {
      const res = await authApi.login(data);
      const user = res.data;
      const { accessToken, refreshToken, ...rest } = user;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setUser(rest);
      toast.success(t("loginForm.success"));
      navigate("/dashboard/profile");
    } catch (error: any) {
      const message = error?.response?.data?.message || t("loginForm.error");
      toast.error(message);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(handleLocalSubmit)}
      sx={{ display: "flex", flexDirection: "column", width: "100%" }}
    >
      {/* Поле Номер телефона / Email */}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
      >
        {t("loginForm.phone")}
      </Typography>
      <TextField
        type="text"
        autoComplete="username"
        fullWidth
        required
        placeholder={
          i18n.language === "ru" ? "+1 (650) 890-8976" : "Enter phone or e-mail"
        }
        {...register("identify")}
        error={!!errors.identify}
        helperText={errors.identify?.message}
        sx={{ mb: 3 }}
      />

      {/* Поле Пароль */}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
      >
        {t("loginForm.password")}
      </Typography>
      <TextField
        type="password"
        autoComplete="current-password"
        fullWidth
        required
        placeholder="********"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={{ mb: 4 }}
      />

      {/* Кнопка Войти */}
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
        sx={{
          bgcolor: "primary.main",
          fontSize: "1rem",
          fontWeight: 600,
          height: "48px",
          mb: 2,
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        {t("loginForm.login")}
      </Button>

      {/* Кнопка Забыли пароль */}
      <Button
        component={RouterLink}
        to="/reset-password"
        variant="outlined"
        fullWidth
        sx={{
          borderColor: "primary.main",
          color: "primary.main",
          fontSize: "1rem",
          fontWeight: 600,
          height: "48px",
          "&:hover": {
            borderColor: "primary.dark",
            bgcolor: "rgba(15, 95, 194, 0.04)",
          },
        }}
      >
        {t("loginForm.forgotPassword")}
      </Button>
    </Box>
  );
}
