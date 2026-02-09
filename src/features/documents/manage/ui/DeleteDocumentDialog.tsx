import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { DocumentEntity } from "@/entities/document/model/types";

type Props = {
    open: boolean;
    doc?: DocumentEntity | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export const DeleteDocumentDialog = React.memo(function DeleteDocumentDialog({ open, doc, onClose, onConfirm }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Удалить версию документа</DialogTitle>
            <DialogContent>
                <Typography>
                    Вы уверены, что хотите удалить документ <b>{doc?.key}</b> версии <b>v{doc?.version}</b>?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Отмена
                </Button>
                <Button color="error" variant="contained" onClick={() => void onConfirm()}>
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
});
