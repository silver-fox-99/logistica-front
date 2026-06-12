import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListNotificationsResponse, NotificationType } from "@/entities/notification/model/types";
import { notificationsApi } from "@/shared/api/notifications.api";
import {useDebouncedValue} from "@/shared/lib/hooks/useDebouncedValue.ts";
import { toast } from "react-toastify";
import { useUnreadNotificationsStore } from "@/entities/notification/model/unreadNotifications.store";

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

    // WebSocket real-time update listener
    useEffect(() => {
        const handleNewNotification = (e: Event) => {
            const customEvent = e as CustomEvent<any>;
            const newNotif = customEvent.detail;

            // Check if matches the current type filter
            if (type && newNotif.type !== type) return;

            // Check if matches the current search query
            if (debouncedQ) {
                const query = debouncedQ.toLowerCase();
                const matchesUser = newNotif.user_id?.toLowerCase().includes(query);
                const matchesPhone = newNotif.phone?.toLowerCase().includes(query);
                if (!matchesUser && !matchesPhone) return;
            }

            setData((prev) => {
                if (!prev) return null;
                // Avoid duplicates
                if (prev.items.some((item) => item.id === newNotif.id)) return prev;
                return {
                    ...prev,
                    items: [newNotif, ...prev.items].slice(0, rowsPerPage),
                    total: prev.total + 1,
                };
            });
        };

        window.addEventListener("admin_notification_received", handleNewNotification);
        return () => {
            window.removeEventListener("admin_notification_received", handleNewNotification);
        };
    }, [type, debouncedQ, rowsPerPage]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            setData((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    items: prev.items.map((item) =>
                        item.id === id ? { ...item, is_read: true } : item
                    ),
                };
            });
            useUnreadNotificationsStore.getState().decrement();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to mark notification as read");
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationsApi.markAllAsRead();
            setData((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    items: prev.items.map((item) => ({ ...item, is_read: true })),
                };
            });
            useUnreadNotificationsStore.getState().setCount(0);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to mark all as read");
        }
    }, []);

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
        markAsRead,
        markAllAsRead,
    };
}
