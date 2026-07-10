import { Paper, Stack, Avatar, Typography, Box } from "@mui/material";
import { FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";

type ProfileOverviewCardProps = {
    fullName: string;
    location?: string;
    registeredAt?: string;
    ratingValue?: number | null;
    reviewsCount?: number;
    requestsCount?: number;
};

export default function ProfileOverviewCard({
                                                fullName,
                                                location = "—",
                                                registeredAt = "—",
                                                ratingValue = null,
                                                reviewsCount = 0,
                                                requestsCount = 0,
                                            }: ProfileOverviewCardProps) {
    const { t } = useTranslation();

    const formattedRating = ratingValue != null && Number.isFinite(ratingValue)
        ? ratingValue.toFixed(1)
        : "5.0";

    return (
        <Stack spacing={2} className="profile-overview-card">
            {/* Top Card: Headline */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    borderRadius: "16px",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: "#EEF4F7",
                            color: "primary.main",
                            flexShrink: 0
                        }}
                    >
                        <FiUser size={24} />
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                fontSize: "1.25rem",
                                color: "#0c2340",
                                mb: 0.5
                            }}
                        >
                            {t('profile.overview.title', "Обзор профиля")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                fontSize: "0.9rem"
                            }}
                        >
                            {t('profile.overview.description', "В этом разделе отображается основная информация о вашем профиле. Эти данные видны другим пользователям")}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Bottom Card: Details */}
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: "16px",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2.5} alignItems="center">
                        {/* Avatar with Rating Badge overlay */}
                        <Box sx={{ position: "relative", display: "inline-block" }}>
                            <Avatar sx={{ width: 64, height: 64, bgcolor: "#EEF4F7", color: "primary.main" }}>
                                <FiUser size={32} />
                            </Avatar>
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: -8,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: "12px",
                                    px: 1,
                                    py: 0.2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 800, color: "#E2B93B", fontSize: "0.75rem" }}>★</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.75rem" }}>
                                    {formattedRating}
                                </Typography>
                            </Box>
                        </Box>

                        <Stack spacing={0.5} flex={1}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: "1.5rem",
                                        color: "primary.main",
                                    }}
                                >
                                    {fullName}
                                </Typography>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ marginLeft: 8 }}
                                >
                                    <path
                                        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                                        fill="#0F5FC2"
                                    />
                                </svg>
                            </Box>
                        </Stack>
                    </Stack>

                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('profile.overview.location', "Местоположение")}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {location}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('profile.overview.registeredAt', "Дата регистрации")}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {registeredAt}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('profile.overview.totalReviews', "Всего отзывов")}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {reviewsCount}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('profile.overview.totalRequests', "Всего заявок")}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {requestsCount}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
