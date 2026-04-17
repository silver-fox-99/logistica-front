import api from "@/shared/api/axios";
import type {
    AdminListCompaniesParams,
    AdminListCompaniesResponse,
    Company,
    CompanyDocument,
    ReviewCompanyDocumentAdminPayload,
    UpdateCompanyAdminPayload,
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
        const { data } = await api.get<CompanyDocument[]>(`/admin/companies/${companyId}/documents`);
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

    getDocumentFileUrl: (companyId: string, documentId: string) =>
        `/admin/companies/${companyId}/documents/${documentId}/file`,
};