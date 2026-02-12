import { useEffect, useState } from "react";
import { adminUserApi, type AdminUserSessionsItem } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";
import type {AdminGroup} from "@/entities/adminGroup/model/types.ts";

export function useAdminUser(id: string) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [sessions, setSessions] = useState<AdminUserSessionsItem[]>([]);
    const [groups, setGroups] = useState<AdminGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const reload = async () => {
        setLoading(true); setErr(null);
        try {
            const res = await adminUserApi.get(id);
            setUser(res.data.user);
            setSessions(res.data.sessions ?? []);
            setGroups(res.data.groups ?? []);
        } catch (e: any) {
            setErr(e?.response?.data?.message ?? "Не удалось загрузить пользователя");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void reload(); }, [id]);
    return { user, sessions, groups, loading, err, reload, setUser, setSessions, setGroups };
}
