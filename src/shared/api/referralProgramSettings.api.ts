import api from "./axios";
import type {
    CreateReferralProgramSettingsDto, ListReferralPayoutCandidatesResponse,
    ReferralProgramSettings, ResetAllReferralBalancesDto,
    ResetAllReferralBalancesResponse, UpdateReferralProgramSettingsDto
} from "@/entities/referralProgramSettings/model/types.ts";


export const referralProgramSettingsApi = {
    list: async () => {
        const { data } = await api.get<ReferralProgramSettings[]>("/referral-program/settings");
        return data;
    },

    create: async (dto: CreateReferralProgramSettingsDto) => {
        const { data } = await api.post<ReferralProgramSettings>("/referral-program/settings", dto);
        return data;
    },

    update: async (id: string, dto: UpdateReferralProgramSettingsDto) => {
        const { data } = await api.patch<ReferralProgramSettings>(`/referral-program/settings/${id}`, dto);
        return data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<{ ok: true }>(`/referral-program/settings/${id}`);
        return data;
    },
    listCandidates: async (params?: { currency?: string; minBalance?: number; limit?: number; offset?: number }) => {
        const { data } = await api.get<ListReferralPayoutCandidatesResponse>("/referral-program/payouts/candidates", {
            params: {
                currency: params?.currency ?? "UZS",
                minBalance: params?.minBalance ?? 1,
                limit: params?.limit ?? 200,
                offset: params?.offset ?? 0,
            },
        });
        return data;
    },

    resetAll: async (dto: ResetAllReferralBalancesDto) => {
        const { data } = await api.post<ResetAllReferralBalancesResponse>("/referral-program/payouts/reset-all", dto);
        return data;
    },
};
