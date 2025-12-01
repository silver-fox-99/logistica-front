import api from "@/shared/api/axios";

export const favoritesApi = {
    async add(kind: "cargo" | "transport", id: string) {
        const { data } = await api.post(`/${kind}/${id}/favorite`);
        return data;
    },
    
    async remove(kind: "cargo" | "transport", id: string) {
        const { data } = await api.delete(`/${kind}/${id}/favorite`);
        return data;
    },
    
    async list(kind: "cargo" | "transport") {
        const { data } = await api.get(`/${kind}/favorites`);
        return data;
    }
};

