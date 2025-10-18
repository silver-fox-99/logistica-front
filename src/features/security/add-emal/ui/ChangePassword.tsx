import { Card, CardContent, CardActions, Button, Stack, Typography } from "@mui/material";
import { FiLock } from "react-icons/fi";
import {securityApi} from "@/shared/api/securityApi.ts";
import { useState } from "react";

export function ChangePasswordCard() {
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            await securityApi.startPasswordChange();
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
                    Passwords are stored encrypted, so we cannot display them here. If you want to set a new password, click “Change password”.
                </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="contained" onClick={handleStart} disabled={loading}>
                    {loading ? "Please wait..." : "Change password"}
                </Button>
            </CardActions>
        </Card>
    );
}
