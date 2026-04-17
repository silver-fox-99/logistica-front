import { Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import type { Company } from "@/entities/company/model/types";

type Props = {
    company: Company;
};

function calcCompletion(company: Company): number {
    const fields = [
        company.name,
        company.legal_name,
        company.registration_number,
        company.tax_number,
        company.phone,
        company.email,
        company.website,
        company.country,
        company.region,
        company.city,
        company.address,
        company.description,
    ];

    const filled = fields.filter((item) => {
        return typeof item === "string" ? item.trim().length > 0 : Boolean(item);
    }).length;

    return Math.round((filled / fields.length) * 100);
}

export function CompanyProgressCard({ company }: Props) {
    const percent = calcCompletion(company);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                        Profile completion
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Complete your company profile to speed up verification.
                    </Typography>

                    <Typography variant="body2" fontWeight={600}>
                        {percent}% completed
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{ height: 8, borderRadius: 999 }}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}