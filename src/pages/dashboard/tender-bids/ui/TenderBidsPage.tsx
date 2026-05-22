import { useState } from "react";
import {Alert, Avatar, Box, Button, Chip, Grid, Paper, Stack, TextField, Typography} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import type { TenderBid } from "@/entities/tender/model/types";
import { tendersApi } from "@/shared/api/tendersApi.ts";
import { rememberPendingOwnerTender } from "@/entities/tender/model/pendingOwnerTenders";
import {FiAward, FiCalendar, FiEdit3, FiPhone, FiTruck, FiUserCheck} from "react-icons/fi";

function sortedBids(bids: TenderBid[]) {
    return [...bids].sort((a, b) => {
        const byAmount = Number(a.amount) - Number(b.amount);
        if (byAmount !== 0) return byAmount;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
}

export default function TenderBidsPage() {
    const { t, i18n } = useTranslation();
    const { tender, reload, isOwner, canBid, canConfirmCode, ownerCode, setOwnerCode } = useOutletContext<TenderWorkspaceContext>();
    const [amount, setAmount] = useState("");
    const [transportDetails, setTransportDetails] = useState("");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [selectingId, setSelectingId] = useState("");
    const fmtTime = (value?: string | null) =>
        value
            ? new Date(value).toLocaleString(i18n.language, {
                dateStyle: "short",
                timeStyle: "short",
                hour12: false,
            })
            : t("tenders.common.empty");

    const bids = sortedBids(tender.bids ?? []);
    const leader = bids[0];

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
            if (result?.owner_code) setOwnerCode(result.owner_code);
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
            await tendersApi.confirmCode(tender.id, { code: confirmationCode.trim() });
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
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>{t("tenders.bids.yourBid")}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("tenders.bids.description")}
                        </Typography>
                    </Box>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label={t("tenders.bids.amount", { currency: tender.currency })}
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                label={t("tenders.bids.transportDetails")}
                                value={transportDetails}
                                onChange={(event) => setTransportDetails(event.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <Stack direction="row" justifyContent="flex-end">
                        <Button variant="contained" onClick={submitBid} disabled={busy}>
                            {busy ? t("tenders.common.saving") : t("tenders.bids.submit")}
                        </Button>
                    </Stack>
                </Stack>
                </Paper>
            )}

            {isOwner && ownerCode && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                    <Typography fontWeight={800}>{t("tenders.bids.winnerCodeTitle")}: {ownerCode}</Typography>
                    <Typography variant="body2">{t("tenders.bids.winnerCodeDescription")}</Typography>
                </Alert>
            )}

            {canConfirmCode && (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>{t("tenders.bids.codePanelTitle")}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("tenders.bids.codePanelDescription")}
                            </Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <TextField
                                label={t("tenders.bids.code")}
                                value={confirmationCode}
                                onChange={(event) => setConfirmationCode(event.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" onClick={confirmCode} disabled={confirmBusy} sx={{ minWidth: 180 }}>
                                {confirmBusy ? t("tenders.common.saving") : t("tenders.bids.confirmCode")}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>{t("tenders.bids.currentOffers")}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("tenders.bids.rule")}
                            </Typography>
                        </Box>
                        {leader && (
                            <Chip
                                color="success"
                                label={t("tenders.bids.leader", { amount: leader.amount, currency: tender.currency })}
                            />
                        )}
                    </Stack>

                    {!bids.length && (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            {t("tenders.bids.empty")}
                        </Alert>
                    )}

                    {bids.map((bid, index) => {
                        const isLeader = bid.id === leader?.id;

                        const bidderName = bid.bidder
                            ? [bid.bidder.first_name, bid.bidder.last_name].filter(Boolean).join(" ")
                            : t("tenders.bids.unknownBidder", "Unknown bidder");

                        return (
                            <Paper
                                key={bid.id}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    borderColor: isLeader ? "success.light" : "divider",
                                    bgcolor: isLeader ? "success.50" : "background.paper",
                                }}
                            >
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "stretch", md: "center" }}
                                    gap={2}
                                >
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Avatar
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                bgcolor: isLeader ? "success.main" : "grey.100",
                                                color: isLeader ? "common.white" : "text.primary",
                                                fontWeight: 800,
                                            }}
                                        >
                                            {index + 1}
                                        </Avatar>

                                        <Stack spacing={1}>
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                {isLeader && <FiAward size={20} color="#2e7d32" />}

                                                <Typography variant="h6" fontWeight={800}>
                                                    {bid.amount} {tender.currency}
                                                </Typography>

                                                {isLeader && (
                                                    <Chip
                                                        size="small"
                                                        color="success"
                                                        label={t("tenders.bids.currentLeader")}
                                                    />
                                                )}
                                            </Stack>

                                            <Stack spacing={0.5}>
                                                <Typography variant="body1" fontWeight={700}>
                                                    {bidderName}
                                                </Typography>

                                                {bid.bidder?.phone && (
                                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                                        <FiPhone size={15} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {bid.bidder.phone}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Stack>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                sx={{
                                                    width: "fit-content",
                                                    px: 1.25,
                                                    py: 0.75,
                                                    borderRadius: 1,
                                                    bgcolor: "grey.100",
                                                }}
                                            >
                                                <FiTruck size={16} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {bid.transport_details || t("tenders.bids.transportEmpty")}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" spacing={1.25} flexWrap="wrap" color="text.secondary">
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <FiCalendar size={14} />
                                                    <Typography variant="caption">
                                                        {t("tenders.bids.createdAt", { value: fmtTime(bid.created_at) })}
                                                    </Typography>
                                                </Stack>

                                                {bid.last_changed_at && (
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <FiEdit3 size={14} />
                                                        <Typography variant="caption">
                                                            {t("tenders.bids.changedAt", { value: fmtTime(bid.last_changed_at) })}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Stack>

                                    {isOwner && (
                                        <Button
                                            variant={isLeader ? "contained" : "outlined"}
                                            size="small"
                                            startIcon={<FiUserCheck />}
                                            onClick={() => selectWinner(bid.id)}
                                            disabled={!!selectingId}
                                            sx={{
                                                alignSelf: { xs: "flex-start", md: "center" },
                                                minWidth: 0,
                                                px: 2,
                                                py: 0.85,
                                                borderRadius: 1,
                                                textTransform: "none",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {selectingId === bid.id
                                                ? t("tenders.bids.selecting")
                                                : t("tenders.bids.selectWinner")}
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            </Paper>
        </Stack>
    );
}

