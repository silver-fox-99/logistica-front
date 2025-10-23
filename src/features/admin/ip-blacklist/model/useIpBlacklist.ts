
import { useEffect, useState } from "react";
import {adminIpBlacklistApi, type IpBan} from "@/shared/api/adminIpBlackListApi.ts";


function useDebounced<T>(value: T, ms = 500) {
    const [v, setV] = useState(value);
    useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
    return v;
}

export function useIpBlacklist(initial = { page: 1, limit: 20 }) {
    const [items, setItems] = useState<IpBan[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [params, setParams] = useState<{ page: number; limit: number }>({ page: initial.page, limit: initial.limit });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const q = useDebounced(search, 500);
    useEffect(() => { setParams(p => ({ ...p, page: 1 })); }, [q]);

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const res = await adminIpBlacklistApi.list({ ...params, search: q || undefined });
            setItems(res.items);
            setTotal(res.total);
            setPages(res.pages);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось загрузить черный список");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [params, q]);

    return {
        items, total, pages, loading, error, params,
        setPage: (page: number) => setParams(p => ({ ...p, page })),
        setLimit: (limit: number) => setParams(p => ({ ...p, limit, page: 1 })),
        setSearch,
        refetch: load,
    };
}
