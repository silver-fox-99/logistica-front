"use client";

import { useMemo } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { FiRefreshCw } from "react-icons/fi";
import { useReferralPayouts } from "../model/useReferralPayouts";
import ResetBalancesDialog from "./ResetBalancesDialog";
import { formatIntWithDots } from "@/shared/lib/format/formatIntWithDots";

function parseIntDots(value: string, fallback = 1) {
    const cleaned = value.replace(/\./g, "").replace(/[^\d]/g, "");
    const n = Number(cleaned || fallback);
    return Number.isFinite(n) ? n : fallback;
}

export default function ReferralPayouts() {
    const {
        payoutLoading,
        payoutError,
        candidates,
        candidatesTotal,

        batchKey,
        setBatchKey,
        minBalanceCents,
        setMinBalanceCents,
        payoutNote,
        setPayoutNote,

        resetDialogOpen,
        setResetDialogOpen,
        resetting,

        loadCandidates,
        resetAllBalances,
    } = useReferralPayouts();

    const candidatesTotalFmt = useMemo(() => formatIntWithDots(candidatesTotal), [candidatesTotal]);

    return (
        <Paper sx={{ p: 2.25, borderRadius: 3 }}>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Referral Payouts
                    </Typography>

                    <Stack direction="row" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={payoutLoading ? <CircularProgress size={16} /> : <FiRefreshCw />}
                            onClick={() => void loadCandidates()}
                            disabled={payoutLoading || resetting}
                        >
                            Load list
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setResetDialogOpen(true)}
                            disabled={payoutLoading || resetting || candidates.length === 0}
                        >
                            Reset all balances
                        </Button>
                    </Stack>
                </Stack>

                {payoutError && <Alert severity="error">{payoutError}</Alert>}

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField fullWidth label="Currency" value="UZS" disabled helperText="Payout currency" />

                    <TextField
                        fullWidth
                        label="Min Balance (cents)"
                        value={formatIntWithDots(minBalanceCents)}
                        onChange={(e) => setMinBalanceCents(Math.max(1, parseIntDots(e.target.value, 1)))}
                        helperText="Minimum referral balance to include in payout list"
                        inputProps={{ inputMode: "numeric" }}
                    />

                    <TextField
                        fullWidth
                        label="Batch Key"
                        value={batchKey}
                        onChange={(e) => setBatchKey(e.target.value)}
                        placeholder="2026-02"
                        helperText="Required for idempotency (prevents double payouts)"
                    />
                </Stack>

                <TextField
                    fullWidth
                    label="Note"
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                    placeholder="Monthly referral payouts"
                />

                <Divider />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2">
                        Candidates: <b>{formatIntWithDots(candidates.length)}</b>
                    </Typography>
                    <Typography variant="body2">
                        Total (cents): <b>{candidatesTotalFmt}</b>
                    </Typography>
                </Stack>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Wallet ID</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell align="right">Balance (cents)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {candidates.map((c) => (
                                <TableRow key={`${c.wallet_id}:${c.user_id}`}>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{c.phone}</TableCell>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{c.wallet_id}</TableCell>
                                    <TableCell>{c.currency}</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: "monospace" }}>
                                        {formatIntWithDots(c.balance || "0")}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {candidates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            No candidates found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>

            <ResetBalancesDialog
                open={resetDialogOpen}
                onClose={() => setResetDialogOpen(false)}
                onConfirm={() => void resetAllBalances()}
                resetting={resetting}
                candidatesCount={candidates.length}
                totalCentsFormatted={candidatesTotalFmt}
                batchKey={batchKey.trim()}
            />
        </Paper>
    );
}
