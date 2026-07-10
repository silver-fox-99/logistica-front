import { useEffect, useMemo, useState } from "react";
import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import type { PublicFilters } from "./types";

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return (Object.keys(obj) as (keyof T)[]).reduce<Partial<T>>((acc, key) => {
        const v = obj[key];
        if (v === undefined || v === null || v === "") {
            return acc;
        }
        acc[key] = v;
        return acc;
    }, {});
}

export function usePublicShipments(
    kind: "cargo" | "transport",
    page = 1,
    limit = 10,
    filters?: PublicFilters
) {
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizedFilters = useMemo(() => compact(filters ?? {}), [filters]);
    const depsKey = useMemo(() => JSON.stringify({ page, limit, kind, ...normalizedFilters }), [
        page,
        limit,
        kind,
        normalizedFilters,
    ]);

    useEffect(() => {
        let aborted = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const resp =
                    kind === "cargo"
                        ? await publicShipmentsApi.listCargo({ page, limit, ...normalizedFilters })
                        : await publicShipmentsApi.listTransport({ page, limit, ...normalizedFilters });

                if (aborted) return;

                setItems(resp.data ?? []);
                setTotal(resp.total ?? 0);
                setPages(resp.pages ?? 1);
            } catch (e: any) {
                if (aborted) return;
                setError(e?.message ?? "Не удалось загрузить список");
                setItems([]);
                setTotal(0);
                setPages(1);
            } finally {
                if (!aborted) setLoading(false);
            }
        })();

        return () => {
            aborted = true;
        };
    }, [depsKey]);

    return { items, total, pages, loading, error };
}
