import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { companiesApi } from "@/shared/api/companiesApi";

export function useDeleteCompany(companyId?: string) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (!companyId) return;

        try {
            setIsSubmitting(true);
            setError("");
            await companiesApi.deleteMy(companyId);
            navigate("/dashboard/company");
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to delete company.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        submit,
        isSubmitting,
        error,
    };
}