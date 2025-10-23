import { useState } from "react";
import { Card, CardContent, CardActions, Button, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMail, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";
import { addEmailSchema, type AddEmailForm } from "../model/schema";
import {securityApi} from "@/shared/api/securityApi.ts";


export function AddEmailCard() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddEmailForm>({
        resolver: zodResolver(addEmailSchema),
        defaultValues: { email: "" },
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: AddEmailForm) => {
        setLoading(true);
        try {
            await securityApi.sendEmailCode(data.email);
            toast.success("Код подтверждения отправлен на ваш E-mail");
            reset({ email: data.email });
        } catch (e: any) {
            const message = e?.response?.data?.message ?? "Не удалось отправить код";
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
                    <Typography variant="h6">Add E-mail</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Your phone number is used for primary sign-in. After adding an E-mail you can also use it to sign in and receive important notifications.
                </Typography>

                <Stack spacing={1} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="E-mail"
                        placeholder="email@gmail.com"
                        {...register("email")}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <Typography variant="caption" color="text.secondary">
                        A verification code will be sent to this address. Use it to complete the E-mail linking.
                    </Typography>

                    <CardActions sx={{ p: 0, mt: 1 }}>
                        <Button type="submit" variant="contained" startIcon={<FiSend />} disabled={loading}>
                            {loading ? "Sending..." : "Send code"}
                        </Button>
                    </CardActions>
                </Stack>
            </CardContent>
        </Card>
    );
}
