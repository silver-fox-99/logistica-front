

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
            <DialogTitle>Обнулить все реферальные балансы?</DialogTitle>
            <DialogContent>
                <Stack spacing={1.25} sx={{ mt: 1 }}>
                    <Alert severity="warning">
                        Будут созданы транзакции <b>DEBIT</b> с причиной <b>REFERRAL_PAYOUT</b> для всех кандидатов,
                        и их реферальный баланс будет уменьшен до нуля.
                    </Alert>

                    <Typography variant="body2">
                        Кандидаты: <b>{candidatesCount}</b>
                    </Typography>
                    <Typography variant="body2">
                        Итого (центы): <b>{totalCentsFormatted}</b>
                    </Typography>
                    <Typography variant="body2">
                        Batch key: <b>{batchKey || "—"}</b>
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={resetting}>
                    Отмена
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    disabled={resetting}
                    startIcon={resetting ? <CircularProgress size={16} /> : undefined}
                >
                    Подтвердить обнуление
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default React.memo(ResetBalancesDialog);
