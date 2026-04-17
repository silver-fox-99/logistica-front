import { useCallback, useEffect, useState } from "react";
import { companiesApi } from "@/shared/api/companiesApi";
import type { PublicCompanyProfile } from "@/entities/company/model/types";

type UsePublicCompanyResult = {
    company: PublicCompanyProfile | null;
    isLoading: boolean;
    error: string;
    reload: () => Promise<void>;
};

export function usePublicCompany(id: string): UsePublicCompanyResult {
    const [company, setCompany] = useState<PublicCompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError("");

            const data = await companiesApi.getPublicById(id);
            setCompany(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load company profile.";

            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        reload();
    }, [reload]);

    return {
        company,
        isLoading,
        error,
        reload,
    };
}