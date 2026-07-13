import { memo, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Checkbox,
  Typography,
} from "@mui/material";
import { FiCheckCircle, FiFileText } from "react-icons/fi";
import type { ReferralAgreement } from "@/entities/referralProgram";
import { useTranslation } from "react-i18next";

type Props = {
  agreement: ReferralAgreement;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSign: () => void;
  loadingContent?: boolean;
};

function AgreementCardBase({
  agreement,
  open,
  onOpen,
  onClose,
  onSign,
  loadingContent,
}: Props) {
  const [accepted, setAccepted] = useState(false);
  const { t } = useTranslation();

  const chip = useMemo(() => {
    if (agreement.isSigned) {
      return {
        label: t("referralProgram.agreement.status.signed"),
        color: "success" as const,
        icon: <FiCheckCircle />,
      };
    }
    return {
      label: t("referralProgram.agreement.status.notSigned"),
      color: "warning" as const,
      icon: <FiFileText />,
    };
  }, [agreement.isSigned, t]);

  const onToggle = useCallback((_: any, v: boolean) => setAccepted(v), []);
  const onSignClick = useCallback(() => {
    if (!accepted) return;
    onSign();
  }, [accepted, onSign]);

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.25 },
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          bgcolor: "background.paper",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: "rgba(15, 95, 194, 0.08)",
                  color: "primary.main",
                }}
              >
                <FiFileText />
              </Box>
              <Typography fontWeight={800}>
                {t("referralProgram.agreement.title")}
              </Typography>
            </Stack>

            <Chip
              icon={chip.icon}
              label={chip.label}
              color={chip.color}
              variant="outlined"
              sx={{ borderRadius: "8px" }}
            />
          </Stack>

          {!agreement.isSigned ? (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t("referralProgram.agreement.description.notSigned")}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t("referralProgram.agreement.description.signed")}
            </Typography>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ pt: 0.5 }}
          >
            <Button
              variant="outlined"
              onClick={onOpen}
              sx={{
                justifyContent: "center",
                height: 38,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("referralProgram.agreement.actions.view")}
            </Button>

            {!agreement.isSigned && (
              <Button
                variant="contained"
                onClick={onSignClick}
                disabled={!accepted}
                sx={{
                  justifyContent: "center",
                  height: 38,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {t("referralProgram.agreement.actions.sign")}
              </Button>
            )}
          </Stack>

          {!agreement.isSigned && (
            <FormControlLabel
              control={<Checkbox checked={accepted} onChange={onToggle} />}
              label={t("referralProgram.agreement.acceptTerms")}
            />
          )}
        </Stack>
      </Paper>

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {agreement.documentTitle}
        </DialogTitle>
        <DialogContent dividers>
          {loadingContent ? (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {t("common.loading")}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", opacity: 0.85 }}
            >
              {agreement.content ||
                t("referralProgram.agreement.contentUnavailable")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              height: 36,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const AgreementCard = memo(AgreementCardBase);
