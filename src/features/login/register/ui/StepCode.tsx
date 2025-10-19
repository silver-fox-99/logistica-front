import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
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
            onSubmit?.();
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <OtpInput length={length} value={code} onChange={setCode} autoFocus />
            <Box>
                <Button fullWidth variant="contained" disabled={busy || code.length !== length} onClick={handleVerify} sx={{ height: 44 }}>
                    Verify
                </Button>
            </Box>
            {onResend && (
                <Button onClick={onResend} variant="text">Resend code</Button>
            )}
        </Stack>
    );
}
