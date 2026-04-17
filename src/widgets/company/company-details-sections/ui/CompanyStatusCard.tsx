import { Alert, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Company } from "@/entities/company/model/types";
import { companyStatusMap } from "@/entities/company/model/companyStatus";

type Props = {
    company: Company;
};

export function CompanyStatusCard({ company }: Props) {
    const status = companyStatusMap[company.status];

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                            Verification status
                        </Typography>
                        <Chip label={status.label} color={status.color} size="small" />
                    </Stack>

                    {company.status === "UNVERIFIED" && (
                        <Alert severity="info">
                            Complete the company information and upload documents for verification.
                        </Alert>
                    )}

                    {company.status === "PENDING_REVIEW" && (
                        <Alert severity="warning">
                            Your company is under review. You can still view the profile and documents.
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