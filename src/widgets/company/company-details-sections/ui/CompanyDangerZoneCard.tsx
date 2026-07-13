import { Button, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  onDeleteClick: () => void;
};

export function CompanyDangerZoneCard({ onDeleteClick }: Props) {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "16px",
        borderColor: "error.light",
        p: { xs: 2.5, md: 3 },
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={600}>
            {t("companyDangerZone.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("companyDangerZone.description")}
          </Typography>
        </Stack>

        <Button
          color="error"
          variant="contained"
          onClick={onDeleteClick}
          sx={{
            height: 44,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            alignSelf: "flex-start",
          }}
        >
          {t("companyDangerZone.deleteButton")}
        </Button>
      </Stack>
    </Paper>
  );
}
