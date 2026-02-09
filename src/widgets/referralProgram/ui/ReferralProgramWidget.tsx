import { memo, useCallback, useState } from "react";
import { Box, CircularProgress, Stack, Typography, Alert } from "@mui/material";
import { useReferralProgram } from "../model/useReferralProgram";
import { AgreementCard } from "./AgreementCard";
import { CodeCard } from "./CodeCard";
import { BalanceCard } from "./BalanceCard";
import { ReferralTabs } from "./ReferralTabs";
import { ReferralUnavailable } from "@/widgets/referralProgram/ui/ReferralUnavailable.tsx";
import { useTranslation } from "react-i18next";

function ReferralProgramWidgetBase() {
    const {
        loading,
        error,
        agreement,
        agreementLoading,
        codeInfo,
        kpi,
        invitedUsers,
        earningsRows,
        actions,
        enabled,
    } = useReferralProgram();

    const [agreementOpen, setAgreementOpen] = useState(false);
    const { t } = useTranslation();

    const openAgreement = useCallback(() => {
        setAgreementOpen(true);
        void actions.loadAgreementContent();
    }, [actions]);

    const closeAgreement = useCallback(() => setAgreementOpen(false), []);

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack alignItems="center" sx={{ py: 6 }}>
                    <CircularProgress />
                </Stack>
            </Box>
        );
    }

    if (!enabled) {
        return <ReferralUnavailable onReload={actions.reload} />;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                    <Box>
                        <Typography variant="h5" fontWeight={800}>
                            {t("referralProgram.title")}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            {t("referralProgram.subtitle")}
                        </Typography>
                    </Box>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "stretch" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <AgreementCard
                            agreement={agreement}
                            open={agreementOpen}
                            onOpen={openAgreement}
                            onClose={closeAgreement}
                            onSign={actions.signAgreement}
                            loadingContent={agreementLoading}
                        />
                    </Box>

                    {agreement.isSigned && codeInfo?.code && (
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <CodeCard codeInfo={codeInfo} />
                        </Box>
                    )}
                </Stack>

                {agreement.isSigned && (
                    <>
                        <BalanceCard kpi={kpi} />
                        <ReferralTabs invitedUsers={invitedUsers} recentEarnings={earningsRows} />
                    </>
                )}
            </Stack>
        </Box>
    );
}

export const ReferralProgramWidget = memo(ReferralProgramWidgetBase);
