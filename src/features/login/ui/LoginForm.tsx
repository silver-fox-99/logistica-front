import { Box, Button, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


const signInSchema = z.object({
    phone: z
        .string()
        .min(1, "Phone is required")
        .transform((v) => v.replace(/[^\d+]/g, ""))
        .refine((v) => /^\+?\d{7,15}$/.test(v), "Введите верный номер телефона"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});

type SignInForm = z.infer<typeof signInSchema>;

type LoginFormProps = {
    onSubmit?: (data: SignInForm) => Promise<void> | void;
};

export default function LoginForm({ onSubmit }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        defaultValues: { phone: "", password: "" },
        mode: "onTouched",
    });

    const handleLocalSubmit = async (data: SignInForm) => {
        if (onSubmit) return onSubmit(data);
        console.log("sign-in:", data);
    };

    return (
        <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(handleLocalSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", mt: "32px" }}
        >
            <TextField
                label="Номер телефона"
                type="tel"
                autoComplete="tel"
                fullWidth
                required
                placeholder="+1 202 555 0110"
                inputProps={{ inputMode: "tel" }}
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
            />

            <TextField
                label="Пароль"
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
                Войти
            </Button>

            <Link className="button button--reset" to="/reset">
                Забыли пароль?
            </Link>
        </Box>
    );
}
