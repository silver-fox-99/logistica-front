import { useEffect, useMemo, useState } from "react";
import {  Box, Chip, Stack, Typography } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FiClock } from "react-icons/fi";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import { tendersApi } from "@/shared/api/tendersApi";
import { rememberPendingOwnerTender } from "@/entities/tender/model/pendingOwnerTenders";


import { sortedBids } from "../model/helpers";
import { BidFormCard } from "./BidFormCard";
import { ConfirmCodeCard } from "./ConfirmCodeCard";
import { OwnerWinnerCodeAlert } from "./OwnerWinnerCodeAlert";
import { BidsListCard } from "./BidsListCard";
import {formatPrice} from "@/shared/utils/formatPrice.ts";

// ─── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(endsAt?: string | null) {
    const getRemaining = () => {
        if (!endsAt) return null;
        const diff = new Date(endsAt).getTime() - Date.now();
        return diff > 0 ? diff : 0;
    };

    const [remaining, setRemaining] = useState<number | null>(getRemaining);

    useEffect(() => {
        if (!endsAt) return;
        const interval = setInterval(() => {
            const diff = new Date(endsAt).getTime() - Date.now();
            setRemaining(diff > 0 ? diff : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    return remaining;
}

function formatCountdown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}д ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

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
    const [confirmationCode, setConfirmationCode] = useState("");

    const [busy, setBusy] = useState(false);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [selectingId, setSelectingId] = useState("");

    const bids = useMemo(() => sortedBids(tender.bids ?? []), [tender.bids]);
    const leader = bids[0];

    // Countdown
    const remaining = useCountdown(tender.ends_at);
    const isExpired = remaining === 0;

    const formatTime = (value?: string | null) =>
        value
            ? new Date(value).toLocaleString(i18n.language, {
                dateStyle: "short",
                timeStyle: "short",
                hour12: false,
            })
            : t("tenders.common.empty");

    const formatPriceLocal = (value: number | string | null | undefined) =>
        formatPrice(value, { fractionDigits: 2 });

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
                transport_details: null,
            });

            toast.success(t("tenders.bids.saved"));
            setAmount("");
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
            {/* ── Countdown timer ── */}
            {tender.ends_at && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 1.25,
                        borderRadius: 2,
                        bgcolor: isExpired ? "error.50" : "grey.50",
                        border: "1px solid",
                        borderColor: isExpired ? "error.light" : "divider",
                    }}
                >
                    <FiClock size={18} color={isExpired ? "#d32f2f" : "#666"} />

                    {isExpired ? (
                        <Typography variant="body2" fontWeight={700} color="error.main">
                            {t("tenders.bids.ended")}
                        </Typography>
                    ) : remaining != null ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                {t("tenders.bids.endsIn")}:
                            </Typography>
                            <Typography variant="body2" fontWeight={800} fontFamily="monospace">
                                {formatCountdown(remaining)}
                            </Typography>
                            <Chip
                                size="small"
                                label={formatTime(tender.ends_at)}
                                sx={{ fontSize: 11 }}
                            />
                        </Stack>
                    ) : null}
                </Box>
            )}

            {/* ── Bid form ── */}
            {canBid && (
                <BidFormCard
                    currency={tender.currency}
                    amount={amount}
                    busy={busy}
                    minBidStep={tender.min_bid_step}
                    startPrice={tender.start_price}
                    leaderAmount={leader?.amount}
                    onAmountChange={setAmount}
                    onSubmit={submitBid}
                    formatPrice={formatPriceLocal}
                />
            )}

            {/* ── Owner code alert ── */}
            {isOwner && ownerCode && <OwnerWinnerCodeAlert code={ownerCode} />}

            {/* ── Winner code confirmation ── */}
            {canConfirmCode && (
                <ConfirmCodeCard
                    code={confirmationCode}
                    busy={confirmBusy}
                    onCodeChange={setConfirmationCode}
                    onConfirm={confirmCode}
                />
            )}

            {/* ── Bids list ── */}
            <BidsListCard
                bids={bids}
                leader={leader}
                currency={tender.currency}
                isOwner={isOwner}
                selectingId={selectingId}
                startPrice={tender.start_price}
                buyoutPrice={tender.buyout_price}
                minBidStep={tender.min_bid_step}
                formatTime={formatTime}
                formatPrice={formatPriceLocal}
                onSelectWinner={selectWinner}
            />
        </Stack>
    );
}
