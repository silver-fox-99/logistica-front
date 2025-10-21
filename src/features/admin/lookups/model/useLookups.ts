
import { useCallback, useEffect, useState } from "react";
import { lookupsApi, type LookupGroup, type LookupItem } from "@/shared/api/lookupsApi";

export function useLookups() {
    const [groups, setGroups] = useState<LookupGroup[]>([]);
    const [current, setCurrent] = useState<LookupGroup | null>(null);
    const [items, setItems] = useState<LookupItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadGroups = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const gs = await lookupsApi.listGroups();
            setGroups(gs);
            if (gs.length && !current) setCurrent(gs[0]);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load groups");
        } finally {
            setLoading(false);
        }
    }, [current]);

    const loadItems = useCallback(async (group: string) => {
        try {
            const rows = await lookupsApi.listItems(group);
            setItems(rows);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load items");
            setItems([]);
        }
    }, []);

    useEffect(() => { void loadGroups(); }, [loadGroups]);
    useEffect(() => { if (current) void loadItems(current.code); }, [current, loadItems]);

    return {
        groups, setGroups, current, setCurrent, items, setItems,
        loading, error, reloadGroups: loadGroups, reloadItems: () => current && loadItems(current.code),
    };
}
