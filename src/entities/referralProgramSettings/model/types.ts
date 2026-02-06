import type {DocumentEntity} from "@/entities/document/model/types.ts";


export enum ReferralTrigger {
    PREMIUM_PURCHASE = "PREMIUM_PURCHASE",
}

export enum ReferralRewardType {
    FIXED = "FIXED",
    PERCENT = "PERCENT",
}

export type ReferralProgramSettings = {
    id: string;
    is_enabled: boolean;
    trigger: ReferralTrigger;
    reward_type: ReferralRewardType;
    reward_value: string;
    reward_currency: string | null;
    document: DocumentEntity | null;
    document_key: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
};

export type CreateReferralProgramSettingsDto = Partial<{
    is_enabled: boolean;
    trigger: ReferralTrigger;
    reward_type: ReferralRewardType;
    reward_value: string;
    reward_currency: string | null;
    document_id: string | null;
    document_key: string | null;
    meta: Record<string, any>;
}>;

export type ReferralPayoutCandidate = {
    wallet_id: string;
    user_id: string;
    currency: string;
    balance: string;
    phone: string;
};

export type ListReferralPayoutCandidatesResponse = {
    items: ReferralPayoutCandidate[];
};

export type ResetAllReferralBalancesDto = {
    currency?: string;      // default "UZS"
    minBalance?: number;    // minimum balance in cents
    batch_key: string;      // required, e.g. "2026-02"
    note?: string;
    dry_run?: boolean;
};

export type ResetAllReferralBalancesResponse = {
    ok: boolean;
    dry_run?: boolean;

    currency: string;
    minBalance: number;
    batch_key: string;

    candidates: number;
    attempted: number;
    created?: number;
    total_debited: string;
};


export type UpdateReferralProgramSettingsDto = CreateReferralProgramSettingsDto;
