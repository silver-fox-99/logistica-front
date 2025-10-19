import { Box, Button } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";
import { authApi } from "@/shared/api/authApi";
import { firebasePhone } from "@/shared/lib/firebasePhone";

const schema = z.object({
    phone: z.string().min(1, "Phone is required").refine(v => matchIsValidTel(v), "Enter a valid phone number"),
});

type FormValues = z.infer<typeof schema>;
export default function StepPhoneExisting({ onNext }: { onNext: (e164: string) => void }) {
    const { control, handleSubmit, setError, formState: { isSubmitting } } =
        useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { phone: "" }, mode: "onTouched" });

    const submit = async (data: FormValues) => {
        let e164 = data.phone;
        try { const p = parsePhoneNumber(data.phone); if (p) e164 = p.number; } catch {}


        const { existing } = await authApi.checkPhone(e164);
        if (!existing) {
            setError("phone", { message: "This phone number is not registered" });
            return;
        }


        await firebasePhone.sendCode(e164);

        onNext(e164);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submit)} sx={{ display: "grid", gap: 2 }} noValidate>
            <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                    <MuiTelInput
                        {...field}
                        label="Phone number"
                        defaultCountry="UZ"
                        forceCallingCode
                        placeholder="+1 (555) 000-0000"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                )}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>Send code</Button>
        </Box>
    );
}
