import { Navigate } from "react-router-dom";
import { type JSX, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/entities/user/model/user.store";
import { authApi } from "@/shared/api/authApi";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
    const user = useUserStore(s => s.user);
    const setUser = useUserStore(s => s.setUser);

    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const didRun = useRef(false);

    const run = async () => {
        try {
            if (user) {
                setAllowed(user.is_admin);
                return;
            }
            const res = await authApi.getMe();
            setUser(res.data);
            setAllowed(!!res.data?.is_admin);
        } catch {
            setUser(null);
            setAllowed(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;
        run();
    }, []);

    if (loading || allowed === null) return null;

    return allowed ? children : <Navigate to="/dashboard" replace />;
}
