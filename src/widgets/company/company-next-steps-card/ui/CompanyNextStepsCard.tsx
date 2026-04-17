import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Company } from "@/entities/company/model/types";

type Props = {
    company: Company;
};

export function CompanyNextStepsCard({ company }: Props) {
    const needsInfo = !company.legal_name || !company.registration_number || !company.country;
    const needsDocuments = company.status === "UNVERIFIED";
    const underReview = company.status === "PENDING_REVIEW";

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            Next steps
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Follow these steps to unlock all company features.
                        </Typography>
                    </Stack>

                    {needsInfo ? (
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                1. Complete company information.
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="../info"
                                variant="outlined"
                                sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 2, fontWeight: 700 }}
                            >
                                Complete info
                            </Button>
                        </Stack>
                    ) : null}

                    {needsDocuments ? (
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                2. Upload verification documents.
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="../documents"
                                variant="outlined"
                                sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 2, fontWeight: 700 }}
                            >
                                Upload documents
                            </Button>
                        </Stack>
                    ) : null}

                    {underReview ? (
                        <Typography variant="body2" color="text.secondary">
                            Your documents are under review. You can update profile details while waiting.
                        </Typography>
                    ) : null}

                    {company.status === "VERIFIED" ? (
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                            Your company is verified. Team management is now available.
                        </Typography>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}