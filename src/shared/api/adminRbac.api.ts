import api from "@/shared/api/axios";
import type { AdminGroup } from "@/entities/adminGroup/model/types";
import type { AdminPermission } from "@/entities/adminPermission/model/types";
import type { AdminPermissionAction, AdminPermissionTarget } from "@/entities/adminPermission/model/types";

type ApiOk<T> = { status?: boolean; data?: T; message?: string } | T;

function unwrap<T>(payload: ApiOk<T>): T {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as any).data as T;
    }
    return payload as T;
}

const ROUTES = {
    groups: "/admin/groups",
    permissions: "/admin/permissions",
    accessMe: "/admin/access/me",
};

export type AdminAccessMe = {
    status: boolean;
    isRoot: boolean;
    rank: number;
    groups: AdminGroup[];
    permissionCodes: string[];
};

export const adminRbacApi = {
    async getGroups(): Promise<AdminGroup[]> {
        const res = await api.get(ROUTES.groups);
        return unwrap<AdminGroup[]>(res.data);
    },

    async createGroup(dto: {
        code: string;
        name: string;
        description?: string | null;
        rank?: number;
        is_root?: boolean;
    }): Promise<AdminGroup> {
        const res = await api.post(ROUTES.groups, dto);
        return unwrap<AdminGroup>(res.data);
    },

    async deleteGroup(id: string): Promise<void> {
        await api.delete(`${ROUTES.groups}/${id}`);
    },

    async getPermissions(): Promise<AdminPermission[]> {
        const res = await api.get(ROUTES.permissions);
        const data = unwrap<any>(res.data);
        return Array.isArray(data) ? data : (data?.data ?? []);
    },

    async createPermission(dto: {
        target: AdminPermissionTarget;
        action: AdminPermissionAction;
        description?: string | null;
    }): Promise<AdminPermission> {
        const res = await api.post(ROUTES.permissions, dto);
        const data = unwrap<any>(res.data);
        return (data?.data ?? data) as AdminPermission;
    },

    async deletePermission(id: string): Promise<void> {
        await api.delete(`${ROUTES.permissions}/${id}`);
    },

    async getAccessMe(): Promise<AdminAccessMe> {
        const res = await api.get(ROUTES.accessMe);
        const data = unwrap<any>(res.data);
        return (data?.data ?? data) as AdminAccessMe;
    },

    async getGroupPermissions(groupId: string): Promise<AdminPermission[]> {
        const res = await api.get(`/admin/groups/${groupId}/permissions`);
        const data = res.data;
        return Array.isArray(data) ? data : (data?.permissions ?? data?.data ?? []);
    },

    async setGroupPermissions(groupId: string, permissionIds: string[]): Promise<void> {
        await api.post(`/admin/groups/${groupId}/permissions`, { permissionIds });
    },

    async listUserGroups(userId: string): Promise<AdminGroup[]> {
        const res = await api.get(`/admin/groups/users/${userId}`);
        const data = res.data;
        return Array.isArray(data) ? data : (data?.groups ?? data?.data ?? []);
    },

    async setUserGroups(userId: string, groupIds: string[]): Promise<void> {
        await api.post(`/admin/groups/users/${userId}`, { groupIds });
    },

};
