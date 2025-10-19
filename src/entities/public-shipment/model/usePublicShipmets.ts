import { useEffect, useState } from "react";
import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import { adaptCargo, adaptTransport } from "../lib/adapter";
import type { PublicShipmentBase } from "./types";

export function usePublicShipments(kind: "cargo" | "transport", page = 1, limit = 10) {
    const [items, setItems] = useState<PublicShipmentBase[]>([]);
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
                const resp = kind === "cargo"
                    ? await publicShipmentsApi.listCargo(page, limit)
                    : await publicShipmentsApi.listTransport(page, limit);

                if (aborted) return;

                const adapted = resp.data.map((i: any) => (kind === "cargo" ? adaptCargo(i) : adaptTransport(i)));
                setItems(adapted);
                setTotal(resp.total);
                setPages(resp.pages);
            } catch (e: any) {
                if (aborted) return;
                setError(e?.message ?? "Failed to load list");
            } finally {
                if (!aborted) setLoading(false);
            }
        };
        run();
        return () => { aborted = true; };
    }, [kind, page, limit]);

    return { items, total, pages, loading, error };
}
