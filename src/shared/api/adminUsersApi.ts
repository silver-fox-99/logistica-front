import api from "@/shared/api/axios";
import type {RegistrationStage, UserStatus} from "@/entities/user/model/user.types.ts";

export type AdminUsersQuery = {
    page?: number;
    limit?: number;
    search?: string;
    sort?: "created_at" | "updated_at" | "last_login_at";
    dir?: "asc" | "desc";
};

export type AdminUser = {
    id: string;
    is_admin: boolean;
    avatar: string | null;
    phone: string;
    phone_verified_at: string | null;
    email: string | null;
    email_verified_at: string | null;
    first_name: string | null;
    last_name: string | null;
    registration_stage: RegistrationStage;
    status: UserStatus;
    last_login_at: string | null;
    meta: Record<string, unknown>;
    crm_integrated_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    binotel_id: string | null;
    type?: string | null
};

export type AdminUsersResponse = {
    data : {
        items: AdminUser[];
        total: number;
        page: number;
        pages: number;
        limit: number;
        sort?: string;
        dir?: "asc" | "desc";
        message?: string;
    }

};

export const adminUsersApi = {
    list: async (params: AdminUsersQuery) => {
        const { data } = await api.get<AdminUsersResponse>("/users", { params });
        return data.data;
    },
};
