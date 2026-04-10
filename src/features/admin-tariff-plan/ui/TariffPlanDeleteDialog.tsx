import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { FiTrash2, FiX } from "react-icons/fi";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function TariffPlanDeleteDialog({
                                           open,
                                           loading,
                                           onClose,
                                           onConfirm,
                                       }: Props) {
    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Удалить тарифный план?</DialogTitle>

            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary">
                    Тариф будет удалён без возможности восстановления.
                    Используйте это действие только если вы уверены, что он больше не нужен.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined" disabled={loading}>
                    Отмена
                </Button>

                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    startIcon={<FiTrash2 />}
                    disabled={loading}
                >
                    Удалить навсегда
                </Button>
            </DialogActions>
        </Dialog>
    );
}