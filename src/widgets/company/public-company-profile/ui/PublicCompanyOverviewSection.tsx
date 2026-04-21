import { Box, Paper, Stack, Typography } from "@mui/material";
import { FiBriefcase, FiCalendar, FiFileText, FiMapPin } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { PublicCompanyProfile } from "@/entities/company/model/types";
import { formatDate } from "@/shared/utils/formatDate";

type Props = {
    company: PublicCompanyProfile;
};

function buildAddress(company: PublicCompanyProfile) {
    return [company.country, company.region, company.city, company.address]
        .filter(Boolean)
        .join(", ");
}

export function PublicCompanyOverviewSection({ company }: Props) {
    const { t } = useTranslation();
    const address = buildAddress(company);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                bgcolor: "background.paper",
                width: "100%",
            }}
        >
            <Stack spacing={2.5}>
                <Typography variant="h6" fontWeight={700}>
                    {t("publicCompany.overview.title")}
                </Typography>

                <Stack spacing={1.75}>
                    {company.legal_name ? (
                        <InfoRow
                            icon={<FiBriefcase size={16} />}
                            label={t("publicCompany.overview.legalName")}
                            value={company.legal_name}
                        />
                    ) : null}

                    {address ? (
                        <InfoRow
                            icon={<FiMapPin size={16} />}
                            label={t("publicCompany.overview.address")}
                            value={address}
                        />
                    ) : null}

                    {company.website ? (
                        <InfoRow
                            icon={<FiFileText size={16} />}
                            label={t("publicCompany.overview.website")}
                            value={company.website}
                        />
                    ) : null}

                    {company.created_at ? (
                        <InfoRow
                            icon={<FiCalendar size={16} />}
                            label={t("publicCompany.overview.created")}
                            value={formatDate(company.created_at)}
                        />
                    ) : null}
                </Stack>
            </Stack>
        </Paper>
    );
}

function InfoRow({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
                sx={{
                    mt: "2px",
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    minWidth: 18,
                }}
            >
                {icon}
            </Box>

            <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
                    {value}
                </Typography>
            </Stack>
        </Stack>
    );
}