import {
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";
import type { PublicCompanyProfile } from "@/entities/company/model/types";

type Props = {
    company: PublicCompanyProfile;
};

function buildAddress(company: PublicCompanyProfile) {
    return [company.country, company.region, company.city, company.address]
        .filter(Boolean)
        .join(", ");
}

export function PublicCompanyDetailsCard({ company }: Props) {
    const address = buildAddress(company);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Company details
                    </Typography>

                    <Stack spacing={1.25}>
                        <Typography variant="body2">
                            <strong>Website:</strong> {company.website || "Not specified"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Email:</strong> {company.email || "Not specified"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Phone:</strong> {company.phone || "Not specified"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Address:</strong> {address || "Not specified"}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}