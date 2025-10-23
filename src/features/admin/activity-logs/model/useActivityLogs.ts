import { useEffect, useMemo, useState } from "react";
import { adminActivityApi, type ActivityItem, type ActivityQuery } from "@/shared/api/adminActivityApi";

function useDebounced<T>(value: T, ms = 500) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}

export type ActivityFilters = {
    search: string;
    method: string;
    endpoint: string;
    statusCode?: number | "";
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    includeAnonymous: boolean;
};

export function useActivityLogs(initial = { page: 1, limit: 10 }) {
    const [items, setItems]   = useState<ActivityItem[]>([]);
    const [total, setTotal]   = useState(0);
    const [pages, setPages]   = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string | null>(null);

    const [page, setPage]     = useState(initial.page);
    const [limit, setLimit]   = useState(initial.limit);

    const [filters, setFilters] = useState<ActivityFilters>({
        search: "", method: "", endpoint: "",
        statusCode: "", dateFrom: "", dateTo: "",
        userId: "", includeAnonymous: true,
    });

    const qSearch = useDebounced(filters.search, 400);
    const qEP     = useDebounced(filters.endpoint, 400);
    const qMethod = filters.method;
    const qStatus = filters.statusCode;
    const qFrom   = filters.dateFrom;
    const qTo     = filters.dateTo;
    const qUserId = filters.userId;
    const qAnon   = filters.includeAnonymous;

    useEffect(() => { setPage(1); }, [qSearch, qEP, qMethod, qStatus, qFrom, qTo, qUserId, qAnon]);

    // ★ фикс: явно типизируем includeAnonymous как union "true" | "false"
    const includeAnonymousLit: "true" | "false" = qAnon ? "true" : "false";

    // ★ ещё фикс: дайте useMemo знать, что мы формируем ActivityQuery
    const params: ActivityQuery = useMemo(() => ({
        search: qSearch || undefined,
        method: qMethod || undefined,
        endpoint: qEP || undefined,
        statusCode: typeof qStatus === "number" ? qStatus : undefined,
        dateFrom: qFrom || undefined,
        dateTo: qTo || undefined,
        userId: qUserId || undefined,
        includeAnonymous: includeAnonymousLit, // ★ теперь это union, не string
        page,
        limit,
    }), [qSearch, qMethod, qEP, qStatus, qFrom, qTo, qUserId, includeAnonymousLit, page, limit]);

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const res = await adminActivityApi.list(params);
            setItems(res.data);
            setTotal(res.total);
            setPages(res.pages ?? Math.max(1, Math.ceil(res.total / limit)));
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось загрузить логи активности");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [params]);

    return {
        items, total, pages, loading, error,
        page, setPage,
        limit, setLimit,
        filters, setFilters,
        refetch: load,
    };
}
