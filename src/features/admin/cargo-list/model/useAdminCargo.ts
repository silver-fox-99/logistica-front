import { useEffect, useState } from "react";
import {
    adminCargoApi,
    type CargoAdminStatus,
    type CargoItem,
} from "@/shared/api/adminCargoApi.ts";

function useDebounced<T>(value: T, ms = 500) {
    const [v, setV] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);

    return v;
}

type UseAdminCargoParams = {
    page: number;
    limit: number;
    status?: CargoAdminStatus;
};

export function useAdminCargo(initial: UseAdminCargoParams = { page: 1, limit: 20, status: "all" }) {
    const [items, setItems] = useState<CargoItem[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [params, setParams] = useState<{
        page: number;
        limit: number;
        status: CargoAdminStatus;
    }>({
        page: initial.page,
        limit: initial.limit,
        status: initial.status ?? "all",
    });

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const q = useDebounced(search, 500);

    useEffect(() => {
        setParams((p) => ({ ...p, page: 1 }));
    }, [q]);

    useEffect(() => {
        let aborted = false;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await adminCargoApi.list({
                    ...params,
                    search: q || undefined,
                });

                if (aborted) return;

                setItems(res.data);
                setTotal(res.total);
                setPages(res.pages);
            } catch (e: any) {
                if (!aborted) {
                    setError(e?.response?.data?.message ?? "Не удалось загрузить грузы");
                }
            } finally {
                if (!aborted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            aborted = true;
        };
    }, [params, q]);

    return {
        items,
        total,
        pages,
        loading,
        error,
        params,

        setPage: (page: number) => setParams((p) => ({ ...p, page })),
        setLimit: (limit: number) => setParams((p) => ({ ...p, limit, page: 1 })),
        setStatus: (status: CargoAdminStatus) => setParams((p) => ({ ...p, status, page: 1 })),
        setSearch,
        refetch: () => setParams((p) => ({ ...p })),
    };
}