import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { FiCheckCircle, FiMapPin, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { PublicCompanyProfile } from "@/entities/company/model/types";

type Props = {
    company: PublicCompanyProfile;
    isAuthenticated?: boolean;
    isSubmitting?: boolean;
    onJoinClick: () => void;
};

function buildLocation(company: PublicCompanyProfile) {
    return [company.country, company.region, company.city].filter(Boolean).join(", ");
}

export function PublicCompanyHeader({
                                        company,
                                        isAuthenticated = false,
                                        isSubmitting = false,
                                        onJoinClick,
                                    }: Props) {
    const { t } = useTranslation();
    const location = buildLocation(company);
    const membersCount = company.members?.length ?? 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "background.paper",
            }}
        >
            <Box
                sx={{
                    px: { xs: 2, md: 3 },
                    py: { xs: 2.5, md: 4 },
                    background:
                        "linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.02) 100%)",
                }}
            >
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
                            <Avatar
                                src={company.logo || undefined}
                                alt={company.name}
                                sx={{
                                    width: { xs: 64, md: 84 },
                                    height: { xs: 64, md: 84 },
                                    fontSize: { xs: 24, md: 30 },
                                }}
                            >
                                {company.name?.slice(0, 1)?.toUpperCase()}
                            </Avatar>

                            <Stack spacing={0.75} minWidth={0}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                    <Typography
                                        variant="h4"
                                        fontWeight={800}
                                        sx={{
                                            fontSize: { xs: 28, md: 38 },
                                            lineHeight: 1.1,
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {company.name}
                                    </Typography>

                                    <Chip
                                        icon={<FiCheckCircle size={14} />}
                                        label={t("publicCompany.header.verifiedCompany")}
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Stack>

                                <Typography variant="body1" color="text.secondary">
                                    {company.legal_name || t("publicCompany.header.profileFallback")}
                                </Typography>

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={{ xs: 0.75, sm: 2 }}
                                    useFlexGap
                                    flexWrap="wrap"
                                >
                                    {location ? (
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            <Box color="text.secondary" display="flex">
                                                <FiMapPin size={16} />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {location}
                                            </Typography>
                                        </Stack>
                                    ) : null}

                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <Box color="text.secondary" display="flex">
                                            <FiUsers size={16} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {t("publicCompany.header.teamMembers", { count: membersCount })}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>

                        <Button
                            variant="contained"
                            onClick={onJoinClick}
                            disabled={isSubmitting}
                            sx={{
                                minWidth: { xs: "100%", md: 180 },
                                alignSelf: { xs: "stretch", md: "center" },
                            }}
                        >
                            {isAuthenticated
                                ? t("publicCompany.header.applyToJoin")
                                : t("publicCompany.header.loginToApply")}
                        </Button>
                    </Stack>

                    <Typography
                        variant="body1"
                        color={company.description ? "text.primary" : "text.secondary"}
                        sx={{ maxWidth: 920, lineHeight: 1.75 }}
                    >
                        {company.description || t("publicCompany.header.descriptionFallback")}
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    );
}