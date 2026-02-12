import { create } from "zustand";
import { adminRbacApi } from "@/shared/api/adminRbac.api";
import type { AdminGroup } from "@/entities/adminGroup/model/types";

export type AdminAccess = {
    status: boolean;
    isRoot: boolean;
    rank: number;
    groups: AdminGroup[];
    permissionCodes: string[];
};

type AdminAccessStore = {
    access: AdminAccess | null;
    loading: boolean;
    error: string | null;

    permissionMap: Record<string, true>;

    load: (opts?: { force?: boolean }) => Promise<void>;
    setAccess: (access: AdminAccess | null) => void;
    clear: () => void;

    hasPermission: (code: string) => boolean;
    hasAny: (codes?: string[]) => boolean;
    hasAll: (codes?: string[]) => boolean;
};

function buildPermissionMap(codes: string[] | undefined | null): Record<string, true> {
    const map: Record<string, true> = {};
    for (const c of codes ?? []) map[c] = true;
    return map;
}

export const useAdminAccessStore = create<AdminAccessStore>((set, get) => ({
    access: null,
    loading: false,
    error: null,
    permissionMap: {},

    setAccess: (access) => {
        set({
            access,
            permissionMap: buildPermissionMap(access?.permissionCodes),
            error: null,
        });
    },

    clear: () => {
        set({
            access: null,
            loading: false,
            error: null,
            permissionMap: {},
        });
    },

    load: async (opts) => {
        const force = !!opts?.force;
        const { loading, access } = get();
        if (loading) return;
        if (access && !force) return;

        set({ loading: true, error: null });

        try {
            const a = await adminRbacApi.getAccessMe();
            set({
                access: a,
                permissionMap: buildPermissionMap(a.permissionCodes),
                loading: false,
                error: null,
            });
        } catch (e: any) {
            set({
                access: null,
                permissionMap: {},
                loading: false,
                error: e?.message ?? "Не удалось загрузить права доступа",
            });
        }
    },

    hasPermission: (code) => {
        const { access, permissionMap } = get();
        if (!access) return false;
        if (access.isRoot) return true;
        return !!permissionMap[code];
    },

    hasAny: (codes) => {
        if (!codes || codes.length === 0) return true;

        const { access, permissionMap } = get();
        if (!access) return false;
        if (access.isRoot) return true;

        for (const c of codes) {
            if (permissionMap[c]) return true;
        }
        return false;
    },

    hasAll: (codes) => {
        if (!codes || codes.length === 0) return true;

        const { access, permissionMap } = get();
        if (!access) return false;
        if (access.isRoot) return true;

        for (const c of codes) {
            if (!permissionMap[c]) return false;
        }
        return true;
    },
}));
