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
import { formatDate } from "@/shared/utils/formatDate.ts";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    const onTabChange = useCallback((_: any, v: number) => setTab(v), []);

    const invitedRows = useMemo(() => invitedUsers, [invitedUsers]);
    const earningRows = useMemo(() => recentEarnings, [recentEarnings]);

    const statusLabel = useCallback(
        (status: string) => t(`referralProgram.status.${status}`, { defaultValue: status }),
        [t]
    );

    const reasonLabel = useCallback(
        (reason?: string | null) =>
            reason ? t(`referralProgram.reason.${reason}`, { defaultValue: reason }) : t("common.dash"),
        [t]
    );

    return (
        <Paper sx={{ p: { xs: 2, md: 2.25 }, borderRadius: 3 }}>
            <Tabs value={tab} onChange={onTabChange} sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <Tab label={t("referralProgram.tabs.overview")} />
                <Tab label={t("referralProgram.tabs.invitedUsers")} />
                <Tab label={t("referralProgram.tabs.earningsHistory")} />
                <Tab label={t("referralProgram.tabs.faq")} />
            </Tabs>

            {/* OVERVIEW */}
            <TabPanel value={tab} index={0}>
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800} sx={{ mb: 1 }}>
                            {t("referralProgram.overview.howItWorks.title")}
                        </Typography>
                        <Stack spacing={0.75}>
                            <Typography variant="body2">{t("referralProgram.overview.howItWorks.steps.1")}</Typography>
                            <Typography variant="body2">{t("referralProgram.overview.howItWorks.steps.2")}</Typography>
                            <Typography variant="body2">{t("referralProgram.overview.howItWorks.steps.3")}</Typography>
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800} sx={{ mb: 1 }}>
                            {t("referralProgram.overview.recentEarnings.title")}
                        </Typography>

                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small" >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("referralProgram.table.date")}</TableCell>
                                        <TableCell>{t("referralProgram.table.user")}</TableCell>
                                        <TableCell>{t("referralProgram.table.amount")}</TableCell>
                                        {/*<TableCell>{t("referralProgram.table.status")}</TableCell>*/}
                                        {/*<TableCell>{t("referralProgram.table.reason")}</TableCell>*/}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {earningRows.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>{formatDate(r.date)}</TableCell>
                                            <TableCell>{r.userMasked}</TableCell>
                                            <TableCell>{`${r.amount} ${r.currency}`}</TableCell>
                                            {/*<TableCell>*/}
                                            {/*    <Chip*/}
                                            {/*        size="small"*/}
                                            {/*        label={statusLabel(r.status)}*/}
                                            {/*        color={statusChipColor(r.status)}*/}
                                            {/*        variant="outlined"*/}
                                            {/*        sx={{ borderRadius: 2 }}*/}
                                            {/*    />*/}
                                            {/*</TableCell>*/}
                                            {/*<TableCell>*/}
                                            {/*    <Chip*/}
                                            {/*        size="small"*/}
                                            {/*        label={reasonLabel((r as any).reason)}*/}
                                            {/*        variant="outlined"*/}
                                            {/*        sx={{ borderRadius: 2 }}*/}
                                            {/*    />*/}
                                            {/*</TableCell>*/}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </Stack>
            </TabPanel>

            {/* INVITED USERS */}
            <TabPanel value={tab} index={1}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("referralProgram.table.user")}</TableCell>
                                <TableCell>{t("referralProgram.table.joinedAt")}</TableCell>
                                <TableCell>{t("referralProgram.table.status")}</TableCell>
                                <TableCell>{t("referralProgram.table.reward")}</TableCell>
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
                                            label={statusLabel(r.status)}
                                            color={statusChipColor(r.status)}
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </TableCell>
                                    <TableCell>{r.rewarded_at ? formatDate(r.rewarded_at) : t("common.dash")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </TabPanel>

            {/* EARNINGS HISTORY */}
            <TabPanel value={tab} index={2}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("referralProgram.table.date")}</TableCell>
                                <TableCell>{t("referralProgram.table.user")}</TableCell>
                                <TableCell>{t("referralProgram.table.amount")}</TableCell>
                                <TableCell>{t("referralProgram.table.status")}</TableCell>
                                <TableCell>{t("referralProgram.table.reason")}</TableCell>
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
                                            label={statusLabel(r.status)}
                                            color={statusChipColor(r.status)}
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={reasonLabel((r as any).reason)}
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

            {/* FAQ */}
            <TabPanel value={tab} index={3}>
                <Stack spacing={1}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800}>{t("referralProgram.faq.q1.title")}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            {t("referralProgram.faq.q1.text")}
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800}>{t("referralProgram.faq.q2.title")}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            {t("referralProgram.faq.q2.text")}
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography fontWeight={800}>{t("referralProgram.faq.q3.title")}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            {t("referralProgram.faq.q3.text")}
                        </Typography>
                    </Paper>
                </Stack>
            </TabPanel>
        </Paper>
    );
}

export const ReferralTabs = memo(ReferralTabsBase);
