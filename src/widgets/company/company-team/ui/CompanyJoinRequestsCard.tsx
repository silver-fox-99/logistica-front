import {
    Avatar,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import type { CompanyJoinRequest } from "@/entities/company/model/types";
import {
    companyJoinRequestStatusLabelMap,
    companyRoleLabelMap,
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
    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            Join requests
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Review users who want to join the company.
                        </Typography>
                    </Stack>

                    {!requests.length ? (
                        <Typography variant="body2" color="text.secondary">
                            No join requests found.
                        </Typography>
                    ) : (
                        <Stack divider={<Divider flexItem />} spacing={0}>
                            {requests.map((request) => {
                                const displayName = getUserDisplayName(request.user);
                                const secondaryText = getUserSecondaryText(request.user);

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
                                                <Avatar src={request.user?.avatar || undefined}>
                                                    {displayName.slice(0, 1).toUpperCase()}
                                                </Avatar>

                                                <Stack spacing={0.35}>
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {displayName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
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
                                                    label={companyRoleLabelMap[request.requested_role]}
                                                    size="small"
                                                />
                                                <Chip
                                                    label={companyJoinRequestStatusLabelMap[request.status]}
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
                                                Requested at {new Date(request.created_at).toLocaleString()}
                                            </Typography>

                                            {request.status === "PENDING" ? (
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => onApprove(request.id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => onReject(request.id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        Reject
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
            </CardContent>
        </Card>
    );
}