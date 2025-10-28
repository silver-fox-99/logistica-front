import { Box, Button } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";
import { authApi } from "@/shared/api/authApi";
import { firebasePhone } from "@/shared/lib/firebasePhone";

type FormValues = { phone: string };
type StepPhoneProps = { defaultCountry?: string; onNext?: (e164: string, raw: string) => void; };

export default function StepPhone({ defaultCountry = "UZ", onNext }: StepPhoneProps) {
    const { t } = useTranslation();

    const schema = z.object({
        phone: z.string().min(1, t("register.phoneRequired"))
            .refine(v => matchIsValidTel(v), t("register.phoneInvalid")),
    });

    const { control, handleSubmit, setError, formState: { isSubmitting } } =
        useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { phone: "" }, mode: "onTouched" });

    const submit = async (data: FormValues) => {
        try {
            let e164 = data.phone;
            try { const p = parsePhoneNumber(data.phone); if (p) e164 = p.number; } catch {}

            const { existing } = await authApi.checkPhone(e164);
            if (existing) {
                setError("phone", { message: t("register.phoneExists") });
                return;
            }

            await firebasePhone.sendCode(e164);
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
            <Button type="submit" variant="contained" disabled={isSubmitting}>{t("register.sendCodeButton")}</Button>
        </Box>
    );
}
