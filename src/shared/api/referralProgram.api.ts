import api from "@/shared/api/axios";

export type ReferralProgramMeResponse = {
    agreement: {
        isSigned: boolean;
        signedAt: string | null;
        document: {
            id: string;
            key: string;
            title: string;
            format: "MARKDOWN" | "HTML";
            version: number;
            published_at: string | null;
        };
    } | null;

    profile: {
        code: string | null;
        inviteLink?: string | null;
    };

    stats: {
        currency: string;
        balance: string; // "1200.00"
        pending: string; // "0.00"
        totalEarned: string; // "1550.00"
        invited: number;
        active: number;
        qualified: number;
    } | null;

    settings: {
        id: string;
        is_enabled: boolean;
        trigger: string;
        reward_currency: string;
        reward_type: string;
        reward_value: string;
        document_id: string | null;
        document_key: string | null;
    } | null;

    recentEarnings: Array<{
        id: string;
        created_at: string;
        reason: string;
        status: string;
        amount: string; // "10.00"
        amount_minor: string;
        related_user_id: string | null;
        meta: Record<string, any>;
    }>;
};

export type ReferralAgreementResponse = {
    id: string;
    key: string;
    title: string;
    format: "MARKDOWN" | "HTML";
    version: number;
    published_at: string | null;
    content: string;
};

export type ReferralInvitedResponse = {
    items: Array<{
        id: string;
        referred_user_id: string;
        created_at: string;
        rewarded_at: string | null;
        status: "REGISTERED" | "QUALIFIED";
        code_used: string;
    }>;
    limit: number;
    offset: number;
};

export type ReferralEarningsResponse = {
    currency: string;
    items: Array<{
        id: string;
        created_at: string;
        reason: string;
        status: string;
        amount: string;
        amount_minor: string;
        related_user_id: string | null;
        meta: Record<string, any>;
    }>;
    limit: number;
    offset: number;
};

export const ReferralProgramApi = {
    me: async () => {
        const { data } = await api.get<ReferralProgramMeResponse>("/referral-program/me");
        return data;
    },

    sign: async () => {
        const { data } = await api.post<ReferralProgramMeResponse>("/referral-program/sign");
        return data;
    },

    agreement: async () => {
        const { data } = await api.get<ReferralAgreementResponse>("/referral-program/agreement");
        return data;
    },

    invited: async (params?: { limit?: number; offset?: number }) => {
        const { data } = await api.get<ReferralInvitedResponse>("/referral-program/invited", { params });
        return data;
    },

    earnings: async (params?: { limit?: number; offset?: number }) => {
        const { data } = await api.get<ReferralEarningsResponse>("/referral-program/earnings", { params });
        return data;
    },
};
