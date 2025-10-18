import axios from "axios";

export const securityApi = {
    sendEmailCode(email: string) {
        return axios.post("/api/security/email/send-code", { email });
    },

    confirmEmailCode(email: string, code: string) {
        return axios.post("/api/security/email/confirm", { email, code });
    },
    startPasswordChange() {
        return axios.post("/api/security/password/change/start");
    },
};
