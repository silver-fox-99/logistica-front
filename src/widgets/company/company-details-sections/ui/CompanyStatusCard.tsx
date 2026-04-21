import { Alert, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Company } from "@/entities/company/model/types";
import { companyStatusMap } from "@/entities/company/model/companyStatus";

type Props = {
    company: Company;
};

export function CompanyStatusCard({ company }: Props) {
    const { t } = useTranslation();

    const status = companyStatusMap[company.status];
    const statusLabel = t(`companyStatus.${company.status}`, {
        defaultValue: status?.label || company.status,
    });

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                            {t("companyOverviewCards.statusCard.title")}
                        </Typography>
                        <Chip label={statusLabel} color={status.color} size="small" />
                    </Stack>

                    {company.status === "UNVERIFIED" && (
                        <Alert severity="info">
                            {t("companyOverviewCards.statusCard.unverifiedHint")}
                        </Alert>
                    )}

                    {company.status === "PENDING_REVIEW" && (
                        <Alert severity="warning">
                            {t("companyOverviewCards.statusCard.pendingReviewHint")}
                        </Alert>
                    )}

                    {company.verification_comment ? (
                        <Alert severity="info">{company.verification_comment}</Alert>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}