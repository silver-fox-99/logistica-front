import { useCallback, useEffect, useState } from "react";
import { companiesApi } from "@/shared/api/companiesApi";
import type {
    ListPublicCompaniesParams,
    PublicCompanyProfile,
} from "@/entities/company/model/types";

type UsePublicCompaniesResult = {
    items: PublicCompanyProfile[];
    total: number;
    isLoading: boolean;
    error: string;
    query: string;
    setQuery: (value: string) => void;
    reload: () => Promise<void>;
};

export function usePublicCompanies(): UsePublicCompaniesResult {
    const [items, setItems] = useState<PublicCompanyProfile[]>([]);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const params: ListPublicCompaniesParams = {
                q: query.trim() || undefined,
                limit: 50,
                offset: 0,
            };

            const data = await companiesApi.listPublic(params);
            setItems(data.items);
            setTotal(data.total);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load public companies.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    useEffect(() => {
        reload();
    }, [reload]);

    return {
        items,
        total,
        isLoading,
        error,
        query,
        setQuery,
        reload,
    };
}