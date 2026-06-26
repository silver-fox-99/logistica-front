import api from "@/shared/api/axios.ts";

export const securityApi = {
    sendEmailCode:(email: string) => {
        return api.post("/profile/email/send-code", { email });
    },

    confirmEmailCode:( code: string) => {
        return api.post("/profile/email/confirm", { code });
    },
    changePassword: async (oldPassword: string, newPassword: string) => {
        return await api.patch("/profile/change-password", { oldPassword, newPassword });
    }
};
