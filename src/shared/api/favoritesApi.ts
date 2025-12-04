import api from "@/shared/api/axios";

export const favoritesApi = {
    add: async (kind: "cargo" | "transport", id: string) => {
        const { data } = await api.post(`/${kind}/${id}/favorite`);
        return data;
    },
    remove: async (kind: "cargo" | "transport", id: string) => {
        const { data } = await api.delete(`/${kind}/${id}/favorite`);
        return data;
    },
};
