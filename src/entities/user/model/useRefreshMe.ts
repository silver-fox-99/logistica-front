import { useEffect } from "react";
import { authApi } from "@/shared/api/authApi";
import { useUserStore } from "@/entities/user/model/user.store";

export const useRefreshMe = () => {
    const setUser = useUserStore((s) => s.setUser);

    useEffect(() => {
        const run = async () => {
            try {
                const res = await authApi.getMe();
                setUser(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        void run();
    }, []);
};
