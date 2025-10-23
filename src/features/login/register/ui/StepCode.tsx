import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { toast } from "react-toastify";
import OtpInput from "@/shared/ui/inputs/OtpInput";
import { firebasePhone } from "@/shared/lib/firebasePhone";
import { authApi } from "@/shared/api/authApi";

type StepCodeProps = { length?: number; onSubmit?: () => void; onResend?: () => void; };

export default function StepCode({ length = 6, onSubmit, onResend }: StepCodeProps) {
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);

    const handleVerify = async () => {
        if (code.length !== length) return;
        setBusy(true);
        try {
            const idToken = await firebasePhone.confirmCode(code);
            await authApi.verifyFirebaseIdToken(idToken);
            toast.success('Код успешно подтвержден');
            onSubmit?.();
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Неверный код подтверждения';
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <OtpInput length={length} value={code} onChange={setCode} autoFocus />
            <Box>
                <Button fullWidth variant="contained" disabled={busy || code.length !== length} onClick={handleVerify} sx={{ height: 44 }}>
                    Подтвердить
                </Button>
            </Box>
            {onResend && (
                <Button onClick={onResend} variant="text">Отправить код повторно</Button>
            )}
        </Stack>
    );
}
