"use client";

import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

import type { IntegrationTokenItem } from "@/entities/integration/model/types";

type Props = {
    open: boolean;
    item: IntegrationTokenItem | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const DeleteIntegrationTokenDialog = React.memo(function DeleteIntegrationTokenDialog({
                                                                                                 open,
                                                                                                 item,
                                                                                                 loading,
                                                                                                 onClose,
                                                                                                 onConfirm,
                                                                                             }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Delete token</DialogTitle>

            <DialogContent>
                <Typography variant="body2">
                    Are you sure you want to delete this integration token?
                </Typography>

                {item && (
                    <Typography variant="body2" fontWeight={700} sx={{ mt: 1.5 }}>
                        {item.name}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
});