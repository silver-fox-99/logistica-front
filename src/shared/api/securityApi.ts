import api from "@/shared/api/axios.ts";

export const securityApi = {
    sendEmailCode:(email: string) => {
        return api.post("/api/security/email/send-code", { email });
    },

    confirmEmailCode:(email: string, code: string) => {
        return api.post("/api/security/email/confirm", { email, code });
    },
    changePassword: async (oldPassword: string, newPassword: string) => {
        return await api.patch("/profile/change-password", { oldPassword, newPassword });
    }
};
