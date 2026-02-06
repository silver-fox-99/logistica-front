import { useCallback, useEffect, useMemo, useState } from "react";

import type { CreateDocumentDto, DocumentEntity, UpdateDocumentDto } from "@/entities/document/model/types";
import {documentsApi} from "@/shared/api/documentsApi.ts";

type State = {
    data: DocumentEntity[];
    loading: boolean;
    error?: string;
};

function sortDocs(a: DocumentEntity, b: DocumentEntity) {
    if (a.key !== b.key) return a.key.localeCompare(b.key);
    return b.version - a.version;
}

export function useDocuments() {
    const [state, setState] = useState<State>({ data: [], loading: true });

    const reload = useCallback(async () => {
        setState((s) => ({ ...s, loading: true, error: undefined }));
        try {
            const list = await documentsApi.list();
            list.sort(sortDocs);
            setState({ data: list, loading: false });
        } catch (e: any) {
            setState((s) => ({ ...s, loading: false, error: e?.response?.data?.message ?? "Failed to load documents" }));
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    const create = useCallback(async (dto: CreateDocumentDto) => {
        const created = await documentsApi.create(dto);
        setState((s) => {
            const next = [created, ...s.data].slice();
            next.sort(sortDocs);
            return { ...s, data: next };
        });
        return created;
    }, []);

    const update = useCallback(async (id: string, dto: UpdateDocumentDto) => {
        const updated = await documentsApi.update(id, dto);
        setState((s) => {
            const next = s.data.map((d) => (d.id === id ? updated : d));
            next.sort(sortDocs);
            return { ...s, data: next };
        });
        return updated;
    }, []);

    const remove = useCallback(async (id: string) => {
        await documentsApi.remove(id);
        setState((s) => ({ ...s, data: s.data.filter((d) => d.id !== id) }));
        return true;
    }, []);

    const groupedByKey = useMemo(() => {
        const map = new Map<string, DocumentEntity[]>();
        for (const d of state.data) {
            const arr = map.get(d.key) ?? [];
            arr.push(d);
            map.set(d.key, arr);
        }
        // внутри key: по version desc
        for (const [k, arr] of map.entries()) {
            arr.sort((a, b) => b.version - a.version);
            map.set(k, arr);
        }
        return map;
    }, [state.data]);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        reload,
        create,
        update,
        remove,
        groupedByKey,
    };
}
