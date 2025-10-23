import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { toast } from "react-toastify";
import OtpInput from "@/shared/ui/inputs/OtpInput";
import { firebasePhone } from "@/shared/lib/firebasePhone";

type Props = {
    length?: number;
    phoneE164: string;
    onVerified: (idToken: string) => void;
    onBack?: () => void;
};

export default function StepCodeReset({ length = 6, phoneE164, onVerified, onBack }: Props) {
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);

    const verify = async () => {
        if (code.length !== length) return;
        setBusy(true);
        try {
            const idToken = await firebasePhone.confirmCode(code);
            toast.success('Код успешно подтвержден');
            onVerified(idToken);
        } catch (error: any) {
            const message = error?.message || 'Неверный код подтверждения';
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        try {
            await firebasePhone.sendCode(phoneE164);
            toast.success('Код отправлен повторно');
        } catch (error: any) {
            const message = error?.message || 'Не удалось отправить код';
            toast.error(message);
        }
    };

    return (
        <Stack spacing={2}>
            <OtpInput length={length} value={code} onChange={setCode} autoFocus />
            <Box>
                <Button fullWidth variant="contained" disabled={busy || code.length !== length} onClick={verify} sx={{ height: 44 }}>
                    Подтвердить
                </Button>
            </Box>
            <Stack direction="row" spacing={1}>
                <Button variant="text" onClick={resend}>Отправить код повторно</Button>
                {onBack && <Button variant="outlined" onClick={onBack}>Изменить номер</Button>}
            </Stack>
        </Stack>
    );
}
