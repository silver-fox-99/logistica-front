import { Alert, Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useTenderWorkspace } from "../model/useTenderWorkspace";
import type { TenderWorkspaceContext } from "../model/types";
import { TenderWorkspaceHeader } from "@/widgets/tender/tender-workspace-header/ui/TenderWorkspaceHeader";
import { TenderStatus } from "@/entities/tender/model/types";
import { useUserStore } from "@/entities/user/model/user.store";
import { useTenderWorkspaceAccessStore } from "@/entities/tender/model/tenderWorkspaceAccess.store";

export default function TenderWorkspaceLayout() {
    const { id = "" } = useParams();
    const currentUserId = useUserStore((state) => state.user?.id ?? null);
    const setTenderAccess = useTenderWorkspaceAccessStore((state) => state.setAccess);
    const clearTenderAccess = useTenderWorkspaceAccessStore((state) => state.clearAccess);
    const { tender, isLoading, error, reload, code } = useTenderWorkspace(id);
    const [ownerCode, setOwnerCode] = useState("");
    const isOwner = Boolean(currentUserId && tender?.owner_id === currentUserId);
    const isCurrentWinner = Boolean(currentUserId && tender?.current_winner_id === currentUserId);
    const canManage = isOwner;
    const canBid = Boolean(currentUserId && tender && !isOwner && tender.status === TenderStatus.ACTIVE);
    const canConfirmCode = Boolean(isCurrentWinner && tender?.status === TenderStatus.WAITING_CONFIRMATION);

    useEffect(() => {
        if (!tender) {
            clearTenderAccess();
            return;
        }

        setTenderAccess({ tenderId: tender.id, canManage });

        return () => {
            clearTenderAccess();
        };
    }, [canManage, clearTenderAccess, setTenderAccess, tender]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!tender) return null;

    const context: TenderWorkspaceContext = {
        tender,
        currentUserId,
        isOwner,
        isCurrentWinner,
        canManage,
        canBid,
        canConfirmCode,
        ownerCode: code || ownerCode,
        setOwnerCode,
        reload,
    };

    return (
        <Box sx={{ py: 3 }}>
            <Box sx={{ display: "grid", gap: 3 }}>
                <TenderWorkspaceHeader tender={tender} isOwner={isOwner} isCurrentWinner={isCurrentWinner} ownerCode={code || ownerCode} />
                <Outlet context={context} />
            </Box>
        </Box>
    );
}
