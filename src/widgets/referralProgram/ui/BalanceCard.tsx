import { memo, useMemo } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReferralKpi } from "@/entities/referralProgram";
import { useTranslation } from "react-i18next";

type Props = { kpi: ReferralKpi };

function formatMoney(amount: string, currency: string, locale: string) {
    const n = Number(amount);
    const formatted = Number.isFinite(n) ? n.toLocaleString(locale) : amount;
    return `${formatted} ${currency}`;
}

function BalanceCardBase({ kpi }: Props) {
    const { t, i18n } = useTranslation();

    const locale = useMemo(() => {
        if (i18n.language?.startsWith("ru")) return "ru-RU";
        if (i18n.language?.startsWith("uz")) return "uz-UZ";
        return "en-US";
    }, [i18n.language]);

    const available = useMemo(
        () => formatMoney(kpi.available.amount, kpi.available.currency, locale),
        [kpi.available.amount, kpi.available.currency, locale]
    );

    const pending = useMemo(
        () => formatMoney(kpi.pending.amount, kpi.pending.currency, locale),
        [kpi.pending.amount, kpi.pending.currency, locale]
    );

    const total = useMemo(
        () => formatMoney(kpi.totalEarned.amount, kpi.totalEarned.currency, locale),
        [kpi.totalEarned.amount, kpi.totalEarned.currency, locale]
    );

    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 2, md: 2.25 },
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                bgcolor: "background.paper",
                borderColor: "divider",
            }}
        >
            <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Typography variant="h6" fontWeight={800}>
                        {t("referralProgram.balance.title")}
                    </Typography>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            {t("referralProgram.balance.available")}
                        </Typography>

                        <Typography variant="h5" fontWeight={800}>
                            {available}
                        </Typography>

                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                            {t("referralProgram.balance.pending", { amount: pending })}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                {t("referralProgram.balance.invited")}
                            </Typography>
                            <Typography fontWeight={800}>{kpi.invited}</Typography>
                        </Box>

                        {/*<Box>*/}
                        {/*    <Typography variant="body2" sx={{ opacity: 0.75 }}>*/}
                        {/*        {t("referralProgram.balance.active")}*/}
                        {/*    </Typography>*/}
                        {/*    <Typography fontWeight={800}>{kpi.active}</Typography>*/}
                        {/*</Box>*/}

                        {/*<Box>*/}
                        {/*    <Typography variant="body2" sx={{ opacity: 0.75 }}>*/}
                        {/*        {t("referralProgram.balance.qualified")}*/}
                        {/*    </Typography>*/}
                        {/*    <Typography fontWeight={800}>{kpi.qualified}</Typography>*/}
                        {/*</Box>*/}

                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                {t("referralProgram.balance.totalEarned")}
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
