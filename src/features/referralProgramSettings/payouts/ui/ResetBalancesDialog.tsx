"use client";

import React from "react";
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    resetting: boolean;

    candidatesCount: number;
    totalCentsFormatted: string;
    batchKey: string;
};

function ResetBalancesDialog({
                                 open,
                                 onClose,
                                 onConfirm,
                                 resetting,
                                 candidatesCount,
                                 totalCentsFormatted,
                                 batchKey,
                             }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reset all referral balances?</DialogTitle>
            <DialogContent>
                <Stack spacing={1.25} sx={{ mt: 1 }}>
                    <Alert severity="warning">
                        This will create DEBIT transactions with reason <b>REFERRAL_PAYOUT</b> for all candidates and reduce their referral balances to zero.
                    </Alert>

                    <Typography variant="body2">
                        Candidates: <b>{candidatesCount}</b>
                    </Typography>
                    <Typography variant="body2">
                        Total (cents): <b>{totalCentsFormatted}</b>
                    </Typography>
                    <Typography variant="body2">
                        Batch key: <b>{batchKey || "—"}</b>
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={resetting}>
                    Cancel
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    disabled={resetting}
                    startIcon={resetting ? <CircularProgress size={16} /> : undefined}
                >
                    Confirm reset
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default React.memo(ResetBalancesDialog);
