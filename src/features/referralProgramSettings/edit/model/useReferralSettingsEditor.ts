import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReferralProgramSettings } from "@/entities/referralProgramSettings/model/types";
import type { DocumentEntity } from "@/entities/document/model/types";
import { referralProgramSettingsApi } from "@/shared/api/referralProgramSettings.api";
import { documentsApi } from "@/shared/api/documentsApi";
import type {
    CreateReferralProgramSettingsDto,
    UpdateReferralProgramSettingsDto,
} from "@/entities/referralProgramSettings/model/types";

export type UpsertReferralSettingsDto =
    | CreateReferralProgramSettingsDto
    | UpdateReferralProgramSettingsDto;

export function useReferralSettingsEditor() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [settings, setSettings] = useState<ReferralProgramSettings[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    const [documents, setDocuments] = useState<DocumentEntity[]>([]);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const active = useMemo(
        () => settings.find((s) => s.id === activeId) ?? (settings[0] ?? null),
        [settings, activeId],
    );

    const documentKeys = useMemo(() => {
        const keys = Array.from(new Set(documents.map((d) => d.key)));
        keys.sort((a, b) => a.localeCompare(b));
        return keys;
    }, [documents]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [s, docs] = await Promise.all([referralProgramSettingsApi.list(), documentsApi.list()]);
            setSettings(s);
            setDocuments(docs);

            // сохраняем выбор, если он валиден; иначе выбираем первый
            setActiveId((prev) => {
                if (prev && s.some((x) => x.id === prev)) return prev;
                return s[0]?.id ?? null;
            });
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const save = useCallback(
        async (dto: UpsertReferralSettingsDto) => {
            setSaving(true);
            setError(null);
            try {
                if (active?.id) await referralProgramSettingsApi.update(active.id, dto);
                else await referralProgramSettingsApi.create(dto);

                await loadAll();
            } catch (e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? "Save failed");
                throw e;
            } finally {
                setSaving(false);
            }
        },
        [active?.id, loadAll],
    );

    const removeActive = useCallback(async () => {
        if (!active?.id) return;

        setSaving(true);
        setError(null);
        try {
            await referralProgramSettingsApi.remove(active.id);
            setDeleteOpen(false);
            await loadAll();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Delete failed");
        } finally {
            setSaving(false);
        }
    }, [active?.id, loadAll]);

    return {
        loading,
        saving,
        error,
        setError,

        settings,
        activeId,
        setActiveId,
        active,

        documents,
        documentKeys,

        deleteOpen,
        openDelete: () => setDeleteOpen(true),
        closeDelete: () => setDeleteOpen(false),

        loadAll,
        save,
        removeActive,
    };
}
