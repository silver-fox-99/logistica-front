import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { FiX, FiCreditCard } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function PaymentWarningDialog({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="payment-warning-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        },
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{ m: 0, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "rgba(2, 136, 209, 0.08)",
            color: "info.main",
          }}
        >
          <FiCreditCard size={20} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={600}
          component="div"
          sx={{ flexGrow: 1 }}
        >
          {t("paymentsNew.paymentWarningDialog.title", "Информация об оплате")}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <FiX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2.5, py: 1 }}>
        <Typography
          id="payment-warning-dialog-description"
          variant="body1"
          sx={{ color: "text.secondary", lineHeight: 1.6 }}
        >
          {t(
            "paymentsNew.cardBindingTip",
            "💡 Хотите оплатить без привязки карты? В окне платежной системы выберите любой альтернативный метод оплаты вместо сохранения карты.",
          )}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "grey.300",
            "&:hover": {
              borderColor: "grey.400",
              bgcolor: "grey.50",
            },
          }}
        >
          {t("paymentsNew.paymentWarningDialog.cancel", "Отмена")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          autoFocus
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          {t("paymentsNew.paymentWarningDialog.confirm", "Перейти к оплате")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
