import api from "@/shared/api/axios";
import type {
    Company,
    CompanyDocument,
    CompanyInvitation, CompanyInvitationPreview,
    CompanyJoinRequest,
    CompanyMember, CompanyMembershipHistoryItem,
    CreateCompanyInvitationPayload,
    CreateCompanyJoinRequestPayload,
    CreateCompanyPayload,
    ListMyCompaniesParams,
    ListMyCompaniesResponse, ListPublicCompaniesParams, ListPublicCompaniesResponse, PublicCompanyProfile,
    ReviewCompanyJoinRequestPayload,
    UpdateCompanyMemberPayload,
    UpdateCompanyPayload,
} from "@/entities/company/model/types";

export const companiesApi = {
    listMy: async (params?: ListMyCompaniesParams) => {
        const { data } = await api.get<ListMyCompaniesResponse>("/companies/me", { params });
        return data;
    },

    getMyById: async (id: string) => {
        const { data } = await api.get<Company>(`/companies/me/${id}`);
        return data;
    },

    create: async (payload: CreateCompanyPayload) => {
        const { data } = await api.post<Company>("/companies/me", payload);
        return data;
    },

    updateMy: async (id: string, payload: UpdateCompanyPayload) => {
        const { data } = await api.patch<Company>(`/companies/me/${id}`, payload);
        return data;
    },

    deleteMy: async (id: string) => {
        const { data } = await api.delete<{ ok: true }>(`/companies/me/${id}`);
        return data;
    },

    listMembers: async (companyId: string) => {
        const { data } = await api.get<CompanyMember[]>(`/companies/me/${companyId}/members`);
        return data;
    },

    updateMember: async (
        companyId: string,
        memberId: string,
        payload: UpdateCompanyMemberPayload,
    ) => {
        const { data } = await api.patch<CompanyMember>(
            `/companies/me/${companyId}/members/${memberId}`,
            payload,
        );
        return data;
    },

    removeMember: async (companyId: string, memberId: string) => {
        const { data } = await api.delete<{ ok: true }>(
            `/companies/me/${companyId}/members/${memberId}`,
        );
        return data;
    },

    listInvitations: async (companyId: string) => {
        const { data } = await api.get<CompanyInvitation[]>(
            `/companies/me/${companyId}/invitations`,
        );
        return data;
    },

    createInvitation: async (
        companyId: string,
        payload: CreateCompanyInvitationPayload,
    ) => {
        const { data } = await api.post<CompanyInvitation>(
            `/companies/me/${companyId}/invitations`,
            payload,
        );
        return data;
    },

    cancelInvitation: async (companyId: string, invitationId: string) => {
        const { data } = await api.delete<CompanyInvitation>(
            `/companies/me/${companyId}/invitations/${invitationId}`,
        );
        return data;
    },

    acceptInvitation: async (token: string) => {
        const { data } = await api.post<{ ok: true }>(
            `/companies/invitations/${token}/accept`,
        );
        return data;
    },

    declineInvitation: async (token: string) => {
        const { data } = await api.post<{ ok: true }>(
            `/companies/invitations/${token}/decline`,
        );
        return data;
    },

    listJoinRequests: async (companyId: string) => {
        const { data } = await api.get<CompanyJoinRequest[]>(
            `/companies/me/${companyId}/join-requests`,
        );
        return data;
    },

    createJoinRequest: async (
        companyId: string,
        payload: CreateCompanyJoinRequestPayload,
    ) => {
        const { data } = await api.post<CompanyJoinRequest>(
            `/companies/${companyId}/join-requests`,
            payload,
        );
        return data;
    },

    reviewJoinRequest: async (
        companyId: string,
        requestId: string,
        payload: ReviewCompanyJoinRequestPayload,
    ) => {
        const { data } = await api.post<{ ok: true }>(
            `/companies/me/${companyId}/join-requests/${requestId}/review`,
            payload,
        );
        return data;
    },

    listDocuments: async (companyId: string) => {
        const { data } = await api.get<CompanyDocument[]>(
            `/companies/me/${companyId}/documents`,
        );
        return data;
    },

    getPublicById: async (id: string) => {
        const { data } = await api.get<PublicCompanyProfile>(`/companies/public/${id}`);
        return data;
    },

    listPublic: async (params?: ListPublicCompaniesParams) => {
        const { data } = await api.get<ListPublicCompaniesResponse>("/companies/public", { params });
        return data;
    },

    getInvitationByToken: async (token: string) => {
        const { data } = await api.get<CompanyInvitationPreview>(`/companies/invitations/${token}`);
        return data;
    },

    buildInvitationLink: (token: string) => {
        return `${window.location.origin}/dashboard/invitations/${token}`;
    },

    listMembersHistory: async (companyId: string) => {
        const { data } = await api.get<CompanyMember[]>(
            `/companies/me/${companyId}/members/history`,
        );
        return data;
    },

    getUserMembershipHistory: async (userId: string) => {
        const { data } = await api.get<CompanyMembershipHistoryItem[]>(
            `/companies/profile-memberships/${userId}`,
        );
        return data;
    },
};