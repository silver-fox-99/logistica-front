import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Verified } from "@mui/icons-material";
import { FiPlus, FiBriefcase, FiMapPin, FiGlobe, FiMail, FiPhone, FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { PublicCompanyProfile } from "@/entities/company/model/types";
import { formatDate } from "@/shared/utils/formatDate";

type Props = {
    company: PublicCompanyProfile;
    isAuthenticated?: boolean;
    isSubmitting?: boolean;
    onJoinClick: () => void;
};

function buildAddress(company: PublicCompanyProfile) {
    return [company.country, company.region, company.city, company.address]
        .filter(Boolean)
        .join(", ");
}

export function PublicCompanyHeader({
                                        company,
                                        isAuthenticated = false,
                                        isSubmitting = false,
                                        onJoinClick,
                                    }: Props) {
    const { t } = useTranslation();
    const address = buildAddress(company);

    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: "16px",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Stack spacing={3}>
                {/* Top header row */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2.5}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
                        <Avatar
                            src={company.logo || undefined}
                            alt={company.name}
                            sx={{
                                width: 64,
                                height: 64,
                                fontSize: 24,
                            }}
                        >
                            {company.name?.slice(0, 1)?.toUpperCase()}
                        </Avatar>

                        <Stack spacing={0.5} minWidth={0}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    sx={{
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {company.name}
                                </Typography>

                                <Verified color="primary" sx={{ fontSize: 20 }} />
                            </Stack>
                        </Stack>
                    </Stack>

                    <Button
                        variant="contained"
                        onClick={onJoinClick}
                        disabled={isSubmitting}
                        startIcon={<FiPlus />}
                        sx={{
                            minWidth: 180,
                            alignSelf: { xs: "stretch", sm: "center" },
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        {isAuthenticated
                            ? t("publicCompany.header.applyToJoin", "Подать заявку")
                            : t("publicCompany.header.loginToApply", "Войти и подать заявку")}
                    </Button>
                </Stack>

                {/* Description */}
                {company.description && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ maxWidth: 920, lineHeight: 1.6 }}
                    >
                        {company.description}
                    </Typography>
                )}

                {/* Metadata Details */}
                <Stack spacing={2.5}>
                    {company.legal_name && (
                        <MetadataRow
                            icon={<FiBriefcase size={20} />}
                            label={t("publicCompany.overview.legalName", "Юридическое название")}
                            value={company.legal_name}
                        />
                    )}
                    {address && (
                        <MetadataRow
                            icon={<FiMapPin size={20} />}
                            label={t("publicCompany.overview.address", "Адрес")}
                            value={address}
                        />
                    )}
                    {company.website && (
                        <MetadataRow
                            icon={<FiGlobe size={20} />}
                            label={t("publicCompany.overview.website", "Сайт")}
                            value={company.website}
                            isLink
                        />
                    )}
                    {company.email && (
                        <MetadataRow
                            icon={<FiMail size={20} />}
                            label={t("publicCompany.contacts.email", "Почта")}
                            value={company.email}
                        />
                    )}
                    {company.phone && (
                        <MetadataRow
                            icon={<FiPhone size={20} />}
                            label={t("publicCompany.contacts.phone", "Телефон")}
                            value={company.phone}
                        />
                    )}
                    {company.created_at && (
                        <MetadataRow
                            icon={<FiCalendar size={20} />}
                            label={t("publicCompany.overview.created", "Создана")}
                            value={formatDate(company.created_at)}
                        />
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}

function MetadataRow({
                         icon,
                         label,
                         value,
                         isLink,
                     }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    isLink?: boolean;
}) {
    return (
        <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
                sx={{
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 0.25,
                }}
            >
                {icon}
            </Box>
            <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                {isLink ? (
                    <Typography
                        component="a"
                        href={value.startsWith("http") ? value : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        fontWeight={700}
                        color="primary.main"
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                        {value}
                    </Typography>
                ) : (
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                        {value}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}