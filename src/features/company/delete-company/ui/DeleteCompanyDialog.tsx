import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useDeleteCompany } from "../model/useDeleteCompany";

type Props = {
    open: boolean;
    onClose: () => void;
    companyId?: string;
    companyName?: string;
};

export function DeleteCompanyDialog({ open, onClose, companyId, companyName }: Props) {
    const { submit, isSubmitting, error } = useDeleteCompany(companyId);

    const handleDelete = async () => {
        await submit();
    };

    return (
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Delete company</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Are you sure you want to delete <strong>{companyName || "this company"}</strong>?
                    This action cannot be undone.
                </Typography>

                {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ textTransform: "none" }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    color="error"
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 700 }}
                >
                    {isSubmitting ? "Deleting..." : "Delete company"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}