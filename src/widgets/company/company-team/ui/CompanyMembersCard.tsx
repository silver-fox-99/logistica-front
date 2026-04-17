import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type {
    CompanyMember,
    CompanyMemberRole,
    CompanyMemberStatus,
} from "@/entities/company/model/types";
import {
    companyMemberStatusLabelMap,
    companyRoleLabelMap,
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
    const [permissionsRole, setPermissionsRole] = useState<CompanyMemberRole | null>(null);

    return (
        <>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={3}>
                        <Stack spacing={0.5}>
                            <Typography variant="h6" fontWeight={700}>
                                Members
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage roles, statuses, and access for your company members.
                            </Typography>
                        </Stack>

                        {!members.length ? (
                            <Typography variant="body2" color="text.secondary">
                                No members found.
                            </Typography>
                        ) : (
                            <Stack spacing={2.5}>
                                {members.map((member, index) => {
                                    const displayName = getUserDisplayName(member.user);
                                    const secondaryText = getUserSecondaryText(member.user);

                                    return (
                                        <Box key={member.id}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: { xs: 2, md: 2.5 },
                                                    borderRadius: 3,
                                                    bgcolor: "background.paper",
                                                }}
                                            >
                                                <Stack spacing={2.5}>
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
                                                                sx={{ width: 48, height: 48, flexShrink: 0 }}
                                                            >
                                                                {displayName.slice(0, 1).toUpperCase()}
                                                            </Avatar>

                                                            <Stack spacing={0.4} sx={{ minWidth: 0 }}>
                                                                <Typography
                                                                    variant="subtitle1"
                                                                    fontWeight={700}
                                                                    sx={{
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap",
                                                                    }}
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
                                                                    }}
                                                                >
                                                                    {secondaryText}
                                                                </Typography>

                                                                {member.invited_by_user ? (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Invited by {getUserDisplayName(member.invited_by_user)}
                                                                    </Typography>
                                                                ) : null}
                                                            </Stack>
                                                        </Stack>

                                                        <Stack
                                                            direction={{ xs: "column", sm: "row" }}
                                                            spacing={1.25}
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
                                                                    label={companyRoleLabelMap[member.role]}
                                                                    size="small"
                                                                />
                                                                <Chip
                                                                    label={companyMemberStatusLabelMap[member.status]}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                                {member.is_default ? (
                                                                    <Chip
                                                                        label="Default"
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
                                                                sx={{
                                                                    minWidth: { sm: 120 },
                                                                    alignSelf: { xs: "stretch", sm: "center" },
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Stack>
                                                    </Stack>

                                                    <Stack
                                                        direction={{ xs: "column", md: "row" }}
                                                        spacing={2}
                                                        alignItems="stretch"
                                                    >
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1.5,
                                                                borderRadius: 3,
                                                                flex: 1,
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <Stack spacing={1.25}>
                                                                <Stack
                                                                    direction="row"
                                                                    justifyContent="space-between"
                                                                    alignItems="center"
                                                                    spacing={1}
                                                                >
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight={600}
                                                                    >
                                                                        Role
                                                                    </Typography>

                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        onClick={() => setPermissionsRole(member.role)}
                                                                        sx={{ minWidth: 0, px: 0.5 }}
                                                                    >
                                                                        View permissions
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
                                                                            {companyRoleLabelMap[role]}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            </Stack>
                                                        </Paper>

                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1.5,
                                                                borderRadius: 3,
                                                                flex: 1,
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <Stack spacing={1.25}>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    Status
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
                                                                            {companyMemberStatusLabelMap[status]}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            </Stack>
                                                        </Paper>
                                                    </Stack>
                                                </Stack>
                                            </Paper>

                                            {index < members.length - 1 ? null : null}
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