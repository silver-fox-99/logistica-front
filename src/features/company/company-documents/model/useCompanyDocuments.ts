import { useEffect, useState } from "react";
import { companyDocumentsApi } from "@/shared/api/companyDocumentsApi";
import type {
    CompanyDocument,
    CompanyDocumentType,
} from "@/entities/company/model/types";

const initialForm = {
    type: "OTHER" as CompanyDocumentType,
    title: "",
    description: "",
    file: null as File | null,
};

export function useCompanyDocuments(companyId?: string) {
    const [items, setItems] = useState<CompanyDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string>("");
    const [error, setError] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [values, setValues] = useState(initialForm);

    const load = async () => {
        if (!companyId) return;

        try {
            setIsLoading(true);
            setError("");
            const data = await companyDocumentsApi.list(companyId);
            setItems(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load documents.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [companyId]);

    const setField = (field: "type" | "title" | "description", value: string) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const setFile = (file: File | null) => {
        setValues((prev) => ({
            ...prev,
            file,
        }));
    };

    const upload = async () => {
        if (!companyId) return;
        if (!values.file) {
            setUploadError("File is required.");
            return;
        }
        if (!values.title.trim()) {
            setUploadError("Document title is required.");
            return;
        }

        try {
            setIsUploading(true);
            setUploadError("");

            const created = await companyDocumentsApi.upload(companyId, {
                type: values.type,
                title: values.title.trim(),
                description: values.description.trim(),
                file: values.file,
            });

            setItems((prev) => [created, ...prev]);
            setValues(initialForm);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to upload document.";
            setUploadError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsUploading(false);
        }
    };

    const remove = async (documentId: string) => {
        if (!companyId) return;

        try {
            setIsDeletingId(documentId);
            await companyDocumentsApi.delete(companyId, documentId);
            setItems((prev) => prev.filter((item) => item.id !== documentId));
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to delete document.";
            setUploadError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsDeletingId("");
        }
    };

    return {
        items,
        values,
        isLoading,
        isUploading,
        isDeletingId,
        error,
        uploadError,
        setField,
        setFile,
        upload,
        remove,
        reload: load,
    };
}