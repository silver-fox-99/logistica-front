import { useEffect, useState } from "react";
import { adminUserApi, type AdminUserSessionsItem } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

export function useAdminUser(id: string) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [sessions, setSessions] = useState<AdminUserSessionsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const reload = async () => {
        setLoading(true); setErr(null);
        try {
            const res = await adminUserApi.get(id);
            setUser(res.data.user);
            setSessions(res.data.sessions ?? []);
        } catch (e: any) {
            setErr(e?.response?.data?.message ?? "Failed to load user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void reload(); }, [id]);
    return { user, sessions, loading, err, reload, setUser, setSessions };
}
