import { memo, useMemo } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

import type { ReferralKpi } from "@/entities/referralProgram";

type Props = { kpi: ReferralKpi };

function formatMoney(amount: string, currency: string) {
    const n = Number(amount);
    if (Number.isFinite(n)) return `${n.toLocaleString("en-US")} ${currency}`;
    return `${amount} ${currency}`;
}

function BalanceCardBase({ kpi }: Props) {
    const available = useMemo(() => formatMoney(kpi.available.amount, kpi.available.currency), [kpi.available]);
    const pending = useMemo(() => formatMoney(kpi.pending.amount, kpi.pending.currency), [kpi.pending]);
    const total = useMemo(() => formatMoney(kpi.totalEarned.amount, kpi.totalEarned.currency), [kpi.totalEarned]);

    return (
        <Paper sx={{ p: { xs: 2, md: 2.25 }, borderRadius: 3 }}>
            <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Typography variant="h6" fontWeight={800}>
                        Balance & Summary
                    </Typography>
                </Stack>

                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    sx={{ alignItems: { md: "center" } }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Available balance
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                            {available}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                            Pending: {pending}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                Invited
                            </Typography>
                            <Typography fontWeight={800}>{kpi.invited}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                Active
                            </Typography>
                            <Typography fontWeight={800}>{kpi.active}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                Qualified
                            </Typography>
                            <Typography fontWeight={800}>{kpi.qualified}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                Total earned
                            </Typography>
                            <Typography fontWeight={800}>{total}</Typography>
                        </Box>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
}

export const BalanceCard = memo(BalanceCardBase);
