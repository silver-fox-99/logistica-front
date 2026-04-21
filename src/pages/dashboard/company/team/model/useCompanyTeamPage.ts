import { useCallback, useEffect, useState } from "react";
import { companiesApi } from "@/shared/api/companiesApi";
import type {
    CompanyInvitation,
    CompanyJoinRequest,
    CompanyMember,
    CompanyMemberRole,
    CompanyMemberStatus,
    CreateCompanyInvitationPayload,
} from "@/entities/company/model/types";

type UseCompanyTeamPageResult = {
    members: CompanyMember[];
    membersHistory: CompanyMember[];
    invitations: CompanyInvitation[];
    joinRequests: CompanyJoinRequest[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string;
    success: string;
    reload: () => Promise<void>;
    inviteMember: (payload: CreateCompanyInvitationPayload) => Promise<boolean>;
    updateMember: (
        memberId: string,
        payload: {
            role?: CompanyMemberRole;
            status?: CompanyMemberStatus;
            is_default?: boolean;
            permissions?: Record<string, boolean>;
        },
    ) => Promise<boolean>;
    removeMember: (memberId: string) => Promise<boolean>;
    cancelInvitation: (invitationId: string) => Promise<boolean>;
    approveJoinRequest: (requestId: string) => Promise<boolean>;
    rejectJoinRequest: (requestId: string) => Promise<boolean>;
    clearMessages: () => void;
};

export function useCompanyTeamPage(companyId: string): UseCompanyTeamPageResult {
    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [membersHistory, setMembersHistory] = useState<CompanyMember[]>([]);
    const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
    const [joinRequests, setJoinRequests] = useState<CompanyJoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const reload = useCallback(async () => {
        if (!companyId) return;

        try {
            setIsLoading(true);
            setError("");

            const [membersData, membersHistoryData, invitationsData, joinRequestsData] = await Promise.all([
                companiesApi.listMembers(companyId),
                companiesApi.listMembersHistory(companyId),
                companiesApi.listInvitations(companyId),
                companiesApi.listJoinRequests(companyId),
            ]);

            setMembers(membersData);
            setMembersHistory(membersHistoryData);
            setInvitations(invitationsData);
            setJoinRequests(joinRequestsData);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load company team data.";

            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const inviteMember = async (payload: CreateCompanyInvitationPayload) => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.createInvitation(companyId, payload);
            setSuccess("Invitation sent successfully.");
            await reload();
            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to create invitation.";
            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateMember = async (
        memberId: string,
        payload: {
            role?: CompanyMemberRole;
            status?: CompanyMemberStatus;
            is_default?: boolean;
            permissions?: Record<string, boolean>;
        },
    ) => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.updateMember(companyId, memberId, payload);
            setSuccess("Member updated successfully.");
            await reload();
            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to update member.";
            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeMember = async (memberId: string) => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.removeMember(companyId, memberId);
            setSuccess("Member removed successfully.");
            await reload();
            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to remove member.";
            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelInvitation = async (invitationId: string) => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.cancelInvitation(companyId, invitationId);
            setSuccess("Invitation canceled successfully.");
            await reload();
            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to cancel invitation.";
            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const approveJoinRequest = async (requestId: string) => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.reviewJoinRequest(companyId, requestId, {
                status: "APPROVED",
            });
            setSuccess("Join request approved.");
            await reload();
            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to approve join request.";
            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const rejectJoinRequest = async (requestId: string) => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.reviewJoinRequest(companyId, requestId, {
                status: "REJECTED",
            });
            setSuccess("Join request rejected.");
            await reload();
            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to reject join request.";
            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        members,
        membersHistory,
        invitations,
        joinRequests,
        isLoading,
        isSubmitting,
        error,
        success,
        reload,
        inviteMember,
        updateMember,
        removeMember,
        cancelInvitation,
        approveJoinRequest,
        rejectJoinRequest,
        clearMessages,
    };
}