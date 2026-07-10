import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthTop from "@/shared/ui/auth/auth-top.tsx";
import LoginForm from "@/features/login/ui/LoginForm.tsx";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 16,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        {/* Верхняя часть с иконкой и заголовками */}
        <AuthTop
          icon={true}
          title={t("loginPage.title")}
          subtitle={t("loginPage.subtitle")}
        />

        {/* Форма входа */}
        <LoginForm />

        {/* Нижний блок ссылки на регистрацию */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            mt: 5,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("loginPage.needToRegister")}
          </Typography>
          <MuiLink
            component={RouterLink}
            to="/register"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "1rem",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {t("loginPage.register")}
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
}
