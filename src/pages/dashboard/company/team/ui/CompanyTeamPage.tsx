import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import { FiPlus } from "react-icons/fi";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { CompanyAccessLockedCard } from "@/widgets/company/company-details-sections/ui/CompanyAccessLockedCard";
import { useCompanyTeamPage } from "@/pages/dashboard/company/team/model/useCompanyTeamPage";
import { InviteCompanyMemberDialog } from "@/features/company/invite-member/ui/InviteCompanyMemberDialog";
import { CompanyMembersCard } from "@/widgets/company/company-team/ui/CompanyMembersCard";
import { CompanyInvitationsCard } from "@/widgets/company/company-team/ui/CompanyInvitationsCard";
import { CompanyJoinRequestsCard } from "@/widgets/company/company-team/ui/CompanyJoinRequestsCard";

export default function CompanyTeamPage() {
    const { company } = useCompanyWorkspaceContext();
    const [inviteOpen, setInviteOpen] = useState(false);

    const {
        members,
        invitations,
        joinRequests,
        isLoading,
        isSubmitting,
        error,
        success,
        inviteMember,
        updateMember,
        removeMember,
        cancelInvitation,
        approveJoinRequest,
        rejectJoinRequest,
        clearMessages,
    } = useCompanyTeamPage(company.id);

    if (company.status !== "VERIFIED") {
        return <CompanyAccessLockedCard />;
    }

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={2}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight={700}>
                        Team management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Review current members, manage invitations, and process join requests.
                    </Typography>
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<FiPlus />}
                    onClick={() => {
                        clearMessages();
                        setInviteOpen(true);
                    }}
                >
                    Invite member
                </Button>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={3}>
                    <CompanyMembersCard
                        members={members}
                        isSubmitting={isSubmitting}
                        onUpdateRole={(memberId, role) => updateMember(memberId, { role })}
                        onUpdateStatus={(memberId, status) => updateMember(memberId, { status })}
                        onRemove={removeMember}
                    />

                    <CompanyInvitationsCard
                        invitations={invitations}
                        isSubmitting={isSubmitting}
                        onCancel={cancelInvitation}
                    />

                    <CompanyJoinRequestsCard
                        requests={joinRequests}
                        isSubmitting={isSubmitting}
                        onApprove={approveJoinRequest}
                        onReject={rejectJoinRequest}
                    />
                </Stack>
            )}

            <InviteCompanyMemberDialog
                open={inviteOpen}
                isSubmitting={isSubmitting}
                onClose={() => setInviteOpen(false)}
                onSubmit={async (payload) => {
                    const ok = await inviteMember(payload);
                    if (ok) {
                        setInviteOpen(false);
                    }
                }}
            />
        </Stack>
    );
}