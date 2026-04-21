import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { CompanyMemberRole } from "@/entities/company/model/types";

type Props = {
    open: boolean;
    isSubmitting?: boolean;
    submitError?: string;
    onClose: () => void;
    onSubmit: (payload: { requested_role?: CompanyMemberRole; message?: string }) => Promise<void> | void;
};

const roleOptions: CompanyMemberRole[] = ["VIEWER", "LOGIST", "MANAGER"];

export function CreateCompanyJoinRequestDialog({
                                                   open,
                                                   isSubmitting = false,
                                                   submitError = "",
                                                   onClose,
                                                   onSubmit,
                                               }: Props) {
    const [requestedRole, setRequestedRole] = useState<CompanyMemberRole>("VIEWER");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!open) {
            setRequestedRole("VIEWER");
            setMessage("");
        }
    }, [open]);

    const handleSubmit = async () => {
        await onSubmit({
            requested_role: requestedRole,
            message: message.trim() || undefined,
        });
    };

    return (
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Apply to join company</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Choose a preferred role and add a short message for the company.
                    </Typography>

                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <TextField
                        select
                        label="Requested role"
                        value={requestedRole}
                        onChange={(e) => setRequestedRole(e.target.value as CompanyMemberRole)}
                        fullWidth
                    >
                        {roleOptions.map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        multiline
                        minRows={4}
                        placeholder="Tell the company why you want to join."
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    Send request
                </Button>
            </DialogActions>
        </Dialog>
    );
}