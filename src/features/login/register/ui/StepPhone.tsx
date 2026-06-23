import { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, FormHelperText, Stack, Typography, Tabs, Tab, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";
import { authApi } from "@/shared/api/authApi";

type TabType = "phone" | "email";
type StepPhoneProps = { defaultCountry?: string; onNext?: (val: string, raw: string, type: TabType) => void; };

type ErrorsState = { phone?: string; email?: string; acceptAgreement?: string; };

export default function StepPhone({ defaultCountry = "UZ", onNext }: StepPhoneProps) {
    const { t } = useTranslation();
    const agreementUrl = "/docs/user-agreement.pdf";

    // Обычные стейты для данных формы
    const [tab, setTab] = useState<TabType>("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [acceptAgreement, setAcceptAgreement] = useState(false);

    // Стейты для ошибок и загрузки
    const [errors, setErrors] = useState<ErrorsState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Функция ручной валидации перед отправкой
    const validateForm = (): boolean => {
        const newErrors: ErrorsState = {};

        // 1. Валидация чекбокса
        if (!acceptAgreement) {
            newErrors.acceptAgreement = t("register.acceptAgreementRequired");
        }

        // 2. Валидация в зависимости от вкладки
        if (tab === "phone") {
            if (!phone || phone.trim() === "") {
                newErrors.phone = t("register.phoneRequired");
            } else if (!matchIsValidTel(phone)) {
                newErrors.phone = t("register.phoneInvalid");
            }
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || email.trim() === "") {
                newErrors.email = t("register.emailRequired");
            } else if (!emailRegex.test(email)) {
                newErrors.email = t("register.emailInvalid");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Если валидация не прошла, прерываем выполнение
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            if (tab === "phone") {
                let e164 = phone;
                try { const p = parsePhoneNumber(phone); if (p) e164 = p.number; } catch {}

                await authApi.sendPhoneCode(e164);
                toast.success(t("register.codeSent"));
                onNext?.(e164, phone, "phone");
            } else {
                await authApi.sendEmailCode(email);
                toast.success(t("register.emailCodeSent"));
                onNext?.(email, email, "email");
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || t("register.codeSendError");
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }} noValidate>
            <Tabs
                value={tab}
                onChange={(_, newValue: TabType) => {
                    setTab(newValue);
                    setPhone("");
                    setEmail("");
                    setErrors({}); // Сбрасываем ошибки при переключении табов
                }}
                variant="fullWidth"
                sx={{
                    mb: 1,
                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
                }}
            >
                <Tab label={t("register.phoneTab")} value="phone" />
                <Tab label={t("register.emailTab")} value="email" />
            </Tabs>

            {tab === "phone" ? (
                <MuiTelInput
                    value={phone}
                    onChange={(val) => {
                        setPhone(val);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    label={t("register.phoneLabel")}
                    // @ts-ignore
                    defaultCountry={defaultCountry}
                    forceCallingCode
                    placeholder={t("register.phonePlaceholder")}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
            ) : (
                <TextField
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    type="email"
                    label={t("register.emailLabel")}
                    placeholder={t("register.emailPlaceholder")}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
            )}

            <Stack spacing={0.25}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={acceptAgreement}
                            onChange={(e) => {
                                setAcceptAgreement(e.target.checked);
                                if (errors.acceptAgreement) setErrors((prev) => ({ ...prev, acceptAgreement: undefined }));
                            }}
                            color="primary"
                        />
                    }
                    label={
                        <Typography variant="body2" color="text.secondary">
                            {t("register.acceptAgreementPrefix")}{" "}
                            <a
                                href={agreementUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#4472B8", fontWeight: 600 }}
                            >
                                {t("register.userAgreement")}
                            </a>
                        </Typography>
                    }
                />
                {errors.acceptAgreement && (
                    <FormHelperText error>{errors.acceptAgreement}</FormHelperText>
                )}
            </Stack>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
                {t("register.sendCodeButton")}
            </Button>
        </Box>
    );
}