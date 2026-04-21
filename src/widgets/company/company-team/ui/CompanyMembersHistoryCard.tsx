import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CompanyMember } from "@/entities/company/model/types";
import {
    getUserDisplayName,
    getUserSecondaryText,
} from "@/widgets/company/company-team/model/companyTeamUi";

type Props = {
    members: CompanyMember[];
};

const formatDateTime = (value?: string | null, fallback = "—") => {
    if (!value) return fallback;
    return new Date(value).toLocaleString();
};

export function CompanyMembersHistoryCard({ members }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const roleLabel = (role?: string | null) =>
        t(`companyRoles.${role}`, {
            defaultValue: role || "",
        });

    const statusLabel = (status?: string | null) =>
        t(`companyMemberStatuses.${status}`, {
            defaultValue: status || "",
        });

    const handleOpenUserProfile = (userId?: string | null) => {
        if (!userId) return;
        navigate(`/dashboard/user-reviews/${userId}`);
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            {t("companyTeam.history.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("companyTeam.history.description")}
                        </Typography>
                    </Stack>

                    {!members.length ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("companyTeam.history.empty")}
                        </Typography>
                    ) : (
                        <Stack spacing={1.5}>
                            {members.map((member) => {
                                const displayName = getUserDisplayName(member.user);
                                const secondaryText = getUserSecondaryText(member.user);
                                const memberUserId = member.user?.id;
                                const invitedByUserId = member.invited_by_user?.id;

                                return (
                                    <Box
                                        key={member.id}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            bgcolor: "grey.50",
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.5}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar
                                                        src={member.user?.avatar || undefined}
                                                        sx={{
                                                            cursor: memberUserId ? "pointer" : "default",
                                                        }}
                                                        onClick={() => handleOpenUserProfile(memberUserId)}
                                                    >
                                                        {displayName.slice(0, 1).toUpperCase()}
                                                    </Avatar>

                                                    <Stack spacing={0.25}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={700}
                                                            sx={{
                                                                cursor: memberUserId ? "pointer" : "default",
                                                                "&:hover": memberUserId
                                                                    ? { textDecoration: "underline" }
                                                                    : undefined,
                                                            }}
                                                            onClick={() => handleOpenUserProfile(memberUserId)}
                                                        >
                                                            {displayName}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                cursor: memberUserId ? "pointer" : "default",
                                                                "&:hover": memberUserId
                                                                    ? { textDecoration: "underline" }
                                                                    : undefined,
                                                            }}
                                                            onClick={() => handleOpenUserProfile(memberUserId)}
                                                        >
                                                            {secondaryText}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>

                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    <Chip
                                                        label={roleLabel(member.role)}
                                                        size="small"
                                                    />
                                                    <Chip
                                                        label={statusLabel(member.status)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Stack>
                                            </Stack>

                                            <Stack
                                                direction={{ xs: "column", md: "row" }}
                                                spacing={2}
                                            >
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t("companyTeam.history.invitedAt")}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDateTime(member.invited_at, t("companyTeam.history.emptyDate"))}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t("companyTeam.history.joinedAt")}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDateTime(member.joined_at, t("companyTeam.history.emptyDate"))}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t("companyTeam.history.removedAt")}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDateTime(member.removed_at, t("companyTeam.history.emptyDate"))}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {member.invited_by_user ? (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        cursor: invitedByUserId ? "pointer" : "default",
                                                        "&:hover": invitedByUserId
                                                            ? { textDecoration: "underline" }
                                                            : undefined,
                                                    }}
                                                    onClick={() => handleOpenUserProfile(invitedByUserId)}
                                                >
                                                    {t("companyTeam.history.invitedBy", {
                                                        name: getUserDisplayName(member.invited_by_user),
                                                    })}
                                                </Typography>
                                            ) : null}
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}