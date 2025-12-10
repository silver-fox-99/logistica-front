import { Box, Button, Checkbox, FormControlLabel, FormHelperText, Stack, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";
import { authApi } from "@/shared/api/authApi";


type FormValues = { phone: string; acceptAgreement: boolean };
type StepPhoneProps = { defaultCountry?: string; onNext?: (e164: string, raw: string) => void; };

export default function StepPhone({ defaultCountry = "UZ", onNext }: StepPhoneProps) {
    const { t } = useTranslation();
    const agreementUrl = "/docs/user-agreement.pdf";

    const schema = z.object({
        phone: z.string().min(1, t("register.phoneRequired"))
            .refine(v => matchIsValidTel(v), t("register.phoneInvalid")),
        acceptAgreement: z.boolean().refine((v) => v === true, "Подтвердите, что принимаете пользовательское соглашение"),
    });

    const { control, handleSubmit, formState: { isSubmitting, errors } } =
        useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { phone: "", acceptAgreement: false }, mode: "onTouched" });

    const submit = async (data: FormValues) => {
        try {
            let e164 = data.phone;
            try { const p = parsePhoneNumber(data.phone); if (p) e164 = p.number; } catch {}

            await authApi.sendPhoneCode(e164);
            toast.success(t("register.codeSent"));
            onNext?.(e164, data.phone);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || t("register.codeSendError");
            toast.error(message);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submit)} sx={{ display: "grid", gap: 2 }} noValidate>
            <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                    <MuiTelInput
                        {...field}
                        label={t("register.phoneLabel")}
                        // @ts-ignore
                        defaultCountry={defaultCountry}
                        forceCallingCode
                        placeholder={t("register.phonePlaceholder")}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                )}
            />
            <Stack spacing={0.25}>
                <Controller
                    name="acceptAgreement"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" color="text.secondary">
                                    Я принимаю{" "}
                                    <a
                                        href={agreementUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#4472B8", fontWeight: 600 }}
                                    >
                                        пользовательское соглашение
                                    </a>
                                </Typography>
                            }
                        />
                    )}
                />
                {errors.acceptAgreement && (
                    <FormHelperText error>{errors.acceptAgreement.message}</FormHelperText>
                )}
            </Stack>
            <Button type="submit" variant="contained" disabled={isSubmitting}>{t("register.sendCodeButton")}</Button>
        </Box>
    );
}
