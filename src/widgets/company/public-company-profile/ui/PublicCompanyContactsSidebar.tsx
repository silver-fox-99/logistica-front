import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { FiArrowLeft, FiGlobe, FiMail, FiPhone } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { PublicCompanyProfile } from "@/entities/company/model/types";

type Props = {
    company: PublicCompanyProfile;
    isAuthenticated?: boolean;
    isSubmitting?: boolean;
    onJoinClick: () => void;
    onBack: () => void;
};

export function PublicCompanyContactsSidebar({
                                                 company,
                                                 isAuthenticated = false,
                                                 isSubmitting = false,
                                                 onJoinClick,
                                                 onBack,
                                             }: Props) {
    const { t } = useTranslation();

    return (
        <Paper
            variant="outlined"
            elevation={0}
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: "16px",
                borderColor: "divider",
                bgcolor: "background.paper",
                position: { lg: "sticky" },
                top: { lg: 24 },
            }}
        >
            <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        {t("publicCompany.contacts.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("publicCompany.contacts.description")}
                    </Typography>
                </Stack>

                <Stack spacing={1.5}>
                    <ContactItem
                        icon={<FiGlobe size={16} />}
                        label={t("publicCompany.contacts.website")}
                        value={company.website || t("publicCompany.contacts.notSpecified")}
                    />
                    <ContactItem
                        icon={<FiMail size={16} />}
                        label={t("publicCompany.contacts.email")}
                        value={company.email || t("publicCompany.contacts.notSpecified")}
                    />
                    <ContactItem
                        icon={<FiPhone size={16} />}
                        label={t("publicCompany.contacts.phone")}
                        value={company.phone || t("publicCompany.contacts.notSpecified")}
                    />
                </Stack>

                <Stack spacing={1}>
                    <Button
                        variant="contained"
                        onClick={onJoinClick}
                        disabled={isSubmitting}
                        fullWidth
                        sx={{ borderRadius: "8px" }}
                    >
                        {isAuthenticated
                            ? t("publicCompany.contacts.applyToJoin")
                            : t("publicCompany.contacts.loginToApply")}
                    </Button>

                    <Button
                        variant="text"
                        onClick={onBack}
                        startIcon={<FiArrowLeft />}
                        fullWidth
                        sx={{ borderRadius: "8px" }}
                    >
                        {t("publicCompany.contacts.goBack")}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}

function ContactItem({
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

            <Stack spacing={0.25} minWidth={0}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ wordBreak: "break-word" }}>
                    {value}
                </Typography>
            </Stack>
        </Stack>
    );
}