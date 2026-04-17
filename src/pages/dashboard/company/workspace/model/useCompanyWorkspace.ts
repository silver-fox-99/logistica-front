import React, { useCallback, useEffect, useState } from "react";
import { companiesApi } from "@/shared/api/companiesApi";
import type { Company } from "@/entities/company/model/types";

type UseCompanyWorkspaceResult = {
    company: Company | null;
    isLoading: boolean;
    error: string;
    reload: () => Promise<void>;
    setCompany: React.Dispatch<React.SetStateAction<Company | null>>;
};

export function useCompanyWorkspace(id: string): UseCompanyWorkspaceResult {
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError("");

            const data = await companiesApi.getMyById(id);
            setCompany(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load company.";

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
        setCompany,
    };
}