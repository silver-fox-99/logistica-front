import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import type {
    CreateTelegramNotificationConfigPayload,
    TelegramNotificationConfig,
    UpdateTelegramNotificationConfigPayload,
} from "@/entities/telegram-notification/model/types";
import {telegramNotificationsApi} from "@/shared/api/telegramNotificationsApi.ts";

type FiltersState = {
    search: string;
    page: number;
    limit: number;
};

export function useAdminTelegramNotificationsPage() {
    const [items, setItems] = useState<TelegramNotificationConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<FiltersState>({
        search: "",
        page: 1,
        limit: 10,
    });

    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await telegramNotificationsApi.list({
                search: filters.search || undefined,
                page: filters.page,
                limit: filters.limit,
            });

            setItems(data.items);
            setTotal(data.total);
            setPages(data.pages);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load telegram configs");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void load();
    }, [load]);

    const setSearch = useCallback((value: string) => {
        setFilters((prev) => ({
            ...prev,
            search: value,
            page: 1,
        }));
    }, []);

    const setPage = useCallback((page: number) => {
        setFilters((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    const createConfig = useCallback(
        async (payload: CreateTelegramNotificationConfigPayload) => {
            try {
                setSubmitting(true);
                await telegramNotificationsApi.create(payload);
                toast.success("Telegram config created");
                await load();
                return true;
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to create telegram config");
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [load],
    );

    const updateConfig = useCallback(
        async (id: string, payload: UpdateTelegramNotificationConfigPayload) => {
            try {
                setSubmitting(true);
                await telegramNotificationsApi.update(id, payload);
                toast.success("Telegram config updated");
                await load();
                return true;
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to update telegram config");
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [load],
    );

    const toggleConfig = useCallback(
        async (id: string) => {
            try {
                await telegramNotificationsApi.toggle(id);
                toast.success("Telegram config status updated");
                await load();
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to toggle telegram config");
            }
        },
        [load],
    );

    const removeConfig = useCallback(
        async (id: string) => {
            try {
                await telegramNotificationsApi.remove(id);
                toast.success("Telegram config deleted");
                await load();
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to delete telegram config");
            }
        },
        [load],
    );

    return {
        items,
        loading,
        submitting,
        error,
        filters,
        total,
        pages,
        setSearch,
        setPage,
        reload: load,
        createConfig,
        updateConfig,
        toggleConfig,
        removeConfig,
    };
}