import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    saving: boolean;
};

function DeleteSettingsDialog({ open, onClose, onConfirm, saving }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Удалить настройки?</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Это действие нельзя отменить.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Отмена
                </Button>
                <Button color="error" variant="contained" onClick={onConfirm} disabled={saving}>
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default React.memo(DeleteSettingsDialog);
