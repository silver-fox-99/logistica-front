import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Toolbar,
  Container,
  Avatar,
  IconButton,
  useMediaQuery,
  Box,
  Drawer,
  Stack,
  Button,
  Typography,
  Link,
} from "@mui/material";
import { FiMenu } from "react-icons/fi";

import logoBlue from "./logo-blue.svg";
import { useUserStore } from "@/entities/user/model/user.store.ts";
import LanguageSwitcher from "@/shared/ui/language-switcher/LanguageSwitcher";
import HeaderNotificationsPopover from "@/features/user-notifications/ui/HeaderNotificationsPopover";
import UserSearch from "@/features/user-search/ui/UserSearch";

export default function Header({
  isAuthenticated,
  onMenuClick,
  showBurger,
}: {
  isAuthenticated?: boolean;
  onMenuClick?: () => void;
  showBurger?: boolean;
}) {
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:860px)");
  const [menuOpen, setMenuOpen] = useState(false);

  // Функция генерации уникального цвета для аватара
  function stringToColor(string: string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringAvatar(name: string) {
    const fallbackName = name.trim() ? name : "User";
    const parts = fallbackName.split(" ").filter(Boolean);
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`
        : `${parts[0][0] || ""}`;

    return {
      sx: { bgcolor: stringToColor(fallbackName) },
      children: initials.toUpperCase(),
    };
  }

  const logoHref = "/";
  const avatarProps = stringAvatar(
    `${user?.first_name || ""} ${user?.last_name || ""}`,
  );

  const navItems = [
    { label: t("header.about", "О компании"), targetId: "benefits" },
    {
      label: t("header.howItWorks", "Как работает платформа"),
      targetId: "listings",
    },
    { label: t("header.tariffs", "Тарифы"), targetId: "tariffs" },
    { label: t("header.faq", "Вопросы и ответы"), targetId: "faq" },
    { label: t("header.contacts", "Контакты"), targetId: "footer" },
  ];

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.location.href = `/#${targetId}`;
    }
  };

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        maxWidth: "1200px",
        margin: "0 auto",
        left: 0,
        right: 0,
        top: 20,
        zIndex: (theme) => theme.zIndex.drawer - 1,
        borderRadius: { xs: 0, md: "12px" },
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", height: 72 }}
        >
          {/* 1. Левая колонка: Логотип */}
          <Box
            component={RouterLink}
            to={logoHref}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box
              component="img"
              src={logoBlue}
              alt="logo"
              sx={{ height: 32, width: "auto" }}
            />
          </Box>

          {/* 2. Центральная колонка: Навигация (только десктоп и для гостей) */}
          {!isMobile && !isAuthenticated && (
            <Stack component="nav" direction="row" spacing={3}>
              {navItems.map((item) => (
                <Link
                  key={item.targetId}
                  href={`#${item.targetId}`}
                  onClick={(e) => handleNavClick(e, item.targetId)}
                  underline="none"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "color 0.2s",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          )}

          {/* 3. Правая колонка: Действия */}
          <Stack direction="row" spacing={2} alignItems="center">
            {isAuthenticated ? (
              <>
                <UserSearch />
                {!isMobile && (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary", fontWeight: 700 }}
                  >
                    {user?.first_name} {user?.last_name}
                  </Typography>
                )}
                <HeaderNotificationsPopover />
                <Avatar
                  {...avatarProps}
                  component={RouterLink}
                  to="/dashboard/profile"
                  aria-label="Open profile"
                  sx={{
                    cursor: "pointer",
                    width: 36,
                    height: 36,
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    ...(avatarProps.sx || {}),
                  }}
                />
              </>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="outlined"
                      color="primary"
                    >
                      {t("header.login")}
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      color="primary"
                    >
                      {t("header.register")}
                    </Button>
                  </>
                )}
              </>
            )}

            <LanguageSwitcher />

            {/* Бургер-меню для мобилок или сайдбара */}
            {(isMobile || isAuthenticated) && (
              <IconButton
                aria-label="Open menu"
                onClick={() => {
                  if (showBurger && onMenuClick) {
                    onMenuClick();
                  } else {
                    setMenuOpen(true);
                  }
                }}
                color="inherit"
                sx={{ color: "text.primary", p: 0.5 }}
              >
                <FiMenu size={24} />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </Container>

      {/* Мобильный Drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: 300, p: 3, backgroundImage: "none" } }}
        ModalProps={{ keepMounted: true }}
      >
        <Stack spacing={3} sx={{ height: "100%" }}>
          {isAuthenticated ? (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ pb: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Avatar
                {...avatarProps}
                sx={{
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  ...(avatarProps.sx || {}),
                }}
              />
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  noWrap
                  sx={{ color: "text.primary", lineHeight: 1.2 }}
                >
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: "block", mt: 0.5 }}
                >
                  {user?.email || ""}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box
              sx={{ pb: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Box
                component="img"
                src={logoBlue}
                alt="logo"
                sx={{ maxHeight: 36, width: "auto" }}
              />
            </Box>
          )}

          {/* Навигация в Drawer */}
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={1}
              sx={{ px: 1, mb: 1 }}
            >
              {t("header.navigation", "Навигация")}
            </Typography>
            {navItems.map((item) => (
              <Button
                key={item.targetId}
                onClick={(e) => {
                  setMenuOpen(false);
                  handleNavClick(e, item.targetId);
                }}
                sx={{
                  textTransform: "none",
                  color: "text.secondary",
                  justifyContent: "flex-start",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  py: 1,
                  px: 1.5,
                  borderRadius: "8px",
                  "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Авторизационные кнопки в Drawer */}
          <Stack
            spacing={1.5}
            sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2.5 }}
          >
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/dashboard/profile"
                variant="outlined"
                fullWidth
                onClick={() => setMenuOpen(false)}
                sx={{ py: 1.2 }}
              >
                {t("header.goToProfile", "Перейти в профиль")}
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  onClick={() => setMenuOpen(false)}
                  sx={{ py: 1.2 }}
                >
                  {t("header.login")}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  fullWidth
                  onClick={() => setMenuOpen(false)}
                  sx={{ py: 1.2 }}
                >
                  {t("header.register")}
                </Button>
              </>
            )}
            <Box sx={{ pt: 1, display: "flex", justifyContent: "center" }}>
              <LanguageSwitcher />
            </Box>
          </Stack>
        </Stack>
      </Drawer>
    </AppBar>
  );
}
