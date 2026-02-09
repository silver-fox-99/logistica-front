import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { authApi } from "@/shared/api/authApi.ts";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/user/model/user.store.ts";

const PROFILE_TYPES = ["Грузоотправитель", "Логист", "Перевозчик", "Другое"] as const;
type ProfileType = (typeof PROFILE_TYPES)[number];

export type ProfileFormValues = {
    firstName: string;
    lastName: string;
    type: ProfileType;
    password: string;
    confirmPassword: string;
    code?: string
};

type StepProfileProps = {
    defaultValues?: Partial<ProfileFormValues>;
};

export default function StepProfile({ defaultValues }: StepProfileProps) {
    const { t } = useTranslation();
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const navigate = useNavigate();
    const setUser = useUserStore((s) => s.setUser);

    const schema = z
        .object({
            firstName: z.string().trim().min(2, t("register.firstNameRequired")),
            lastName: z.string().trim().min(2, t("register.lastNameRequired")),
            type: z.enum(PROFILE_TYPES, { message: "Please select a role." }),
            password: z.string().min(6, t("register.passwordRequired")),
            confirmPassword: z.string().min(1, t("register.confirmPasswordRequired")),
            code: z.string().optional(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            path: ["confirmPassword"],
            message: t("register.confirmPasswordMismatch"),
        });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            type: "Другое",
            password: "",
            confirmPassword: "",
            code: "",
            ...defaultValues,
        },
        mode: "onTouched",
    });

    const submit = async (data: ProfileFormValues) => {
        try {
            const res = await authApi.completeRegister(data);
            setUser(res.data);
            toast.success(t("register.registrationSuccess"));
            navigate("/dashboard/profile");
        } catch (error: any) {
            const message =
                error?.response?.data?.message || t("register.registrationError");
            toast.error(message);
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

            {/* Type select */}
            <FormControl fullWidth error={!!errors.type}>
                <InputLabel id="profile-type-label">{t('register.accountType')}</InputLabel>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            labelId="profile-type-label"
                            label="Account type"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                        >
                            <MenuItem value="Грузоотправитель">{t('register.accountTypes.shipper')}</MenuItem>
                            <MenuItem value="Логист">{t('register.accountTypes.logist')}</MenuItem>
                            <MenuItem value="Перевозчик">{t('register.accountTypes.carrier')}</MenuItem>
                            <MenuItem value="Другое">{t('register.accountTypes.other')}</MenuItem>
                        </Select>
                    )}
                />
                {errors.type?.message ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.type.message}
                    </Typography>
                ) : null}
            </FormControl>

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

            <TextField
                label={t('register.invitationCode')}
                placeholder={t('register.enterInvitationCode')}
                autoComplete="given-code"
                fullWidth
                {...register("code")}
                error={!!errors.code}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

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
