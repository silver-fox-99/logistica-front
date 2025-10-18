import api from "@/shared/api/axios.ts";

export const profileApi = {

    updateProfile: async (data:any) => {
        const res = await api.patch("/profile/update", data);

        return res.data;
    }
}