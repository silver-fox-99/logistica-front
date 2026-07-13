import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FiArrowUpRight, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";

import animationData from "@/widgets/shipment-details/order-details-limit/animations/limit.json";

type Props = {
  open: boolean;
  onClose: () => void;
  titleKey: string;
  descriptionKey: string;
  buttonKey?: string;
};

export function LimitReachedModal({
  open,
  onClose,
  titleKey,
  descriptionKey,
  buttonKey = "limits.goToPayments",
}: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoToPayments = () => {
    onClose();
    navigate("/dashboard/payments");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Box sx={{ alignSelf: "flex-end" }}>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label={t("common.close", "Close")}
            >
              <FiX />
            </IconButton>
          </Box>

          <Box sx={{ width: 220, maxWidth: "100%", mt: -2 }}>
            <Lottie animationData={animationData} loop autoplay />
          </Box>

          <Stack spacing={1} alignItems="center" sx={{ maxWidth: 480 }}>
            <Typography variant="h5" fontWeight={800}>
              {t(titleKey)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {t(descriptionKey)}
            </Typography>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={handleGoToPayments}
            startIcon={<FiArrowUpRight />}
            sx={{
              maxWidth: 320,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              minHeight: 44,
            }}
          >
            {t(buttonKey)}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
