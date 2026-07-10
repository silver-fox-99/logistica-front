import { memo, useCallback, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { useReferralProgram } from "../model/useReferralProgram";
import { AgreementCard } from "./AgreementCard";
import { CodeCard } from "./CodeCard";
import { BalanceCard } from "./BalanceCard";
import { ReferralTabs } from "./ReferralTabs";
import { ReferralUnavailable } from "@/widgets/referralProgram/ui/ReferralUnavailable.tsx";
import { useTranslation } from "react-i18next";
import { FiShare2 } from "react-icons/fi";

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
    <Box>
      <Stack spacing={2}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.25,
            borderRadius: "16px",
            mb: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              bgcolor: "rgba(15, 95, 194, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <FiShare2 size={24} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 850,
                color: "text.primary",
                letterSpacing: "-0.02em",
                mb: 0.25,
              }}
            >
              {t("referralProgram.title", {
                defaultValue: "Реферальная программа",
              })}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {t("referralProgram.subtitle", {
                defaultValue:
                  "Приглашайте пользователей и получайте бонусы за их активность.",
              })}
            </Typography>
          </Box>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: "stretch" }}
        >
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
            <ReferralTabs
              invitedUsers={invitedUsers}
              recentEarnings={earningsRows}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}

export const ReferralProgramWidget = memo(ReferralProgramWidgetBase);
