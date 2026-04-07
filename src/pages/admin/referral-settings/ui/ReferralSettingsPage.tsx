

import { Box } from "@mui/material";
import { ReferralSettingsEditor } from "@/features/referralProgramSettings/edit";
import { ReferralPayouts } from "@/features/referralProgramSettings/payouts";
import {useAdminAccessStore} from "@/entities/adminAccess/model/adminAccess.store.ts";
import {viewCode} from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

export default function ReferralSettingsPage() {
    const canViewReferral = useAdminAccessStore((s) => s.hasPermission(viewCode('REFERRAL_SETTINGS' as any)));

    if (!canViewReferral) return <NoAccess/>

    return (
        <Box sx={{ p: 3 }}>
            <ReferralSettingsEditor />
            <Box sx={{ mt: 2 }}>
                <ReferralPayouts />
            </Box>
        </Box>
    );
}
