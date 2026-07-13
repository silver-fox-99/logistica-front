import { LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    const percent = calcCompletion(company);

    return (
        <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider", p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={700}>
                    {t("companyOverviewCards.progressCard.title")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {t("companyOverviewCards.progressCard.description")}
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                    {t("companyOverviewCards.progressCard.completed", { percent })}
                </Typography>

                <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{ height: 8, borderRadius: 999 }}
                />
            </Stack>
        </Paper>
    );
}