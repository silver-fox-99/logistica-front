import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
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
        <Box
            sx={{
                px: { xs: 0, md: 0 },
                py: { xs: 0.5, md: 0.5 },
            }}
        >
            <Stack spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        {t("publicCompany.members.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("publicCompany.members.description")}
                    </Typography>
                </Stack>

                {members.length === 0 ? (
                    <Box
                        sx={{
                            px: 2,
                            py: 2.5,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {t("publicCompany.members.empty")}
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                            },
                            gap: 1.5,
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
                                <Box
                                    key={member.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: "background.paper",
                                        minWidth: 0,
                                    }}
                                >
                                    <Stack spacing={1.25}>
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            {profileUrl ? (
                                                <Box
                                                    component={NavLink}
                                                    to={profileUrl}
                                                    sx={{
                                                        display: "inline-flex",
                                                        textDecoration: "none",
                                                        color: "inherit",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Avatar
                                                        src={member.user?.avatar || undefined}
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {fullName[0]?.toUpperCase()}
                                                    </Avatar>
                                                </Box>
                                            ) : (
                                                <Avatar
                                                    src={member.user?.avatar || undefined}
                                                    sx={{ width: 48, height: 48 }}
                                                >
                                                    {fullName[0]?.toUpperCase()}
                                                </Avatar>
                                            )}

                                            <Stack spacing={0.35} minWidth={0} sx={{ flex: 1 }}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                >
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
                                                                transition: "0.2s ease",
                                                                "&:hover": {
                                                                    color: "primary.main",
                                                                    textDecoration: "underline",
                                                                },
                                                            }}
                                                        >
                                                            {fullName}
                                                        </Typography>
                                                    ) : (
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={700}
                                                            sx={{ wordBreak: "break-word" }}
                                                        >
                                                            {fullName}
                                                        </Typography>
                                                    )}

                                                    <Chip
                                                        size="small"
                                                        label={formatRole(member.role)}
                                                        variant="filled"
                                                        sx={{
                                                            bgcolor: "action.hover",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Stack>

                                                {member.user?.email ? (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ wordBreak: "break-word" }}
                                                    >
                                                        {member.user.email}
                                                    </Typography>
                                                ) : null}

                                                {member.user?.phone ? (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ wordBreak: "break-word" }}
                                                    >
                                                        {member.user.phone}
                                                    </Typography>
                                                ) : null}
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Stack>
        </Box>
    );
}