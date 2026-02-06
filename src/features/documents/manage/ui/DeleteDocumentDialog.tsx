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
            <DialogTitle>Delete document version</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete <b>{doc?.key}</b> version <b>v{doc?.version}</b>?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button color="error" variant="contained" onClick={() => void onConfirm()}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
});
