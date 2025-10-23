import { useEffect, useState } from "react";
import { adminUsersApi, type AdminUser, type AdminUsersQuery } from "@/shared/api/adminUsersApi";

function useDebounced<T>(value: T, ms = 500) {
    const [v, setV] = useState(value);
    useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
    return v;
}

export function useAdminUsers(initial: AdminUsersQuery = { page: 1, limit: 20, sort: "created_at", dir: "desc" }) {
    const [params, setParams] = useState<AdminUsersQuery>(initial);
    const [search, setSearch] = useState<string>("");
    const debouncedSearch = useDebounced(search, 500);

    const [items, setItems] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => { setParams(p => ({ ...p, page: 1 })); }, [debouncedSearch]);

    useEffect(() => {
        let aborted = false;
        const run = async () => {
            setLoading(true); setError(null);
            try {
                const res = await adminUsersApi.list({ ...params, search: debouncedSearch || undefined });
                if (aborted) return;
                setItems(res.items);
                setTotal(res.total);
                setPages(res.pages);
            } catch (e: any) {
                if (!aborted) setError(e?.response?.data?.message ?? "Не удалось загрузить пользователей");
            } finally {
                if (!aborted) setLoading(false);
            }
        };
        run();
        return () => { aborted = true; };
    }, [params, debouncedSearch]);

    return {
        items, total, pages, loading, error,
        params,
        setSearch,
        setPage: (page: number) => setParams(p => ({ ...p, page })),
        setLimit: (limit: number) => setParams(p => ({ ...p, limit, page: 1 })),
        setSort: (sort: NonNullable<AdminUsersQuery["sort"]>, dir: NonNullable<AdminUsersQuery["dir"]>) =>
            setParams(p => ({ ...p, sort, dir })),
    };
}
