import { useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import { tendersApi } from "@/shared/api/tendersApi";
import { rememberPendingOwnerTender } from "@/entities/tender/model/pendingOwnerTenders";

import { sortedBids } from "../model/helpers";
import { BidFormCard } from "./BidFormCard";
import { ConfirmCodeCard } from "./ConfirmCodeCard";
import { OwnerWinnerCodeAlert } from "./OwnerWinnerCodeAlert";
import { BidsListCard } from "./BidsListCard";

export default function TenderBidsPage() {
    const { t, i18n } = useTranslation();

    const {
        tender,
        reload,
        isOwner,
        canBid,
        canConfirmCode,
        ownerCode,
        setOwnerCode,
    } = useOutletContext<TenderWorkspaceContext>();

    const [amount, setAmount] = useState("");
    const [transportDetails, setTransportDetails] = useState("");
    const [confirmationCode, setConfirmationCode] = useState("");

    const [busy, setBusy] = useState(false);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [selectingId, setSelectingId] = useState("");

    const bids = useMemo(() => sortedBids(tender.bids ?? []), [tender.bids]);
    const leader = bids[0];

    const formatTime = (value?: string | null) =>
        value
            ? new Date(value).toLocaleString(i18n.language, {
                dateStyle: "short",
                timeStyle: "short",
                hour12: false,
            })
            : t("tenders.common.empty");

    const submitBid = async () => {
        if (!canBid) return;

        if (!amount.trim()) {
            toast.warning(t("tenders.bids.validationAmount"));
            return;
        }

        try {
            setBusy(true);

            await tendersApi.createOrUpdateBid(tender.id, {
                amount: amount.trim().replace(",", "."),
                transport_details: transportDetails.trim() || null,
            });

            toast.success(t("tenders.bids.saved"));

            setAmount("");
            setTransportDetails("");

            await reload();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("tenders.bids.saveError"));
        } finally {
            setBusy(false);
        }
    };

    const selectWinner = async (bidId: string) => {
        if (!isOwner) return;

        try {
            setSelectingId(bidId);

            const result = await tendersApi.selectWinner(tender.id, bidId);

            if (result?.owner_code) {
                setOwnerCode(result.owner_code);
            }

            rememberPendingOwnerTender(tender.id);

            toast.success(t("tenders.bids.winnerSelected"));

            await reload();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("tenders.bids.winnerError"));
        } finally {
            setSelectingId("");
        }
    };

    const confirmCode = async () => {
        if (!canConfirmCode) return;

        if (!confirmationCode.trim()) {
            toast.warning(t("tenders.settings.validation.code"));
            return;
        }

        try {
            setConfirmBusy(true);

            await tendersApi.confirmCode(tender.id, {
                code: confirmationCode.trim(),
            });

            toast.success(t("tenders.settings.toast.codeConfirmed"));

            setConfirmationCode("");

            await reload();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("tenders.settings.toast.codeError"));
        } finally {
            setConfirmBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            {canBid && (
                <BidFormCard
                    currency={tender.currency}
                    amount={amount}
                    transportDetails={transportDetails}
                    busy={busy}
                    onAmountChange={setAmount}
                    onTransportDetailsChange={setTransportDetails}
                    onSubmit={submitBid}
                />
            )}

            {isOwner && ownerCode && <OwnerWinnerCodeAlert code={ownerCode} />}

            {canConfirmCode && (
                <ConfirmCodeCard
                    code={confirmationCode}
                    busy={confirmBusy}
                    onCodeChange={setConfirmationCode}
                    onConfirm={confirmCode}
                />
            )}

            <BidsListCard
                bids={bids}
                leader={leader}
                currency={tender.currency}
                isOwner={isOwner}
                selectingId={selectingId}
                formatTime={formatTime}
                onSelectWinner={selectWinner}
            />
        </Stack>
    );
}