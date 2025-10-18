import { useState } from "react";
import {
    Card, CardContent, CardActions, Button, Stack,
    TextField, Typography, Alert, IconButton, InputAdornment
} from "@mui/material";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { securityApi } from "@/shared/api/securityApi";

const schema = z.object({
    oldPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
}).refine((val) => val.newPassword === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

type FormValues = z.infer<typeof schema>;

export function ChangePasswordCard() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    });

    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onSubmit = async ({ oldPassword, newPassword }: FormValues) => {
        setLoading(true);
        setSuccessMsg(null);
        setErrorMsg(null);
        try {
            await securityApi.changePassword(oldPassword, newPassword);
            setSuccessMsg("Password has been updated successfully.");
            reset({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message ?? "Failed to change the password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <FiLock />
                    <Typography variant="h6">Change password</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Passwords are stored encrypted, so we cannot display them here. To set a new one, enter your current password and a new password.
                </Typography>

                <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Current password"
                        type={showOld ? "text" : "password"}
                        {...register("oldPassword")}
                        error={!!errors.oldPassword}
                        helperText={errors.oldPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowOld(v => !v)} edge="end" aria-label="toggle password">
                                        {showOld ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="New password"
                        type={showNew ? "text" : "password"}
                        {...register("newPassword")}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNew(v => !v)} edge="end" aria-label="toggle password">
                                        {showNew ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Confirm new password"
                        type={showConfirm ? "text" : "password"}
                        {...register("confirmPassword")}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" aria-label="toggle password">
                                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {successMsg && <Alert severity="success">{successMsg}</Alert>}
                    {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                    <CardActions sx={{ p: 0 }}>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Please wait..." : "Change password"}
                        </Button>
                    </CardActions>
                </Stack>
            </CardContent>
        </Card>
    );
}
