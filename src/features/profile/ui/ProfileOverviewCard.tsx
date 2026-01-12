import { Paper, Stack, Avatar, Typography, Chip } from "@mui/material";
import { FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import "./ProfilePage.scss";

type ProfileOverviewCardProps = {
    fullName: string;
    location?: string;
    registeredAt?: string;
    ratings?: { label: string; value: number | null | undefined; color?: "default"|"primary"|"success"|"warning" }[];
};

export default function ProfileOverviewCard({
                                                fullName,
                                                location = "—",
                                                registeredAt = "—",
                                                ratings = [],
                                            }: ProfileOverviewCardProps) {
    const { t } = useTranslation();
    
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
            className="profile-overview-card"
        >
            <Stack spacing={1}>
                <Typography variant="h6">{t('profile.overview.title')}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('profile.overview.description')}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" mt={1.5}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                        <FiUser />
                    </Avatar>

                    <Stack spacing={0.5} flex={1}>
                        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                            {fullName.toUpperCase()}
                        </Typography>

                        {ratings.length > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                {ratings.map((r, i) => {
                                    const formatted = r.value != null && Number.isFinite(Number(r.value))
                                        ? Number(r.value).toFixed(1)
                                        : "—";
                                    return (
                                        <Chip
                                            key={i}
                                            label={`${r.label} ${formatted}`}
                                            color={r.color === "success" ? "success" : r.color === "warning" ? "warning" : (r.color as any)}
                                            size="small"
                                            variant={r.color ? "filled" : "outlined"}
                                        />
                                    );
                                })}
                            </Stack>
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ color: "text.secondary", mt: 0.5 }}>
                            <Typography variant="body2"><b>{t('profile.overview.location')}</b> {location}</Typography>
                            <Typography variant="body2"><b>{t('profile.overview.registeredAt')}</b> {registeredAt}</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}
