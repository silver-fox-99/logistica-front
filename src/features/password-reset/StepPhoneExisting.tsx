import { Box, Button } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";
import { authApi } from "@/shared/api/authApi";

type FormValues = { phone: string };

export default function StepPhoneExisting({
  onNext,
}: {
  onNext: (e164: string) => void;
}) {
  const { t } = useTranslation();

  const schema = z.object({
    phone: z
      .string()
      .min(1, t("forgotPassword.phoneRequired"))
      .refine((v) => matchIsValidTel(v), t("forgotPassword.phoneInvalid")),
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });

  const submit = async (data: FormValues) => {
    try {
      let e164 = data.phone;
      try {
        const p = parsePhoneNumber(data.phone);
        if (p) e164 = p.number;
      } catch {}

      const { existing } = await authApi.checkPhone(e164);
      if (!existing) {
        setError("phone", { message: t("forgotPassword.phoneNotFound") });
        return;
      }

      await authApi.sendRestorePhoneCode(e164);

      toast.success(t("forgotPassword.codeSent"));
      onNext(e164);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("forgotPassword.codeSendError");
      toast.error(message);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submit)}
      sx={{ display: "grid", gap: 2 }}
      noValidate
    >
      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <MuiTelInput
            {...field}
            label={t("forgotPassword.phoneLabel")}
            defaultCountry="UZ"
            forceCallingCode
            placeholder={t("forgotPassword.phonePlaceholder")}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
      >
        {t("forgotPassword.sendCodeButton")}
      </Button>
    </Box>
  );
}
