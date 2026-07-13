import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
};

export function AdminDeleteCompanyDialog({
  open,
  onClose,
  companyId,
  companyName,
}: Props) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await adminCompaniesApi.delete(companyId);
      navigate("/admin/companies");
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Не удалось удалить компанию.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Удаление компании</DialogTitle>

      <DialogContent>
        <Typography sx={{ mt: 1 }}>
          Вы уверены, что хотите удалить компанию <strong>{companyName}</strong>
          ?
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ textTransform: "none" }}
        >
          Отмена
        </Button>

        <Button
          onClick={handleDelete}
          disabled={isSubmitting}
          color="error"
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isSubmitting ? "Удаление..." : "Удалить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
