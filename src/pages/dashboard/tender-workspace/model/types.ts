import type { Tender } from "@/entities/tender/model/types";

export type TenderWorkspaceContext = {
    tender: Tender;
    currentUserId: string | null;
    isOwner: boolean;
    isCurrentWinner: boolean;
    canManage: boolean;
    canBid: boolean;
    canConfirmCode: boolean;
    ownerCode: string;
    setOwnerCode: (code: string) => void;
    reload: () => Promise<void>;
};
