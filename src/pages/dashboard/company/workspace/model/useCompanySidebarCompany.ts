import { useCallback, useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { companiesApi } from "@/shared/api/companiesApi";
import type { Company } from "@/entities/company/model/types";

function extractCompanyId(pathname: string) {
    const match =
        matchPath("/dashboard/company/:id/*", pathname) ||
        matchPath("/dashboard/company/:id", pathname);

    return match?.params?.id ?? "";
}

export function useCompanySidebarCompany() {
    const location = useLocation();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const companyId = extractCompanyId(location.pathname);

    const loadCompany = useCallback(async () => {
        if (!companyId) {
            setCompany(null);
            return;
        }

        try {
            setIsLoading(true);
            const data = await companiesApi.getMyById(companyId);
            setCompany(data);
        } catch {
            setCompany(null);
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    return {
        company,
        isLoading,
        companyId,
    };
}