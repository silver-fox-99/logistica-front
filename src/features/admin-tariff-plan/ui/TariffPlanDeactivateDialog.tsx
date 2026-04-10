import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { BiBlock } from "react-icons/bi";
import { FiX } from "react-icons/fi";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function TariffPlanDeactivateDialog({
                                               open,
                                               loading,
                                               onClose,
                                               onConfirm,
                                           }: Props) {
    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Отключить тарифный план?</DialogTitle>

            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary">
                    После отключения этот тариф нельзя будет выбрать при новой подписке.
                    Уже подключённые пользователи не пострадают.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined" disabled={loading}>
                    Отмена
                </Button>

                <Button
                    color="warning"
                    variant="contained"
                    onClick={onConfirm}
                    startIcon={<BiBlock />}
                    disabled={loading}
                >
                    Отключить тариф
                </Button>
            </DialogActions>
        </Dialog>
    );
}