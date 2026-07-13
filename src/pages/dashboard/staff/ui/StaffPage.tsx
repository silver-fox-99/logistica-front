import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { FiUsers, FiHome, FiUserPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import animation from "./SearchForUsers.json";

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>
        {items.map((it, idx) => (
          <Typography key={idx} variant="body2" color="text.secondary">
            • {it}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

export default function StaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 120px)",
        display: "grid",
        alignItems: "start",
        py: 3,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack
                spacing={3}
                direction={{ xs: "column", md: "row" }}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: { xs: "100%", md: "45%" },
                    maxWidth: 520,
                    mx: "auto",
                  }}
                >
                  <Lottie
                    animationData={animation}
                    loop
                    style={{ width: "100%", height: "auto" }}
                  />
                </Box>
                <Stack spacing={1.5} sx={{ flex: 1, width: "100%" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FiUsers />
                    <Typography variant="h5" fontWeight={600}>
                      {t("staff.title")}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" color="text.secondary">
                    {t("staff.description")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("staff.meanwhile")}
                  </Typography>

                  <Stack
                    direction="column"
                    spacing={1.25}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    <Button
                      onClick={() => navigate("/dashboard/staff/invite")}
                      sx={{
                        height: 48,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.75,
                        gap: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        color: "#fff",
                        bgcolor: "primary.main",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "primary.dark",
                          boxShadow: "none",
                        },
                        width: "100%",
                      }}
                    >
                      <FiUserPlus size={18} />
                      {t("staff.inviteButton")}
                    </Button>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      sx={{
                        height: 48,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.75,
                        gap: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        color: "text.primary",
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "action.hover",
                          borderColor: "primary.main",
                        },
                        width: "100%",
                      }}
                    >
                      <FiHome size={18} color="#4472B8" />
                      {t("staff.backButton")}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={1.5}>
                <InfoBox
                  title={t("staff.comingSoonTitle")}
                  items={[
                    t("staff.comingSoon1"),
                    t("staff.comingSoon2"),
                    t("staff.comingSoon3"),
                  ]}
                />
                <InfoBox
                  title={t("staff.actionsTitle")}
                  items={[
                    t("staff.action1"),
                    t("staff.action2"),
                    t("staff.action3"),
                  ]}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
