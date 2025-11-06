import api from "@/shared/api/axios";

export type LookupGroup = {
    id: string; code: string; title: string; description: string | null;
    created_at: string; updated_at: string;
};
export type LookupItem = {
    id: string; group_id: string; slug: string; label: string;
    label_ru?: string | null;
    label_uz?: string | null;
    active: boolean; sort_order: number; meta?: any;
    created_at: string; updated_at: string;
};

export const lookupsApi = {
    listGroups: async () => {
        const { data } = await api.get<{ status: boolean; data: LookupGroup[] }>("/lookups/groups");
        return data.data;
    },
    createGroup: async (payload: { code: string; title: string; description?: string | null }) => {
        const { data } = await api.post("/lookups/groups", payload);
        return data.data as LookupGroup;
    },
    updateGroup: async (id: string, payload: Partial<{ code: string; title: string; description: string | null }>) => {
        const { data } = await api.patch(`/lookups/groups/${id}`, payload);
        return data.data as LookupGroup;
    },
    deleteGroup: async (id: string) => {
        const { data } = await api.delete(`/lookups/groups/${id}`);
        return data.data as boolean;
    },
    listItems: async (groupCode: string) => {
        const { data } = await api.get<{ status: boolean; data: LookupItem[] }>(`/lookups/${groupCode}`);
        return data.data;
    },
    createItem: async (groupCode: string, payload: { slug: string; label: string; label_ru?: string | null; label_uz?: string | null; active?: boolean; sort_order?: number; meta?: any }) => {
        const { data } = await api.post(`/lookups/${groupCode}`, payload);
        return data.data as LookupItem;
    },
    updateItem: async (groupCode: string, id: string, payload: Partial<{ slug: string; label: string; label_ru: string | null; label_uz: string | null; active: boolean; sort_order: number; meta: any }>) => {
        const { data } = await api.patch(`/lookups/${groupCode}/${id}`, payload);
        return data.data as LookupItem;
    },
    deleteItem: async (groupCode: string, id: string) => {
        const { data } = await api.delete(`/lookups/${groupCode}/${id}`);
        return data.data as boolean;
    },
    reorderItems: async (groupCode: string, items: { id: string; sort_order: number }[]) => {
        const { data } = await api.patch(`/lookups/${groupCode}/reorder`, { items });
        return data.data as LookupItem[];
    },
};
