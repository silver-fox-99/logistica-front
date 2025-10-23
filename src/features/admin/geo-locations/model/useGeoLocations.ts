import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminGeoApi, type GeoLocation, type LocationType, type CreateLocationDto, type UpdateLocationDto } from "@/shared/api/adminGeoApi";

export function useGeoLocations() {
    const [items, setItems] = useState<GeoLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null); // выделенная нода дерева (родитель)
    const [typeFilter, setTypeFilter] = useState<LocationType | "">("");

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const list = await adminGeoApi.list();
            setItems(list);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось загрузить геолокации");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const byId = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(i => {
            if (typeFilter && i.type !== typeFilter) return false;
            if (!q) return true;
            // ищем по name/code/slug/iso2
            const hay = [i.name, i.code, i.slug, i.iso2].filter(Boolean).join(" ").toLowerCase();
            return hay.includes(q);
        });
    }, [items, search, typeFilter]);

    const treeRoots = useMemo(() => filtered.filter(i => !i.parent_id), [filtered]);
    const childrenOf = (parentId: string | null) => filtered.filter(i => (i.parent_id ?? null) === parentId);

    const create = async (dto: CreateLocationDto) => {
        try {
            const created = await adminGeoApi.create(dto);
            setItems(prev => [created, ...prev]);
            toast.success('Локация создана');
            return created;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при создании локации';
            toast.error(message);
            throw error;
        }
    };

    const update = async (id: string, dto: UpdateLocationDto) => {
        try {
            const upd = await adminGeoApi.update(id, dto);
            setItems(prev => prev.map(i => (i.id === id ? upd : i)));
            toast.success('Локация обновлена');
            return upd;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при обновлении локации';
            toast.error(message);
            throw error;
        }
    };

    const remove = async (id: string) => {
        try {
            await adminGeoApi.remove(id);
            setItems(prev => prev.filter(i => i.id !== id));
            if (selectedId === id) setSelectedId(null);
            toast.success('Локация удалена');
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при удалении локации';
            toast.error(message);
            throw error;
        }
    };

    return {
        items,
        loading,
        error,
        search, setSearch,
        selectedId, setSelectedId,
        typeFilter, setTypeFilter,
        byId, filtered, treeRoots, childrenOf,
        create, update, remove, reload: load,
    };
}
