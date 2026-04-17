import { Alert, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { companyStatusMap } from "@/entities/company/model/companyStatus";

export default function CompanyVerificationPage() {
    const { company } = useCompanyWorkspaceContext();
    const status = companyStatusMap[company.status];

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
                                Verification
                            </Typography>
                            <Chip label={status.label} color={status.color} size="small" />
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            Track verification progress and review feedback from the moderation team.
                        </Typography>

                        {company.status === "UNVERIFIED" ? (
                            <Alert severity="info">
                                Complete company information and upload documents to start verification.
                            </Alert>
                        ) : null}

                        {company.status === "PENDING_REVIEW" ? (
                            <Alert severity="warning">
                                Your company is currently under review. Please wait for the moderation result.
                            </Alert>
                        ) : null}

                        {company.status === "VERIFIED" ? (
                            <Alert severity="success">
                                Your company has been verified successfully.
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