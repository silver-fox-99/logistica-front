import { Alert, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
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
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            spacing={1}
                        >
                            <Typography variant="h5" fontWeight={700}>
                                {t("companyVerification.title")}
                            </Typography>
                            <Chip label={statusLabel} color={status.color} size="small" />
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            {t("companyVerification.description")}
                        </Typography>

                        {company.status === "UNVERIFIED" ? (
                            <Alert severity="info">
                                {t("companyVerification.messages.unverified")}
                            </Alert>
                        ) : null}

                        {company.status === "PENDING_REVIEW" ? (
                            <Alert severity="warning">
                                {t("companyVerification.messages.pendingReview")}
                            </Alert>
                        ) : null}

                        {company.status === "VERIFIED" ? (
                            <Alert severity="success">
                                {t("companyVerification.messages.verified")}
                            </Alert>
                        ) : null}

                        {company.verification_comment ? (
                            <Alert severity="info">
                                {company.verification_comment}
                            </Alert>
                        ) : null}
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}