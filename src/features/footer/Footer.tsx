import { useState, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Stack,
  Link as MuiLink,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

import logo from "../header/logo.svg";
import { useUserStore } from "@/entities/user/model/user.store";

export default function Footer() {
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);

  const externalLinkProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    target: "_blank",
    rel: "noreferrer",
  };

  const docs = {
    about: "/about-company.pdf",
    intro: "/introduction.pdf",
    security: "/account-security.pdf",
    terms: "/docs/user-agreement.pdf",
    billing: "/payments-billing.pdf",
  };

  const phoneNumbers = ["+998 94 986 68 86", "+998 78 113 67 55"];
  const email = "info@yologistic.uz";
  const user = useUserStore((s) => s.user);
  const isAuthenticated = !!user;

  const handleContactClick = (
    e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    setContactOpen(true);
  };

  // Общие стили для ссылок в футере
  const linkStyles = {
    color: "rgba(255, 255, 255, 0.8)",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "color 0.2s ease-in-out",
    cursor: "pointer",
    display: "inline-block",
    "&:hover": {
      color: "#FFFFFF",
    },
  };

  return (
    <Box
      component="footer"
      id="footer"
      sx={{
        bgcolor: "primary.main",
        color: "#FFFFFF",
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 2 }} alignItems="flex-start">
          {/* Колонка 1: Логотип и Бренд */}
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <Stack
              spacing={2}
              sx={{ alignItems: { xs: "center", sm: "flex-start" } }}
            >
              <MuiLink
                component={RouterLink}
                to="/"
                aria-label="Go to home"
                sx={{ display: "inline-block" }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="Yangi Osiyo Logistikasi Logo"
                  sx={{ height: 90, width: "auto", display: "block" }}
                />
              </MuiLink>
            </Stack>
          </Grid>

          {/* Колонка 2: Контакты */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                mb: 2,
                fontSize: "1rem",
              }}
            >
              {t("footer.contacts", "Контакты")}
            </Typography>
            <Stack spacing={1.5}>
              <MuiLink href={`mailto:${email}`} sx={linkStyles}>
                {email}
              </MuiLink>
              {phoneNumbers.map((num) => (
                <MuiLink
                  key={num}
                  href={`tel:${num.replace(/\s+/g, "")}`}
                  sx={linkStyles}
                >
                  {num}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Колонка 3: Компания */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                mb: 2,
                fontSize: "1rem",
              }}
            >
              {t("footer.companyHeader", "Компания")}
            </Typography>
            <Stack spacing={1.5} alignItems="flex-start">
              <MuiLink href={docs.about} {...externalLinkProps} sx={linkStyles}>
                {t("footer.aboutPlatform", "Информация о платформе")}
              </MuiLink>

              {isAuthenticated ? (
                <MuiLink
                  component={RouterLink}
                  to="/dashboard/help"
                  sx={linkStyles}
                >
                  {t("footer.askAndAnswer", "Вопросы и ответы")}
                </MuiLink>
              ) : (
                <MuiLink href="/help" {...externalLinkProps} sx={linkStyles}>
                  {t("footer.askAndAnswer", "Вопросы и ответы")}
                </MuiLink>
              )}

              <MuiLink
                href={docs.billing}
                {...externalLinkProps}
                sx={linkStyles}
              >
                {t("footer.billingHeader", "Платежи и биллинг")}
              </MuiLink>

              <MuiLink
                component="button"
                type="button"
                onClick={handleContactClick}
                sx={{
                  ...linkStyles,
                  border: "none",
                  background: "none",
                  p: 0,
                  textAlign: "left",
                }}
              >
                {t("footer.supportHeader", "Поддержка")}
              </MuiLink>
            </Stack>
          </Grid>

          {/* Колонка 4: Условия и политика */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                mb: 2,
                fontSize: "1rem",
              }}
            >
              {t("footer.termsAndPolicies", "Условия и политика")}
            </Typography>
            <Stack spacing={1.5}>
              <MuiLink href={docs.intro} {...externalLinkProps} sx={linkStyles}>
                {t("footer.termsOfUse", "Условия использования")}
              </MuiLink>
              <MuiLink href={docs.terms} {...externalLinkProps} sx={linkStyles}>
                {t("footer.privacyPolicy", "Политика конфиденциальности")}
              </MuiLink>
              <MuiLink
                href={docs.security}
                {...externalLinkProps}
                sx={linkStyles}
              >
                {t("footer.accountSecurity", "Безопасность аккаунта")}
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>

        <Stack
          direction="row"
          spacing={1}
          justifyContent={{ xs: "center", md: "flex-end" }}
          sx={{ mt: 4, mb: 2 }}
        >
          <IconButton
            component="a"
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            sx={{
              color: "#FFFFFF",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <FaFacebookF size={18} />
          </IconButton>

          <IconButton
            component="a"
            href="https://www.instagram.com/yologisticuz/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            sx={{
              color: "#FFFFFF",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <FaInstagram size={18} />
          </IconButton>

          <IconButton
            component="a"
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            sx={{
              color: "#FFFFFF",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <FaLinkedinIn size={18} />
          </IconButton>
        </Stack>

        {/* Копирайт */}
        <Typography
          variant="body2"
          sx={{
            pt: 4,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.85rem",
          }}
        >
          © 2025-2026 Yangi Osiyo Logistikasi. All rights reserved.
        </Typography>
      </Container>

      {/* Модальное окно Поддержки / Контактов на компонентах MUI */}
      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        aria-labelledby="contact-dialog-title"
        PaperProps={{
          sx: { borderRadius: "16px", p: 1, minWidth: "280px" },
        }}
      >
        <DialogTitle id="contact-dialog-title" sx={{ fontWeight: 700 }}>
          {t("footer.contacts", "Контакты")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {phoneNumbers.map((num) => (
              <MuiLink
                key={num}
                href={`tel:${num.replace(/\s+/g, "")}`}
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "1.1rem",
                }}
              >
                {num}
              </MuiLink>
            ))}
            <MuiLink
              href={`mailto:${email}`}
              sx={{ color: "text.primary", textDecoration: "none" }}
            >
              {email}
            </MuiLink>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setContactOpen(false)}
            variant="outlined"
            color="primary"
            fullWidth
          >
            {t("header.close", "Закрыть")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
