import { useState } from "react";
import { Card, CardContent, CardActions, Button, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FiMail, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";
import { addEmailSchema, type AddEmailForm } from "../model/schema";
import {securityApi} from "@/shared/api/securityApi.ts";


export function AddEmailCard() {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddEmailForm>({
        resolver: zodResolver(addEmailSchema),
        defaultValues: { email: "" },
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: AddEmailForm) => {
        setLoading(true);
        try {
            await securityApi.sendEmailCode(data.email);
            toast.success(t('security.addEmail.successMessage'));
            reset({ email: data.email });
        } catch (e: any) {
            const message = e?.response?.data?.message ?? t('security.addEmail.errorMessage');
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <FiMail />
                    <Typography variant="h6">{t('security.addEmail.title')}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('security.addEmail.description')}
                </Typography>

                <Stack spacing={1} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label={t('security.addEmail.emailLabel')}
                        placeholder={t('security.addEmail.emailPlaceholder')}
                        {...register("email")}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {t('security.addEmail.verificationHint')}
                    </Typography>

                    <CardActions sx={{ p: 0, mt: 1 }}>
                        <Button type="submit" variant="contained" startIcon={<FiSend />} disabled={loading}>
                            {loading ? t('security.addEmail.sending') : t('security.addEmail.sendButton')}
                        </Button>
                    </CardActions>
                </Stack>
            </CardContent>
        </Card>
    );
}
