"use client";

import { Box } from "@mui/material";
import { ReferralSettingsEditor } from "@/features/referralProgramSettings/edit";
import { ReferralPayouts } from "@/features/referralProgramSettings/payouts";

export default function ReferralSettingsPage() {
    return (
        <Box sx={{ p: 3 }}>
            <ReferralSettingsEditor />
            <Box sx={{ mt: 2 }}>
                <ReferralPayouts />
            </Box>
        </Box>
    );
}
