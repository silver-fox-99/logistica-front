import { useState } from "react";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { Company, CompanyStatus } from "@/entities/company/model/types";

export function useAdminUpdateCompanyStatus(company: Company | null, onUpdated?: (company: Company) => void) {
    const [status, setStatus] = useState<CompanyStatus>(company?.status ?? "UNVERIFIED");
    const [verificationComment, setVerificationComment] = useState(company?.verification_comment ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const submit = async () => {
        if (!company?.id) return;

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            const updated = await adminCompaniesApi.updateStatus(company.id, {
                status,
                verification_comment: verificationComment.trim() || null,
            });

            setSuccess("Статус компании обновлён");
            onUpdated?.(updated);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to update company status.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        status,
        setStatus,
        verificationComment,
        setVerificationComment,
        submit,
        isSubmitting,
        error,
        success,
    };
}