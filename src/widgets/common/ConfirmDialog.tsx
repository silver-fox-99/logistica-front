import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

type Props = {
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmDialog({
                                          open, title = "Confirm action", message = "Are you sure?",
                                          confirmText = "Confirm", cancelText = "Cancel",
                                          onClose, onConfirm
                                      }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            {!!title && <DialogTitle>{title}</DialogTitle>}
            {!!message && (
                <DialogContent>
                    <Typography variant="body2">{message}</Typography>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={onClose}>{cancelText}</Button>
                <Button color="error" variant="contained" onClick={onConfirm}>{confirmText}</Button>
            </DialogActions>
        </Dialog>
    );
}
