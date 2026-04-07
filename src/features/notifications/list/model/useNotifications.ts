import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListNotificationsResponse, NotificationType } from "@/entities/notification/model/types";
import { notificationsApi } from "@/shared/api/notifications.api";
import {useDebouncedValue} from "@/shared/lib/hooks/useDebouncedValue.ts";

export function useNotifications() {
    const [type, setType] = useState<NotificationType | undefined>(undefined);
    const [q, setQ] = useState("");
    const debouncedQ = useDebouncedValue(q, 350);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [data, setData] = useState<ListNotificationsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const offset = useMemo(() => page * rowsPerPage, [page, rowsPerPage]);

    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const res = await notificationsApi.list({
                type,
                q: debouncedQ,
                offset,
                limit: rowsPerPage,
            });

            setData(res);
        } catch (e: any) {
            if (e?.name === "CanceledError") return;
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [type, debouncedQ, offset, rowsPerPage]);

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]);


    useEffect(() => {
        setPage(0);
    }, [type, debouncedQ]);

    return {
        type,
        setType,
        q,
        setQ,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        data,
        loading,
        error,
        reload: load,
    };
}
