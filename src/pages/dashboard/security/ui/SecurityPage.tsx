import { AddEmailCard } from "@/features/security/add-emal/ui/AddEmailCard";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { ChangePasswordCard } from "@/features/security/add-emal/ui/ChangePassword.tsx";
import { BindPhoneCard } from "@/features/security/add-emal/ui/BindPhoneCard";
import TelegramBindingCard from "@/features/profile/ui/TelegramBindingCard.tsx";
import NotificationSettingsCard from "@/features/profile/ui/NotificationSettingsCard.tsx";
import { useTranslation } from "react-i18next";

export default function SecurityPage() {
  const { t } = useTranslation();
  const agreementUrl = "/docs/user-agreement.pdf";

  return (
    <Stack spacing={3}>
      <AddEmailCard />
      <BindPhoneCard />
      <ChangePasswordCard />
      <TelegramBindingCard />
      <NotificationSettingsCard />
      <Paper
        variant="outlined"
        sx={{ borderRadius: "16px", borderColor: "divider" }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={700}>
              {t("security.userAgreementTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("security.userAgreementDescription")}
            </Typography>
            <Button
              component="a"
              href={agreementUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                borderRadius: "8px",
                px: 2.5,
                height: 44,
              }}
            >
              {t("security.userAgreementOpen")}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Stack>
  );
}
