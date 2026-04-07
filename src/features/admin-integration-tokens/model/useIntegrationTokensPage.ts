

import { useCallback, useEffect, useMemo, useState } from "react";

import type { IntegrationTokenItem } from "@/entities/integration/model/types";
import {
    buildCreateIntegrationPayload,
    buildUpdateIntegrationPayload,
    mapIntegrationItemToForm,
} from "@/entities/integration/lib/mappers";
import {
    INITIAL_INTEGRATION_FILTERS,
    INITIAL_INTEGRATION_FORM,
    type IntegrationFiltersState,
    type IntegrationTokenFormState,
} from "./types";
import { integrationsApi } from "@/shared/api/integrationsApi";
import {
    adminUsersApi,
    type AdminUser,
} from "@/shared/api/adminUsersApi";
import {useDebouncedValue} from "@/shared/lib/hooks/useDebouncedValue.ts";



export function useIntegrationTokensPage() {
    const [items, setItems] = useState<IntegrationTokenItem[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState<IntegrationFiltersState>(INITIAL_INTEGRATION_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<IntegrationFiltersState>(INITIAL_INTEGRATION_FILTERS);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [selected, setSelected] = useState<IntegrationTokenItem | null>(null);
    const [form, setForm] = useState<IntegrationTokenFormState>(INITIAL_INTEGRATION_FORM);

    const [revealedToken, setRevealedToken] = useState<string | null>(null);

    const [userOptions, setUserOptions] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [filterOwnerInput, setFilterOwnerInput] = useState("");
    const [formOwnerInput, setFormOwnerInput] = useState("");

    const debouncedFilterOwnerInput = useDebouncedValue(filterOwnerInput, 400);
    const debouncedFormOwnerInput = useDebouncedValue(formOwnerInput, 400);

    const resetMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    const resetForm = useCallback(() => {
        setForm(INITIAL_INTEGRATION_FORM);
        setFormOwnerInput("");
    }, []);

    const updateFilter = useCallback(
        <K extends keyof IntegrationFiltersState>(key: K, value: IntegrationFiltersState[K]) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    const updateForm = useCallback(
        <K extends keyof IntegrationTokenFormState>(key: K, value: IntegrationTokenFormState[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    const loadUsers = useCallback(async (search?: string) => {
        setUsersLoading(true);

        try {
            const data = await adminUsersApi.list({
                page: 1,
                limit: 20,
                search: search?.trim() || undefined,
                sort: "created_at",
                dir: "desc",
            });

            setUserOptions(data.items);
        } catch {
            setUserOptions([]);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await integrationsApi.list({
                page,
                limit,
                search: appliedFilters.search || undefined,
                status: appliedFilters.status || undefined,
                is_active: appliedFilters.is_active || undefined,
                user_id: appliedFilters.owner?.id || undefined,
            });

            setItems(data.items);
            setPage(data.page);
            setPages(data.pages);
            setTotal(data.total);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Failed to load integration tokens");
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, limit, page]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        void loadUsers(debouncedFilterOwnerInput);
    }, [debouncedFilterOwnerInput, loadUsers]);

    useEffect(() => {
        if (!createOpen && !editOpen) {
            return;
        }

        void loadUsers(debouncedFormOwnerInput);
    }, [createOpen, editOpen, debouncedFormOwnerInput, loadUsers]);

    const validateForm = useCallback(() => {
        if (!form.user_id.trim()) {
            setError("Token owner is required");
            return false;
        }

        if (!form.name.trim()) {
            setError("Name is required");
            return false;
        }

        if (!form.scopes.length) {
            setError("Select at least one scope");
            return false;
        }

        if (form.usage_limit.trim()) {
            const value = Number(form.usage_limit);

            if (!Number.isFinite(value) || value <= 0) {
                setError("Usage limit must be greater than 0");
                return false;
            }
        }

        return true;
    }, [form]);

    const applyFilters = useCallback(() => {
        setPage(1);
        setAppliedFilters(filters);
    }, [filters]);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_INTEGRATION_FILTERS);
        setAppliedFilters(INITIAL_INTEGRATION_FILTERS);
        setFilterOwnerInput("");
        setPage(1);
    }, []);

    const openCreateDialog = useCallback(() => {
        resetMessages();
        setSelected(null);
        setRevealedToken(null);
        resetForm();
        setCreateOpen(true);
    }, [resetForm, resetMessages]);

    const openEditDialog = useCallback((item: IntegrationTokenItem) => {
        resetMessages();
        setSelected(item);
        setRevealedToken(null);

        const mappedForm = mapIntegrationItemToForm(item);
        setForm(mappedForm);
        setFormOwnerInput("");
        setEditOpen(true);

        if (mappedForm.owner) {
            setUserOptions((prev) => {
                const exists = prev.some((user) => user.id === mappedForm.owner?.id);
                return exists ? prev : [mappedForm.owner as AdminUser, ...prev];
            });
        }
    }, [resetMessages]);

    const openDeleteDialog = useCallback((item: IntegrationTokenItem) => {
        resetMessages();
        setSelected(item);
        setDeleteOpen(true);
    }, [resetMessages]);

    const closeAllDialogs = useCallback(() => {
        if (submitting) {
            return;
        }

        setCreateOpen(false);
        setEditOpen(false);
        setDeleteOpen(false);
        setSelected(null);
        setRevealedToken(null);
        resetForm();
    }, [resetForm, submitting]);

    const createToken = useCallback(async () => {
        resetMessages();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const data = await integrationsApi.create(buildCreateIntegrationPayload(form));
            setSuccess("Integration token created successfully");
            setRevealedToken(data.rawToken);
            setCreateOpen(false);
            resetForm();
            await loadData();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Failed to create integration token");
        } finally {
            setSubmitting(false);
        }
    }, [form, loadData, resetForm, resetMessages, validateForm]);

    const updateToken = useCallback(async () => {
        if (!selected) return;

        resetMessages();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            await integrationsApi.update(selected.id, buildUpdateIntegrationPayload(form));
            setSuccess("Integration token updated successfully");
            setEditOpen(false);
            setSelected(null);
            resetForm();
            await loadData();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Failed to update integration token");
        } finally {
            setSubmitting(false);
        }
    }, [form, loadData, resetForm, resetMessages, selected, validateForm]);

    const toggleToken = useCallback(async (item: IntegrationTokenItem) => {
        resetMessages();
        setSubmitting(true);

        try {
            await integrationsApi.toggle(item.id);
            setSuccess(item.is_active ? "Token disabled" : "Token enabled");
            await loadData();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Failed to change token status");
        } finally {
            setSubmitting(false);
        }
    }, [loadData, resetMessages]);

    const regenerateToken = useCallback(async (item: IntegrationTokenItem) => {
        resetMessages();
        setSubmitting(true);

        try {
            const data = await integrationsApi.regenerate(item.id);
            setRevealedToken(data.rawToken);
            setSuccess("Integration token regenerated successfully");
            await loadData();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Failed to regenerate token");
        } finally {
            setSubmitting(false);
        }
    }, [loadData, resetMessages]);

    const deleteToken = useCallback(async () => {
        if (!selected) return;

        resetMessages();
        setSubmitting(true);

        try {
            await integrationsApi.remove(selected.id);
            setSuccess("Integration token deleted successfully");
            setDeleteOpen(false);
            setSelected(null);
            await loadData();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Failed to delete token");
        } finally {
            setSubmitting(false);
        }
    }, [loadData, resetMessages, selected]);

    const copyRevealedToken = useCallback(async () => {
        if (!revealedToken) return;

        try {
            await navigator.clipboard.writeText(revealedToken);
            setSuccess("Token copied");
        } catch {
            setError("Failed to copy token");
        }
    }, [revealedToken]);

    const state = useMemo(
        () => ({
            items,
            page,
            pages,
            total,
            filters,
            loading,
            submitting,
            error,
            success,
            createOpen,
            editOpen,
            deleteOpen,
            selected,
            form,
            revealedToken,
            userOptions,
            usersLoading,
            filterOwnerInput,
            formOwnerInput,
        }),
        [
            items,
            page,
            pages,
            total,
            filters,
            loading,
            submitting,
            error,
            success,
            createOpen,
            editOpen,
            deleteOpen,
            selected,
            form,
            revealedToken,
            userOptions,
            usersLoading,
            filterOwnerInput,
            formOwnerInput,
        ],
    );

    const actions = useMemo(
        () => ({
            setPage,
            updateFilter,
            updateForm,
            setFilterOwnerInput,
            setFormOwnerInput,
            applyFilters,
            resetFilters,
            openCreateDialog,
            openEditDialog,
            openDeleteDialog,
            closeAllDialogs,
            createToken,
            updateToken,
            toggleToken,
            regenerateToken,
            deleteToken,
            copyRevealedToken,
            reload: loadData,
            resetMessages,
        }),
        [
            applyFilters,
            closeAllDialogs,
            copyRevealedToken,
            createToken,
            deleteToken,
            loadData,
            openCreateDialog,
            openDeleteDialog,
            openEditDialog,
            regenerateToken,
            resetFilters,
            resetMessages,
            toggleToken,
            updateFilter,
            updateForm,
            updateToken,
        ],
    );

    return { state, actions };
}