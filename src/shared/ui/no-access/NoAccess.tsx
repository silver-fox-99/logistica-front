import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import Lottie from "lottie-react";

import animationData from "./no access.json";

type Props = {
  title?: string;
  description?: string;
  to?: string;
  missingCodes?: string[];
};

export default function NoAccess({
  title = "Нет доступа",
  description = "У вас нет прав для просмотра этого раздела. Если вы считаете, что это ошибка — обратитесь к администратору.",
  to = "/admin",
  missingCodes,
}: Props) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100dvh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 2.5, md: 4 },
        }}
      >
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Box sx={{ width: 260, maxWidth: "100%" }}>
            <Lottie
              animationData={animationData as any}
              loop
              autoplay
              style={{ width: "100%", height: "auto" }}
            />
          </Box>

          <Stack spacing={1} sx={{ maxWidth: 560 }}>
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>

            {missingCodes?.length ? (
              <Box
                sx={{
                  mt: 1,
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Не хватает прав:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    mt: 0.5,
                    wordBreak: "break-word",
                  }}
                >
                  {missingCodes.join(", ")}
                </Typography>
              </Box>
            ) : null}
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ pt: 1, width: "100%", justifyContent: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<FiArrowLeft />}
              onClick={() => navigate(-1)}
              sx={{ minWidth: 180 }}
            >
              Назад
            </Button>

            <Button
              variant="contained"
              startIcon={<FiHome />}
              onClick={() => navigate(to)}
              sx={{ minWidth: 220 }}
            >
              На главную админки
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
