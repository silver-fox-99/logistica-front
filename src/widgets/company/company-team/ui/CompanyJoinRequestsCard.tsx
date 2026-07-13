import {
    Avatar,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CompanyJoinRequest } from "@/entities/company/model/types";
import {
    getUserDisplayName,
    getUserSecondaryText,
} from "@/widgets/company/company-team/model/companyTeamUi";

type Props = {
    requests: CompanyJoinRequest[];
    isSubmitting?: boolean;
    onApprove: (requestId: string) => void;
    onReject: (requestId: string) => void;
};

export function CompanyJoinRequestsCard({
                                            requests,
                                            isSubmitting = false,
                                            onApprove,
                                            onReject,
                                        }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const roleLabel = (role?: string | null) =>
        t(`companyRoles.${role}`, {
            defaultValue: role || "",
        });

    const statusLabel = (status?: string | null) =>
        t(`companyJoinRequestStatuses.${status}`, {
            defaultValue: status || "",
        });

    const handleOpenUserProfile = (userId?: string | null) => {
        if (!userId) return;
        navigate(`/dashboard/user-reviews/${userId}`);
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider", p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            {t("companyTeam.requests.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("companyTeam.requests.description")}
                        </Typography>
                    </Stack>

                    {!requests.length ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("companyTeam.requests.empty")}
                        </Typography>
                    ) : (
                        <Stack divider={<Divider flexItem />} spacing={0}>
                            {requests.map((request) => {
                                const displayName = getUserDisplayName(request.user);
                                const secondaryText = getUserSecondaryText(request.user);
                                const requestUserId = request.user?.id;

                                return (
                                    <Stack
                                        key={request.id}
                                        spacing={2}
                                        sx={{ py: 2 }}
                                    >
                                        <Stack
                                            direction={{ xs: "column", md: "row" }}
                                            spacing={2}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", md: "center" }}
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    src={request.user?.avatar || undefined}
                                                    sx={{
                                                        cursor: requestUserId ? "pointer" : "default",
                                                    }}
                                                    onClick={() => handleOpenUserProfile(requestUserId)}
                                                >
                                                    {displayName.slice(0, 1).toUpperCase()}
                                                </Avatar>

                                                <Stack spacing={0.35}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={700}
                                                        sx={{
                                                            cursor: requestUserId ? "pointer" : "default",
                                                            "&:hover": requestUserId
                                                                ? { textDecoration: "underline" }
                                                                : undefined,
                                                        }}
                                                        onClick={() => handleOpenUserProfile(requestUserId)}
                                                    >
                                                        {displayName}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            cursor: requestUserId ? "pointer" : "default",
                                                            "&:hover": requestUserId
                                                                ? { textDecoration: "underline" }
                                                                : undefined,
                                                        }}
                                                        onClick={() => handleOpenUserProfile(requestUserId)}
                                                    >
                                                        {secondaryText}
                                                    </Typography>
                                                    {request.message ? (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {request.message}
                                                        </Typography>
                                                    ) : null}
                                                </Stack>
                                            </Stack>

                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                <Chip
                                                    label={roleLabel(request.requested_role)}
                                                    size="small"
                                                />
                                                <Chip
                                                    label={statusLabel(request.status)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Stack>

                                        <Stack
                                            direction={{ xs: "column", md: "row" }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", md: "center" }}
                                            spacing={2}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {t("companyTeam.requests.requestedAt", {
                                                    value: new Date(request.created_at).toLocaleString(),
                                                })}
                                            </Typography>

                                            {request.status === "PENDING" ? (
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => onApprove(request.id)}
                                                        disabled={isSubmitting}
                                                        sx={{ borderRadius: "8px" }}
                                                    >
                                                        {t("companyTeam.requests.approve")}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => onReject(request.id)}
                                                        disabled={isSubmitting}
                                                        sx={{ borderRadius: "8px" }}
                                                    >
                                                        {t("companyTeam.requests.reject")}
                                                    </Button>
                                                </Stack>
                                            ) : null}
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
        </Paper>
    );
}