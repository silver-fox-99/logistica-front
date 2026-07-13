import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { useDeleteCompany } from "../model/useDeleteCompany";

type Props = {
  open: boolean;
  onClose: () => void;
  companyId?: string;
  companyName?: string;
};

export function DeleteCompanyDialog({
  open,
  onClose,
  companyId,
  companyName,
}: Props) {
  const { t } = useTranslation();
  const { submit, isSubmitting, error } = useDeleteCompany(companyId);

  const handleDelete = async () => {
    await submit();
  };

  const safeCompanyName =
    companyName || t("deleteCompanyDialog.fallbackCompanyName");

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t("deleteCompanyDialog.title")}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <Trans
            i18nKey="deleteCompanyDialog.description"
            values={{ name: safeCompanyName }}
            components={{ strong: <strong /> }}
          />
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
          {t("deleteCompanyDialog.cancel")}
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isSubmitting}
          color="error"
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isSubmitting
            ? t("deleteCompanyDialog.deleting")
            : t("deleteCompanyDialog.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
