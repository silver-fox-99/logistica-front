"use client";

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
            <DialogTitle>Delete settings?</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button color="error" variant="contained" onClick={onConfirm} disabled={saving}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default React.memo(DeleteSettingsDialog);
