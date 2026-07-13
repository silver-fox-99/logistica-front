import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import type { PublicCompanyMember } from "@/entities/company/model/types";

type Props = {
    members: PublicCompanyMember[];
};

function getFullName(member: PublicCompanyMember, fallback: string) {
    return [member.user?.first_name, member.user?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || fallback;
}

export function PublicCompanyMembersSection({ members }: Props) {
    const { t } = useTranslation();

    const formatRole = (role?: string | null) => {
        if (!role) return t("publicCompany.members.fallbackRole");

        return t(`publicCompany.roles.${role}`, {
            defaultValue: t("publicCompany.members.fallbackRole"),
        });
    };

    return (
        <Box sx={{ py: 1 }}>
            <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight={700}>
                        {t("publicCompany.members.title", "Участники команды")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("publicCompany.members.description", "Люди, публично связанные с этой компанией")}
                    </Typography>
                </Stack>

                {members.length === 0 ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            px: 2.5,
                            py: 3,
                            borderRadius: "16px",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {t("publicCompany.members.empty")}
                        </Typography>
                    </Paper>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                            gap: 2,
                        }}
                    >
                        {members.map((member) => {
                            const fullName = getFullName(
                                member,
                                t("publicCompany.members.unknownMember")
                            );

                            const profileUrl = member.user?.id
                                ? `/dashboard/user-reviews/${member.user.id}`
                                : null;

                            return (
                                <Paper
                                    key={member.id}
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: "16px",
                                        borderColor: "divider",
                                        bgcolor: "background.paper",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                    }}
                                >
                                    {/* Top row: Avatar on left, Role Tag on right */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        {profileUrl ? (
                                            <Box
                                                component={NavLink}
                                                to={profileUrl}
                                                sx={{ display: "inline-flex", textDecoration: "none", color: "inherit" }}
                                            >
                                                <Avatar src={member.user?.avatar || undefined} sx={{ width: 44, height: 44, cursor: "pointer" }}>
                                                    {fullName[0]?.toUpperCase()}
                                                </Avatar>
                                            </Box>
                                        ) : (
                                            <Avatar src={member.user?.avatar || undefined} sx={{ width: 44, height: 44 }}>
                                                {fullName[0]?.toUpperCase()}
                                            </Avatar>
                                        )}

                                        <Chip
                                            size="small"
                                            label={formatRole(member.role)}
                                            sx={{
                                                bgcolor: "rgba(15, 95, 194, 0.06)",
                                                color: "primary.main",
                                                fontWeight: 650,
                                                borderRadius: "6px",
                                                border: "none",
                                            }}
                                        />
                                    </Stack>

                                    {/* Member Name and Contact info */}
                                    <Stack spacing={0.5}>
                                        {profileUrl ? (
                                            <Typography
                                                component={NavLink}
                                                to={profileUrl}
                                                variant="subtitle1"
                                                fontWeight={700}
                                                sx={{
                                                    wordBreak: "break-word",
                                                    textDecoration: "none",
                                                    color: "text.primary",
                                                    "&:hover": { color: "primary.main", textDecoration: "underline" },
                                                }}
                                            >
                                                {fullName}
                                            </Typography>
                                        ) : (
                                            <Typography variant="subtitle1" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                                                {fullName}
                                            </Typography>
                                        )}

                                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                                            {member.user?.phone || member.user?.email || "—"}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Box>
                )}
            </Stack>
        </Box>
    );
}