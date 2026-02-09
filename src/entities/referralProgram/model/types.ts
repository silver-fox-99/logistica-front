export type ReferralKpi = {
    invited: number;
    active: number;
    qualified: number;
    totalEarned: { amount: string; currency: string };
    pending: { amount: string; currency: string };
    available: { amount: string; currency: string };
};

export type ReferralCodeInfo = {
    code: string;
};

export type ReferralEarningRow = {
    id: string;
    date: string;
    userMasked: string;
    amount: string;
    currency: string;
    reason: string;
    status: "PENDING" | "CONFIRMED" | "REVERSED";
};

export type ReferralInvitedRow = {
    id: string;
    userMasked: string;
    joinedAt: string;
    status: "INVITED" | "REGISTERED" | "QUALIFIED";
    reward: { amount: string; currency: string } | null;
    rewarded_at: string;
};

export type ReferralAgreement = {
    isSigned: boolean;
    signedAt: string | null;

    documentTitle: string;
    documentKey: string;

    documentFormat?: "MARKDOWN" | "HTML";
    content?: string | null;
};
