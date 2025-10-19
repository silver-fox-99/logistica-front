import api from "@/shared/api/axios";

export const authApi = {
    checkPhone: async (phoneE164: string): Promise<{ existing: boolean }> => {
        const { data } = await api.post("/auth/check-phone", { phone: phoneE164 });
        return { existing: !!data?.data?.existing };
    },

    verifyFirebaseIdToken: async (idToken: string) => {
        const res = await api.post("/auth/phone/verify-firebase", { idToken });

        const bodyAccess  = res.data?.data?.accessToken;
        const bodyRefresh = res.data?.data?.refreshToken;

        if (bodyAccess)  localStorage.setItem("accessToken", bodyAccess);
        if (bodyRefresh) localStorage.setItem("refreshToken", bodyRefresh);

        return res.data;
    },

    completeRegister: async (payload: { firstName: string; lastName: string; password: string; }) => {
        const { data } = await api.post("/auth/register", payload);
        if (data?.accessToken)  localStorage.setItem("accessToken", data.accessToken);
        if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        return data;
    },

    getMe: async () => {
        const { data } = await api.get("/auth/me");
        return data;
    },

    login: async (payload: { phone: string; password: string; }) => {
        const { data } = await api.post("/auth/login", payload);
        return data;
    },

    resetPasswordWithIdToken: async (idToken: string, password: string) => {
        const { data } = await api.post("/auth/phone/verify-restore-password", { idToken, password });
        return data;
    },
};
