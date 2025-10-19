import api from "@/shared/api/axios";

export type IpBan = {
    id: string;
    network: string;           // IP или CIDR
    reason: string | null;
    is_active: boolean;
    expires_at: string | null; // ISO или null
    hits: number;
    created_by?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        phone: string;
        avatar: string | null;
        is_admin: boolean;
    };
    created_at: string;
    updated_at: string;
};

export type IpBanListResponse = {
    status: boolean;
    data: { items: IpBan[]; total: number; page: number; limit: number; pages: number };
};

export type IpBanQuery = { search?: string; page?: number; limit?: number };

export type CreateIpBanDto = {
    network: string;
    reason?: string;
    is_active?: boolean;
    expiresAt?: string; // ISO
};

export type PatchIpBanDto = Partial<CreateIpBanDto> & { is_active?: boolean; expiresAt?: string | null };

const BASE = "/ip-blacklist";

export const adminIpBlacklistApi = {
    list: async (params: IpBanQuery) => {
        const { data } = await api.get<IpBanListResponse>(BASE, { params });
        return data.data;
    },
    create: async (body: CreateIpBanDto) => {
        const { data } = await api.post(BASE, body);
        return data;
    },
    patch: async (id: string, body: PatchIpBanDto) => {
        const { data } = await api.patch(`${BASE}/${id}`, body);
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete(`${BASE}/${id}`);
        return data;
    },
};
