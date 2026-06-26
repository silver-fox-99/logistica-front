import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { securityApi } from "@/shared/api/securityApi";
import { z } from "zod";

interface VerifyEmailModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialEmail?: string;
}

export default function VerifyEmailModal({ open, onClose, onSuccess, initialEmail = "" }: VerifyEmailModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<0 | 1>(0);
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const emailSchema = z.string().email();

    useEffect(() => {
        if (open) {
            setEmail(initialEmail);
            setCode("");
            setStep(0);
            setTimer(0);
        }
    }, [open, initialEmail]);

    useEffect(() => {
        if (timer > 0) {
            const tId = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(tId);
        }
    }, [timer]);

    const handleSendCode = async () => {
        const result = emailSchema.safeParse(email);
        if (!result.success) {
            toast.error(t("profile.validation.invalidEmail"));
            return;
        }
        setLoading(true);
        try {
            await securityApi.sendEmailCode(email);
            toast.success(t("security.addEmail.successMessage"));
            setStep(1);
            setTimer(60);
        } catch (error: any) {
            const message = error?.response?.data?.message || t("security.addEmail.errorMessage");
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (code.length < 6) return;
        setLoading(true);
        try {
            await securityApi.confirmEmailCode(code);
            toast.success(t("profile.contactInfo.verifyEmailSuccess", "E-mail успешно подтвержден!"));
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.message || "Неверный код или ошибка подтверждения";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = emailSchema.safeParse(email).success;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle fontWeight={700}>
                {t("security.addEmail.modalTitle")}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {step === 0 ? (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {t("security.addEmail.modalDescription")}
                            </Typography>
                            <TextField
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                type="email"
                                fullWidth
                                error={email.length > 0 && !isValidEmail}
                                helperText={email.length > 0 && !isValidEmail ? t("profile.validation.invalidEmail") : ""}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {t("security.addEmail.modalSubtitle", { email })}
                            </Typography>
                            <TextField
                                value={code}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setCode(val);
                                }}
                                placeholder="000000"
                                inputProps={{
                                    maxLength: 6,
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    style: {
                                        textAlign: "center",
                                        fontSize: "24px",
                                        letterSpacing: "12px",
                                        paddingLeft: "12px",
                                        fontWeight: "700",
                                        fontFamily: "monospace",
                                    },
                                }}
                                fullWidth
                                autoFocus
                                sx={{
                                    mt: 1,
                                    mb: 1,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2.5,
                                        height: 56,
                                        backgroundColor: "action.hover",
                                        "& fieldset": {
                                            borderColor: "divider",
                                            borderWidth: 1.5,
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "action.active",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "primary.main",
                                            borderWidth: 2,
                                        },
                                    },
                                }}
                            />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none" }}>
                    {t("profile.contactInfo.cancel")}
                </Button>
                {step === 0 ? (
                    <Button
                        variant="contained"
                        onClick={handleSendCode}
                        disabled={loading || !isValidEmail}
                        sx={{ textTransform: "none" }}
                    >
                        {t("security.addEmail.sendButton")}
                    </Button>
                ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="text"
                            onClick={handleSendCode}
                            disabled={timer > 0 || loading}
                            sx={{ textTransform: "none", fontSize: "0.85rem" }}
                        >
                            {t("register.resendCodeButton")} {timer > 0 ? `(${timer}s)` : ""}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleVerifyCode}
                            disabled={loading || code.length < 6}
                            sx={{ textTransform: "none" }}
                        >
                            {t("security.addEmail.confirmButton")}
                        </Button>
                    </Stack>
                )}
            </DialogActions>
        </Dialog>
    );
}
