import api from "@/shared/api/axios.ts";

export const profileApi = {

    updateProfile: async (data:any) => {
        const res = await api.patch("/profile/update", data);

        return res.data;
    },

    getTelegramLink: async (): Promise<{ url: string }> => {
        const { data } = await api.get("/telegram-personal/link");
        return data;
    },

    getNotificationSettings: async () => {
        const res = await api.get("/users/me/notification-settings");
        return res.data;
    },

    updateNotificationSettings: async (data: {
        notify_new_tenders?: boolean;
        notify_my_tender_bids?: boolean;
        notify_tender_win?: boolean;
        notify_tender_finished?: boolean;
        notify_route_matches?: boolean;
        notify_system_updates?: boolean;
        channel_in_app?: boolean;
        channel_telegram?: boolean;
        channel_email?: boolean;
        route_matching_mode?: "auto" | "manual";
    }) => {
        const res = await api.patch("/users/me/notification-settings", data);
        return res.data;
    },

    sendPhoneCode: async (phone: string) => {
        const res = await api.post("/profile/phone/send-code", { phone });
        return res.data;
    },

    verifyPhone: async (code: string) => {
        const res = await api.post("/profile/phone/verify", { code });
        return res.data;
    }
}