import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { CompanyAccessLockedCard } from "@/widgets/company/company-details-sections/ui/CompanyAccessLockedCard";
import { useCompanyTeamPage } from "@/pages/dashboard/company/team/model/useCompanyTeamPage";
import { InviteCompanyMemberDialog } from "@/features/company/invite-member/ui/InviteCompanyMemberDialog";
import { CompanyMembersCard } from "@/widgets/company/company-team/ui/CompanyMembersCard";
import { CompanyMembersHistoryCard } from "@/widgets/company/company-team/ui/CompanyMembersHistoryCard";
import { CompanyInvitationsCard } from "@/widgets/company/company-team/ui/CompanyInvitationsCard";
import { CompanyJoinRequestsCard } from "@/widgets/company/company-team/ui/CompanyJoinRequestsCard";

type TeamTab = "active" | "history" | "invitations" | "requests";

export default function CompanyTeamPage() {
    const { t } = useTranslation();
    const { company } = useCompanyWorkspaceContext();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [tab, setTab] = useState<TeamTab>("active");

    const {
        members,
        membersHistory,
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

    const activeCount = members.length;
    const historyCount = membersHistory.length;
    const invitationsCount = invitations.length;
    const requestsCount = joinRequests.length;

    const content = useMemo(() => {
        switch (tab) {
            case "history":
                return <CompanyMembersHistoryCard members={membersHistory} />;

            case "invitations":
                return (
                    <CompanyInvitationsCard
                        invitations={invitations}
                        isSubmitting={isSubmitting}
                        onCancel={cancelInvitation}
                    />
                );

            case "requests":
                return (
                    <CompanyJoinRequestsCard
                        requests={joinRequests}
                        isSubmitting={isSubmitting}
                        onApprove={approveJoinRequest}
                        onReject={rejectJoinRequest}
                    />
                );

            case "active":
            default:
                return (
                    <CompanyMembersCard
                        members={members}
                        isSubmitting={isSubmitting}
                        onUpdateRole={(memberId, role) => updateMember(memberId, { role })}
                        onUpdateStatus={(memberId, status) => updateMember(memberId, { status })}
                        onRemove={removeMember}
                    />
                );
        }
    }, [
        tab,
        members,
        membersHistory,
        invitations,
        joinRequests,
        isSubmitting,
        updateMember,
        removeMember,
        cancelInvitation,
        approveJoinRequest,
        rejectJoinRequest,
    ]);

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
                        {t("companyTeam.page.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("companyTeam.page.description")}
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
                    {t("companyTeam.page.inviteMember")}
                </Button>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: "0 !important" }}>
                    <Tabs
                        value={tab}
                        onChange={(_, value) => setTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab value="active" label={t("companyTeam.tabs.active", { count: activeCount })} />
                        <Tab value="history" label={t("companyTeam.tabs.history", { count: historyCount })} />
                        <Tab value="invitations" label={t("companyTeam.tabs.invitations", { count: invitationsCount })} />
                        <Tab value="requests" label={t("companyTeam.tabs.requests", { count: requestsCount })} />
                    </Tabs>
                </CardContent>
            </Card>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                content
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