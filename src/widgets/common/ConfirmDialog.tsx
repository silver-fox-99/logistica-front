import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

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
                                          open, title, message,
                                          confirmText, cancelText,
                                          onClose, onConfirm
                                      }: Props) {
    const { t } = useTranslation();
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            {!!title && <DialogTitle>{title}</DialogTitle>}
            {!!message && (
                <DialogContent>
                    <Typography variant="body2">{message}</Typography>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={onClose}>{cancelText || t('shipments.confirmDialog.defaultCancel')}</Button>
                <Button color="error" variant="contained" onClick={onConfirm}>{confirmText || t('shipments.confirmDialog.defaultConfirm')}</Button>
            </DialogActions>
        </Dialog>
    );
}
