import { useState, useEffect } from "react";
import { Box, Button, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import OtpInput from "@/shared/ui/inputs/OtpInput";
import {authApi} from "@/shared/api/authApi.ts";


type Props = {
    length?: number;
    onVerified: () => void;
    onBack?: () => void;
};

export default function StepCodeReset({ length = 6, onVerified, onBack }: Props) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [timer, setTimer] = useState(0);

    const verify = async () => {
        if (code.length !== length) return;
        setBusy(true);
        try {
            await authApi.verifyRestoreCode(code);
            toast.success(t("forgotPassword.codeVerified"));
            onVerified();
        } catch (error: any) {
            const message = error?.message || t("forgotPassword.codeInvalid");
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        try {
            await authApi.sendAgainPhoneCode();
            setTimer(60);
            toast.success(t("forgotPassword.codeSentAgain"));
        } catch (error: any) {
            const message = error?.message || t("forgotPassword.codeSendError");
            toast.error(message);
        }
    };

    useEffect(() => {
        if (timer > 0) {
            setTimeout(() => setTimer(timer - 1), 1000);
        }
    }, [timer]);

    return (
        <Stack spacing={2}>
            <OtpInput length={length} value={code} onChange={setCode} autoFocus />
            <Box>
                <Button fullWidth variant="contained" disabled={busy || code.length !== length} onClick={verify} sx={{ height: 44 }}>
                    {t("forgotPassword.verifyButton")}
                </Button>
            </Box>
            <Stack direction="row" spacing={1}>
                <Button disabled={timer > 0} variant="text" onClick={resend}>{t("forgotPassword.resendCodeButton")} {timer > 0 && `(${timer}s)`}</Button>
                {onBack && <Button variant="outlined" onClick={onBack}>{t("forgotPassword.changePhoneButton")}</Button>}
            </Stack>
        </Stack>
    );
}
