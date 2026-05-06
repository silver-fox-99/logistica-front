import { useEffect, useMemo, useState } from "react";
import { shipmentsApi, type ListParams } from "@/shared/api/shipmentsApi";
import { adaptCargo, adaptTransport } from "../lib/adapter";
import type { ShipmentsKind, ShipmentRowData } from "./type";

type Scope = "public" | "my";

type StoredDrawerFilters = Partial<ListParams> & {
    kind?: ShipmentsKind;
};

const FILTERS_STORAGE_KEY = "shipments:filters:drawer-form";

function readStoredFilters(kind: ShipmentsKind): Partial<ListParams> {
    if (typeof window === "undefined") return {};

    try {
        const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw) as StoredDrawerFilters;

        if (parsed.kind && parsed.kind !== kind) {
            return {};
        }

        const { kind: _kind, ...filters } = parsed;

        return filters;
    } catch {
        return {};
    }
}

function compactFilters(filters: Partial<ListParams>): Partial<ListParams> {
    const out: Partial<ListParams> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;

        (out as any)[key] = value;
    });

    return out;
}

export function useShipments(
    kind: ShipmentsKind,
    scope: Scope,
    page = 1,
    limit = 10,
    filters: Partial<ListParams> = {},
) {
    const [items, setItems] = useState<ShipmentRowData[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestFilters = useMemo(() => {
        return compactFilters({
            ...readStoredFilters(kind),
            ...filters,
        });
    }, [kind, JSON.stringify(filters)]);

    useEffect(() => {
        let aborted = false;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const resp = await shipmentsApi.list(kind, scope, {
                    page,
                    limit,
                    ...requestFilters,
                });

                if (aborted) return;

                const adapted = resp.data.map((i: any) =>
                    kind === "cargo" ? adaptCargo(i) : adaptTransport(i),
                );

                setItems(adapted);
                setTotal(resp.total);
                setPages(resp.pages);
            } catch (e: any) {
                if (aborted) return;

                setError(e?.response?.data?.message ?? "Не удалось загрузить заказы");
            } finally {
                if (!aborted) setLoading(false);
            }
        };

        run();

        return () => {
            aborted = true;
        };
    }, [kind, scope, page, limit, JSON.stringify(requestFilters)]);

    return { items, total, pages, loading, error };
}