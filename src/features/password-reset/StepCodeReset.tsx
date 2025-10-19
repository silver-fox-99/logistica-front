import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
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
            onVerified(idToken); // передаём наверх — использовать на шаге 3
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        await firebasePhone.sendCode(phoneE164);
    };

    return (
        <Stack spacing={2}>
            <OtpInput length={length} value={code} onChange={setCode} autoFocus />
            <Box>
                <Button fullWidth variant="contained" disabled={busy || code.length !== length} onClick={verify} sx={{ height: 44 }}>
                    Verify
                </Button>
            </Box>
            <Stack direction="row" spacing={1}>
                <Button variant="text" onClick={resend}>Resend code</Button>
                {onBack && <Button variant="outlined" onClick={onBack}>Change phone</Button>}
            </Stack>
        </Stack>
    );
}
