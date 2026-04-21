import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type {
    CompanyMember,
    CompanyMemberRole,
    CompanyMemberStatus,
} from "@/entities/company/model/types";
import {
    getUserDisplayName,
    getUserSecondaryText,
} from "@/widgets/company/company-team/model/companyTeamUi";
import { CompanyRolePermissionsDialog } from "@/features/company/role-permissions-hint/ui/CompanyRolePermissionsDialog";

type Props = {
    members: CompanyMember[];
    isSubmitting?: boolean;
    onUpdateRole: (memberId: string, role: CompanyMemberRole) => void;
    onUpdateStatus: (memberId: string, status: CompanyMemberStatus) => void;
    onRemove: (memberId: string) => void;
};

const roleOptions: CompanyMemberRole[] = ["OWNER", "ADMIN", "MANAGER", "LOGIST", "VIEWER"];
const statusOptions: CompanyMemberStatus[] = ["ACTIVE", "BLOCKED", "REMOVED"];

export function CompanyMembersCard({
                                       members,
                                       isSubmitting = false,
                                       onUpdateRole,
                                       onUpdateStatus,
                                       onRemove,
                                   }: Props) {
    const { t } = useTranslation();
    const [permissionsRole, setPermissionsRole] = useState<CompanyMemberRole | null>(null);
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
        <>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={2.5}>
                        <Stack spacing={0.5}>
                            <Typography variant="h6" fontWeight={700}>
                                {t("companyTeam.members.title")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("companyTeam.members.description")}
                            </Typography>
                        </Stack>

                        {!members.length ? (
                            <Typography variant="body2" color="text.secondary">
                                {t("companyTeam.members.empty")}
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
                                            <Stack spacing={2}>
                                                <Stack
                                                    direction={{ xs: "column", lg: "row" }}
                                                    spacing={2}
                                                    justifyContent="space-between"
                                                    alignItems={{ xs: "flex-start", lg: "center" }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1.5}
                                                        alignItems="center"
                                                        sx={{ minWidth: 0 }}
                                                    >
                                                        <Avatar
                                                            src={member.user?.avatar || undefined}
                                                            sx={{
                                                                width: 48,
                                                                height: 48,
                                                                flexShrink: 0,
                                                                cursor: memberUserId ? "pointer" : "default",
                                                            }}
                                                            onClick={() => handleOpenUserProfile(memberUserId)}
                                                        >
                                                            {displayName.slice(0, 1).toUpperCase()}
                                                        </Avatar>

                                                        <Stack spacing={0.3} sx={{ minWidth: 0 }}>
                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight={700}
                                                                sx={{
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
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
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                    cursor: memberUserId ? "pointer" : "default",
                                                                    "&:hover": memberUserId
                                                                        ? { textDecoration: "underline" }
                                                                        : undefined,
                                                                }}
                                                                onClick={() => handleOpenUserProfile(memberUserId)}
                                                            >
                                                                {secondaryText}
                                                            </Typography>

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
                                                                    {t("companyTeam.members.invitedBy", {
                                                                        name: getUserDisplayName(member.invited_by_user),
                                                                    })}
                                                                </Typography>
                                                            ) : null}
                                                        </Stack>
                                                    </Stack>

                                                    <Stack
                                                        direction={{ xs: "column", sm: "row" }}
                                                        spacing={1}
                                                        alignItems={{ xs: "stretch", sm: "center" }}
                                                        sx={{ width: { xs: "100%", lg: "auto" } }}
                                                    >
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            flexWrap="wrap"
                                                            useFlexGap
                                                        >
                                                            <Chip
                                                                label={roleLabel(member.role)}
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={statusLabel(member.status)}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            {member.is_default ? (
                                                                <Chip
                                                                    label={t("companyTeam.members.default")}
                                                                    size="small"
                                                                    color="primary"
                                                                />
                                                            ) : null}
                                                        </Stack>

                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => onRemove(member.id)}
                                                            disabled={isSubmitting || member.role === "OWNER"}
                                                            sx={{ minWidth: { sm: 120 } }}
                                                        >
                                                            {t("companyTeam.members.remove")}
                                                        </Button>
                                                    </Stack>
                                                </Stack>

                                                <Stack
                                                    direction={{ xs: "column", md: "row" }}
                                                    spacing={1.5}
                                                >
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            p: 1.5,
                                                            borderRadius: 2.5,
                                                            bgcolor: "background.paper",
                                                        }}
                                                    >
                                                        <Stack spacing={1}>
                                                            <Stack
                                                                direction="row"
                                                                justifyContent="space-between"
                                                                alignItems="center"
                                                            >
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {t("companyTeam.members.role")}
                                                                </Typography>
                                                                <Button
                                                                    variant="text"
                                                                    size="small"
                                                                    onClick={() => setPermissionsRole(member.role)}
                                                                    sx={{ minWidth: 0, px: 0.5 }}
                                                                >
                                                                    {t("companyTeam.members.viewPermissions")}
                                                                </Button>
                                                            </Stack>

                                                            <TextField
                                                                select
                                                                value={member.role}
                                                                onChange={(e) =>
                                                                    onUpdateRole(
                                                                        member.id,
                                                                        e.target.value as CompanyMemberRole,
                                                                    )
                                                                }
                                                                fullWidth
                                                                disabled={isSubmitting}
                                                                size="small"
                                                            >
                                                                {roleOptions.map((role) => (
                                                                    <MenuItem key={role} value={role}>
                                                                        {roleLabel(role)}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </Stack>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            p: 1.5,
                                                            borderRadius: 2.5,
                                                            bgcolor: "background.paper",
                                                        }}
                                                    >
                                                        <Stack spacing={1}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {t("companyTeam.members.status")}
                                                            </Typography>

                                                            <TextField
                                                                select
                                                                value={member.status}
                                                                onChange={(e) =>
                                                                    onUpdateStatus(
                                                                        member.id,
                                                                        e.target.value as CompanyMemberStatus,
                                                                    )
                                                                }
                                                                fullWidth
                                                                disabled={isSubmitting || member.role === "OWNER"}
                                                                size="small"
                                                            >
                                                                {statusOptions.map((status) => (
                                                                    <MenuItem key={status} value={status}>
                                                                        {statusLabel(status)}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <CompanyRolePermissionsDialog
                open={Boolean(permissionsRole)}
                role={permissionsRole}
                onClose={() => setPermissionsRole(null)}
            />
        </>
    );
}