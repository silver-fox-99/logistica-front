import api from "@/shared/api/axios";
import type {
    CompanyDocument,
    UploadCompanyDocumentPayload,
} from "@/entities/company/model/types";

export const companyDocumentsApi = {
    list: async (companyId: string) => {
        const { data } = await api.get<CompanyDocument[]>(`/companies/me/${companyId}/documents`);
        return data;
    },

    upload: async (companyId: string, payload: UploadCompanyDocumentPayload) => {
        const formData = new FormData();
        formData.append("type", payload.type);
        formData.append("title", payload.title);
        if (payload.description) {
            formData.append("description", payload.description);
        }
        formData.append("file", payload.file);

        const { data } = await api.post<CompanyDocument>(
            `/companies/me/${companyId}/documents`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return data;
    },

    delete: async (companyId: string, documentId: string) => {
        const { data } = await api.delete<{ ok: true }>(
            `/companies/me/${companyId}/documents/${documentId}`,
        );
        return data;
    },
};