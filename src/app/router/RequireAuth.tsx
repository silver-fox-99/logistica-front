
import { Navigate } from "react-router-dom";
import { type JSX, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/entities/user/model/user.store";
import { useTariffStore } from "@/entities/tariff/model/tariff.store";
import {authApi} from "@/shared/api/authApi.ts";

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const clearUser = useUserStore((s) => s.clearUser);
    const loadTariff = useTariffStore((s) => s.loadTariff);

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const didRun = useRef(false);

    const check = async () => {
        try {
            if (user) {
                setIsAuthenticated(true);
                setLoading(false);
                void loadTariff();
                return;
            }
            if (!localStorage.getItem("accessToken") && !localStorage.getItem("refreshToken")) {
                clearUser();
                setIsAuthenticated(false);
                return;
            }
            const res = await authApi.getMe();
            setUser(res.data);
            setIsAuthenticated(true);
            void loadTariff();
        } catch {
            clearUser()
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        const controller = new AbortController();

        check();

        return () => controller.abort();
    }, [setUser, user]);

    if (loading || isAuthenticated === null) return null;

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
