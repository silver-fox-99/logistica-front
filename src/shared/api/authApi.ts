import api from "@/shared/api/axios";

export const authApi = {
    checkPhone: async (phoneE164: string): Promise<{ existing: boolean }> => {
        const { data } = await api.post("/auth/check-phone", { phone: phoneE164 });
        return { existing: !!data?.data?.existing };
    },

    sendPhoneCode: async (phone: string) => {
        const res = await api.post("/auth/phone/send-code", { phone });

        const bodyAccess  = res.data?.data?.accessToken;
        const bodyRefresh = res.data?.data?.refreshToken;

        if (bodyAccess)  localStorage.setItem("accessToken", bodyAccess);
        if (bodyRefresh) localStorage.setItem("refreshToken", bodyRefresh);

        return res.data;
    },

    verifyPhoneCode: async (code: string) => {
        const res = await api.post("/auth/phone/verify-code", { code });

        const bodyAccess  = res.data?.data?.accessToken;
        const bodyRefresh = res.data?.data?.refreshToken;

        if (bodyAccess)  localStorage.setItem("accessToken", bodyAccess);
        if (bodyRefresh) localStorage.setItem("refreshToken", bodyRefresh);

        return res.data;
    },

    sendAgainPhoneCode: async () => {
        const res = await api.get("/auth/phone/send-code");

        const bodyAccess  = res.data?.data?.accessToken;
        const bodyRefresh = res.data?.data?.refreshToken;

        if (bodyAccess)  localStorage.setItem("accessToken", bodyAccess);
        if (bodyRefresh) localStorage.setItem("refreshToken", bodyRefresh);

        return res.data;
    },

    sendRestorePhoneCode: async (phone: string) => {
        const res = await api.post("/auth/phone/restore/send-code", { phone });

        const bodyAccess  = res.data?.data?.accessToken;
        const bodyRefresh = res.data?.data?.refreshToken;

        if (bodyAccess)  localStorage.setItem("accessToken", bodyAccess);
        if (bodyRefresh) localStorage.setItem("refreshToken", bodyRefresh);

        return res.data;
    },

    verifyRestoreCode: async (code: string) => {
        const res = await api.post("/auth/phone/restore/verify-code", { code });

        return res.data;
    },

    completeRegister: async (payload: { firstName: string; lastName: string; password: string; type: string }) => {
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

    resetPassword: async (password: string) => {
        const { data } = await api.post("/auth/phone/restore-password", { password });
        return data;
    },
};
