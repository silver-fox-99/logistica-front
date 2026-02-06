import { memo, useCallback, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Paper,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { TabPanel } from "@/shared/ui/TabPanel";
import type { ReferralEarningRow, ReferralInvitedRow } from "@/entities/referralProgram";
import {formatDate} from "@/shared/utils/formatDate.ts";

type Props = {
    invitedUsers: ReferralInvitedRow[];
    recentEarnings: ReferralEarningRow[];
};

function statusChipColor(status: string): "default" | "success" | "warning" | "error" {
    switch (status) {
        case "CONFIRMED":
        case "QUALIFIED":
            return "success";
        case "PENDING":
        case "REGISTERED":
            return "warning";
        case "REVERSED":
            return "error";
        default:
            return "default";
    }
}

function ReferralTabsBase({ invitedUsers, recentEarnings }: Props) {
    const [tab, setTab] = useState(0);

    const onTabChange = useCallback((_: any, v: number) => setTab(v), []);

    const invitedRows = useMemo(() => invitedUsers, [invitedUsers]);
    const earningRows = useMemo(() => recentEarnings, [recentEarnings]);

    return (
        <Paper sx={{ p: { xs: 2, md: 2.25 }, borderRadius: 3 }}>
            <Tabs value={tab} onChange={onTabChange} sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <Tab label="Overview" />
                <Tab label="Invited Users" />
                <Tab label="Earnings History" />
                <Tab label="FAQ" />
            </Tabs>

            <TabPanel value={tab} index={0}>
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800} sx={{ mb: 1 }}>
                            How it works
                        </Typography>
                        <Stack spacing={0.75}>
                            <Typography variant="body2">1) Share your invite code</Typography>
                            <Typography variant="body2">2) Your friend signs up and completes the required action</Typography>
                            <Typography variant="body2">3) You receive rewards for qualified referrals</Typography>
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800} sx={{ mb: 1 }}>
                            Recent earnings
                        </Typography>

                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small" sx={{ minWidth: 640 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {earningRows.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>{formatDate(r.date)}</TableCell>
                                            <TableCell>{r.userMasked}</TableCell>
                                            <TableCell>{`${r.amount} ${r.currency}`}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={r.status}
                                                    color={statusChipColor(r.status)}
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </Stack>
            </TabPanel>

            <TabPanel value={tab} index={1}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Joined at</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Reward</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invitedRows.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>{r.userMasked}</TableCell>
                                    <TableCell>{formatDate(r.joinedAt)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={r.status}
                                            color={statusChipColor(r.status)}
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {r.rewarded_at ? formatDate(r.rewarded_at) : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </TabPanel>

            <TabPanel value={tab} index={2}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {earningRows.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>{formatDate(r.date)}</TableCell>
                                    <TableCell>{r.userMasked}</TableCell>
                                    <TableCell>{`${r.amount} ${r.currency}`}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={r.status}
                                            color={statusChipColor(r.status)}
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </TabPanel>

            <TabPanel value={tab} index={3}>
                <Stack spacing={1}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800}>When do I receive rewards?</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            Rewards are credited after the invited user completes the required action.
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800}>What is a qualified referral?</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            A qualified referral is a user who meets the program conditions defined in the agreement.
                        </Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800}>What can I do with the money I earn?</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            Payments are made once a month if your balance is above 0. For more details, please refer to the agreement.
                        </Typography>
                    </Paper>
                </Stack>
            </TabPanel>
        </Paper>
    );
}

export const ReferralTabs = memo(ReferralTabsBase);
