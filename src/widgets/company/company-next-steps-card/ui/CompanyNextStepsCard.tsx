import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Company } from "@/entities/company/model/types";

type Props = {
    company: Company;
};

export function CompanyNextStepsCard({ company }: Props) {
    const { t } = useTranslation();

    const needsInfo = !company.legal_name || !company.registration_number || !company.country;
    const needsDocuments = company.status === "UNVERIFIED";
    const underReview = company.status === "PENDING_REVIEW";

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            {t("companyOverviewCards.nextStepsCard.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("companyOverviewCards.nextStepsCard.description")}
                        </Typography>
                    </Stack>

                    {needsInfo ? (
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                {t("companyOverviewCards.nextStepsCard.completeInfoStep")}
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="../info"
                                variant="outlined"
                                sx={{
                                    alignSelf: "flex-start",
                                    textTransform: "none",
                                    borderRadius: 2,
                                    fontWeight: 700,
                                }}
                            >
                                {t("companyOverviewCards.nextStepsCard.completeInfoButton")}
                            </Button>
                        </Stack>
                    ) : null}

                    {needsDocuments ? (
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                {t("companyOverviewCards.nextStepsCard.uploadDocumentsStep")}
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="../documents"
                                variant="outlined"
                                sx={{
                                    alignSelf: "flex-start",
                                    textTransform: "none",
                                    borderRadius: 2,
                                    fontWeight: 700,
                                }}
                            >
                                {t("companyOverviewCards.nextStepsCard.uploadDocumentsButton")}
                            </Button>
                        </Stack>
                    ) : null}

                    {underReview ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("companyOverviewCards.nextStepsCard.underReviewHint")}
                        </Typography>
                    ) : null}

                    {company.status === "VERIFIED" ? (
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                            {t("companyOverviewCards.nextStepsCard.verifiedHint")}
                        </Typography>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}