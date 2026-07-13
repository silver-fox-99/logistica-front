import { Alert, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { companyStatusMap } from "@/entities/company/model/companyStatus";

export default function CompanyVerificationPage() {
  const { t } = useTranslation();
  const { company } = useCompanyWorkspaceContext();

  const status = companyStatusMap[company.status];
  const statusLabel = t(`companyStatus.${company.status}`, {
    defaultValue: status?.label || company.status,
  });

  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "16px",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="h5" fontWeight={600}>
              {t("companyVerification.title")}
            </Typography>
            <Chip label={statusLabel} color={status.color} size="small" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {t("companyVerification.description")}
          </Typography>

          {company.status === "UNVERIFIED" ? (
            <Alert severity="info" sx={{ borderRadius: "8px" }}>
              {t("companyVerification.messages.unverified")}
            </Alert>
          ) : null}

          {company.status === "PENDING_REVIEW" ? (
            <Alert severity="warning" sx={{ borderRadius: "8px" }}>
              {t("companyVerification.messages.pendingReview")}
            </Alert>
          ) : null}

          {company.status === "VERIFIED" ? (
            <Alert severity="success" sx={{ borderRadius: "8px" }}>
              {t("companyVerification.messages.verified")}
            </Alert>
          ) : null}

          {company.verification_comment ? (
            <Alert severity="info" sx={{ borderRadius: "8px" }}>
              {company.verification_comment}
            </Alert>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
