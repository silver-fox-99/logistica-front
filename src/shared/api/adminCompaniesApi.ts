import api from "@/shared/api/axios";
import type {
    AdminListCompaniesParams,
    AdminListCompaniesResponse,
    ChangeCompanyOwnerAdminPayload,
    Company,
    CompanyDocument,
    CompanyInvitation,
    CompanyJoinRequest,
    CompanyMember,
    ReviewCompanyDocumentAdminPayload,
    ReviewCompanyJoinRequestPayload,
    UpdateCompanyAdminPayload,
    UpdateCompanyMemberAdminPayload,
    UpdateCompanyStatusAdminPayload,
} from "@/entities/company/model/types";

export const adminCompaniesApi = {
    list: async (params?: AdminListCompaniesParams) => {
        const { data } = await api.get<AdminListCompaniesResponse>("/admin/companies", { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<Company>(`/admin/companies/${id}`);
        return data;
    },

    update: async (id: string, payload: UpdateCompanyAdminPayload) => {
        const { data } = await api.patch<Company>(`/admin/companies/${id}`, payload);
        return data;
    },

    updateStatus: async (id: string, payload: UpdateCompanyStatusAdminPayload) => {
        const { data } = await api.patch<Company>(`/admin/companies/${id}/status`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<{ ok: true }>(`/admin/companies/${id}`);
        return data;
    },

    listDocuments: async (companyId: string) => {
        const { data } = await api.get<CompanyDocument[]>(
            `/admin/companies/${companyId}/documents`,
        );
        return data;
    },

    reviewDocument: async (
        companyId: string,
        documentId: string,
        payload: ReviewCompanyDocumentAdminPayload,
    ) => {
        const { data } = await api.patch<CompanyDocument>(
            `/admin/companies/${companyId}/documents/${documentId}/review`,
            payload,
        );
        return data;
    },

    getDocumentFileUrl: (companyId: string, documentId: string) => {
        return `${api.defaults.baseURL}/admin/companies/${companyId}/documents/${documentId}/file`;
    },

    openDocumentFile: async (companyId: string, documentId: string) => {
        const { data } = await api.get<Blob>(
            `/admin/companies/${companyId}/documents/${documentId}/file`,
            {
                responseType: "blob",
            },
        );

        const blobUrl = window.URL.createObjectURL(data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");

        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 60_000);
    },

    listMembers: async (companyId: string) => {
        const { data } = await api.get<CompanyMember[]>(
            `/admin/companies/${companyId}/members`,
        );
        return data;
    },

    listMembersHistory: async (companyId: string) => {
        const { data } = await api.get<CompanyMember[]>(
            `/admin/companies/${companyId}/members/history`,
        );
        return data;
    },

    updateMember: async (
        companyId: string,
        memberId: string,
        payload: UpdateCompanyMemberAdminPayload,
    ) => {
        const { data } = await api.patch<CompanyMember>(
            `/admin/companies/${companyId}/members/${memberId}`,
            payload,
        );
        return data;
    },

    removeMember: async (companyId: string, memberId: string) => {
        const { data } = await api.delete<{ ok: true }>(
            `/admin/companies/${companyId}/members/${memberId}`,
        );
        return data;
    },

    makeOwner: async (
        companyId: string,
        memberId: string,
        payload?: ChangeCompanyOwnerAdminPayload,
    ) => {
        const { data } = await api.patch<{ ok: true }>(
            `/admin/companies/${companyId}/members/${memberId}/make-owner`,
            payload ?? {},
        );
        return data;
    },

    listInvitations: async (companyId: string) => {
        const { data } = await api.get<CompanyInvitation[]>(
            `/admin/companies/${companyId}/invitations`,
        );
        return data;
    },

    cancelInvitation: async (companyId: string, invitationId: string) => {
        const { data } = await api.delete<{ ok: true }>(
            `/admin/companies/${companyId}/invitations/${invitationId}`,
        );
        return data;
    },

    listJoinRequests: async (companyId: string) => {
        const { data } = await api.get<CompanyJoinRequest[]>(
            `/admin/companies/${companyId}/join-requests`,
        );
        return data;
    },

    reviewJoinRequest: async (
        companyId: string,
        requestId: string,
        payload: ReviewCompanyJoinRequestPayload,
    ) => {
        const { data } = await api.patch<{ ok: true }>(
            `/admin/companies/${companyId}/join-requests/${requestId}/review`,
            payload,
        );
        return data;
    },
};