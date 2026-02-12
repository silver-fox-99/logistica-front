
import api from "@/shared/api/axios";
import type {AdminUser} from "@/shared/api/adminUsersApi.ts";
import type {RegistrationStage, UserStatus} from "@/entities/user/model/user.types.ts";
import type {AdminGroup} from "@/entities/adminGroup/model/types.ts";



export type AdminUserSessionsItem = {
    id: string;
    status: "ACTIVE" | "REVOKED" | string;
    expiresAt: string;
    revokedAt: string | null;
    revokeReason: string | null;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
    updatedAt: string;
    meta: Record<string, any> | null;
};

export type AdminUserGetResponse = {
    status: boolean;
    data: { user: AdminUser; sessions: AdminUserSessionsItem[], groups: AdminGroup[] };
    message?: string;
};

export type AdminUserPatch = Partial<{
    is_admin: boolean;
    avatar: string | null;
    phone: string;
    phone_verified_at: string | null;
    email: string | null;
    email_verified_at: string | null;
    first_name: string | null;
    last_name: string | null;
    password: string;
    registration_stage: RegistrationStage;
    status: UserStatus;
    last_login_at: string | null;
    meta: Record<string, any>;
    deleted_at: string | null;
    type: string | null;
}>;

export const adminUserApi = {
    get: async (id: string) => {
        const { data } = await api.get<AdminUserGetResponse>(`/users/${id}`);
        return data;
    },
    patch: async (id: string, payload: AdminUserPatch) => {
        const { data } = await api.patch(`/users/${id}`, payload);
        return data;
    },
    ban: async (id: string) => {
        const { data } = await api.get(`/users/${id}/ban`);
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete(`/users/${id}`);
        return data;
    },
    crmMigrate: async (id: string) => {
        const { data } = await api.post(`/users/${id}/crm-migrate`);
        return data;
    },
};
