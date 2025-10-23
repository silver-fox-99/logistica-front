import { useEffect, useState } from "react";
import { shipmentsApi, type ListParams } from "@/shared/api/shipmentsApi";
import { adaptCargo, adaptTransport } from "../lib/adapter";
import type { ShipmentsKind, ShipmentRowData } from "./type";

type Scope = "public" | "my";

export function useShipments(kind: ShipmentsKind, scope: Scope, page = 1, limit = 10, filters: Partial<ListParams> = {}) {
    const [items, setItems] = useState<ShipmentRowData[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let aborted = false;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await shipmentsApi.list(kind, scope, { page, limit, ...filters });
                if (aborted) return;
                const adapted = resp.data.map((i: any) => (kind === "cargo" ? adaptCargo(i) : adaptTransport(i)));
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
        return () => { aborted = true; };
    }, [kind, scope, page, limit, JSON.stringify(filters)]);

    return { items, total, pages, loading, error };
}
