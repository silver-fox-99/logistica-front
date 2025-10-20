import { Paper, Stack, Avatar, Typography, Chip } from "@mui/material";
import { FiUser } from "react-icons/fi";

import "./ProfilePage.scss";

type ProfileOverviewCardProps = {
    fullName: string;
    location?: string;
    registeredAt?: string;
    ratings?: { label: string; value: number; color?: "default"|"primary"|"success"|"warning" }[];
};

export default function ProfileOverviewCard({
                                                fullName,
                                                location = "—",
                                                registeredAt = "—",
                                                ratings = [
                                                    { label: "★", value: 4.7, color: "success" },
                                                ],
                                            }: ProfileOverviewCardProps) {
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
                <Typography variant="h6">Обзор профиля</Typography>
                <Typography variant="body2" color="text.secondary">
                    В этом разделе отображается основная информация о вашем профиле. Эти данные видны другим пользователям.
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" mt={1.5}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                        <FiUser />
                    </Avatar>

                    <Stack spacing={0.5} flex={1}>
                        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                            {fullName.toUpperCase()}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            {ratings.map((r, i) => (
                                <Chip
                                    key={i}
                                    label={`${r.label} ${r.value.toFixed(1)}`}
                                    color={r.color === "success" ? "success" : r.color === "warning" ? "warning" : (r.color as any)}
                                    size="small"
                                    variant={r.color ? "filled" : "outlined"}
                                />
                            ))}
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ color: "text.secondary", mt: 0.5 }}>
                            <Typography variant="body2"><b>Местоположение:</b> {location}</Typography>
                            <Typography variant="body2"><b>Дата регистрации:</b> {registeredAt}</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}