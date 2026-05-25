import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    open: boolean;
    title: string;
    busy: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function TenderCancelDialog({
                                       open,
                                       title,
                                       busy,
                                       onClose,
                                       onConfirm,
                                   }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("tenders.settings.cancelDialogTitle")}</DialogTitle>

            <DialogContent>
                <Typography variant="body2">
                    {t("tenders.settings.cancelDialogText", { title })}
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>{t("tenders.common.back")}</Button>

                <Button color="error" variant="contained" onClick={onConfirm} disabled={busy}>
                    {busy ? t("tenders.settings.cancelling") : t("tenders.settings.cancelTender")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}