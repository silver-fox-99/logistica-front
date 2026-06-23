import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from "@mui/material";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import OtpInput from "@/shared/ui/inputs/OtpInput";
import { profileApi } from "@/shared/api/profileApi";

interface VerifyPhoneModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (phone: string) => void;
    initialPhone?: string;
}

export default function VerifyPhoneModal({ open, onClose, onSuccess, initialPhone = "" }: VerifyPhoneModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<0 | 1>(0);
    const [phone, setPhone] = useState(initialPhone);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (open) {
            setPhone(initialPhone);
            setCode("");
            setStep(0);
            setTimer(0);
        }
    }, [open, initialPhone]);

    useEffect(() => {
        if (timer > 0) {
            const tId = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(tId);
        }
    }, [timer]);

    const handleSendCode = async () => {
        if (!matchIsValidTel(phone)) {
            toast.error(t("profile.validation.invalidPhone"));
            return;
        }
        setLoading(true);
        try {
            let e164 = phone;
            try { const p = parsePhoneNumber(phone); if (p) e164 = p.number; } catch {}
            await profileApi.sendPhoneCode(e164);
            toast.success(t("register.codeSent"));
            setStep(1);
            setTimer(60);
        } catch (error: any) {
            const message = error?.response?.data?.message || t("register.codeSendError");
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (code.length < 6) return;
        setLoading(true);
        try {
            let e164 = phone;
            try { const p = parsePhoneNumber(phone); if (p) e164 = p.number; } catch {}
            await profileApi.verifyPhone(code);
            toast.success(t("profile.contactInfo.verifyPhoneSuccess"));
            onSuccess(e164);
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.message || t("profile.contactInfo.verifyPhoneError");
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle fontWeight={700}>
                {t("profile.contactInfo.verifyPhoneTitle")}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {step === 0 ? (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {t("profile.contactInfo.enterPhone")}
                            </Typography>
                            <MuiTelInput
                                value={phone}
                                onChange={setPhone}
                                defaultCountry="UZ"
                                forceCallingCode
                                error={phone.length > 0 && !matchIsValidTel(phone)}
                                helperText={phone.length > 0 && !matchIsValidTel(phone) ? t("profile.validation.invalidPhone") : ""}
                                placeholder="+1 (555) 000-0000"
                                fullWidth
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {t("register.step2Subtitle", { phone })}
                            </Typography>
                            <Stack alignItems="center">
                                <OtpInput length={6} value={code} onChange={setCode} autoFocus />
                            </Stack>
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
                        disabled={loading || !matchIsValidTel(phone)}
                        sx={{ textTransform: "none" }}
                    >
                        {t("profile.contactInfo.sendSmsCode")}
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
                            {t("profile.contactInfo.verifyPhone")}
                        </Button>
                    </Stack>
                )}
            </DialogActions>
        </Dialog>
    );
}
