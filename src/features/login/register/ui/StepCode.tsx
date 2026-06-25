import {useEffect, useState} from "react";
import { Box, Button, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import OtpInput from "@/shared/ui/inputs/OtpInput";

import { authApi } from "@/shared/api/authApi";

type StepCodeProps = { length?: number; type?: "phone" | "email"; onSubmit?: () => void; };

export default function StepCode({ length = 6, type = "phone", onSubmit }: StepCodeProps) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [timer, setTimer] = useState(0)

    const handleVerify = async () => {
        if (code.length !== length) return;
        setBusy(true);
        try {
            if (type === "phone") {
                await authApi.verifyPhoneCode(code);
            } else {
                await authApi.verifyEmailCode(code);
            }
            toast.success(t("register.codeVerified"));
            onSubmit?.();
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || t("register.codeInvalid");
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const handleResend = async () => {
        try {
            if (type === "phone") {
                await authApi.sendAgainPhoneCode();
            } else {
                await authApi.sendAgainEmailCode();
            }
            setTimer(60);
            toast.success(t("register.codeSent"));
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || t("register.codeSendError");
            toast.error(message);
        }
    };

    useEffect(() => {
        if (timer > 0) {
            setTimeout(() => setTimer(timer - 1), 1000);
        }
    }, [timer])


    return (
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
            <Stack spacing={2}>
                <OtpInput length={length} value={code} onChange={setCode} autoFocus />
                <Box>
                    <Button type="submit" fullWidth variant="contained" disabled={busy || code.length !== length} sx={{ height: 44 }}>
                        {t("register.verifyButton")}
                    </Button>
                </Box>
                <Button disabled={timer > 0} onClick={handleResend} variant="text">{t("register.resendCodeButton")} {timer > 0 && `(${timer}s)`}</Button>
            </Stack>
        </form>
    );
}
