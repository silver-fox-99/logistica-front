import { memo, useMemo } from "react";
import { Box, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { FiLink } from "react-icons/fi";
import { CopyField } from "@/shared/ui/CopyField";
import type { ReferralCodeInfo } from "@/entities/referralProgram";

type Props = { codeInfo: ReferralCodeInfo };

function CodeCardBase({ codeInfo }: Props) {
    const tooltipText = useMemo(() => "Share your code to invite friends.", []);

    return (
        <Paper sx={{ p: { xs: 2, md: 2.25 }, borderRadius: 3 }}>
            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)" }}>
                            <FiLink />
                        </Box>
                        <Typography fontWeight={800}>Referral Code</Typography>
                    </Stack>

                    <Tooltip title={tooltipText}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 10, bgcolor: "rgba(0,0,0,0.18)" }} />
                    </Tooltip>
                </Stack>

                <CopyField label="Your referral code" value={codeInfo.code} buttonLabel="Copy" />
            </Stack>
        </Paper>
    );
}

export const CodeCard = memo(CodeCardBase);
