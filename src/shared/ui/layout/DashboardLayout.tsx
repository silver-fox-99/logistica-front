import { Outlet, NavLink } from "react-router-dom";
import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  useMediaQuery,
  CircularProgress,
  Collapse,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  FiUser,
  FiCreditCard,
  FiLogOut,
  FiSearch,
  FiAward,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiList,
  FiBriefcase,
  FiLock,
  FiHeadphones,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import { RiAdminFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { useUserStore } from "@/entities/user/model/user.store";

import BookmarkPromptDialog from "@/features/bookmarkPrompt/ui/BookmarkPromptDialog";
import { CompanyWorkspaceSidebar } from "@/widgets/company/company-workspace-sidebar/ui/CompanyWorkspaceSidebar";
import { useIsCompanyWorkspace } from "@/pages/dashboard/company/workspace/model/useIsCompanyWorkspace";
import { useCompanySidebarCompany } from "@/pages/dashboard/company/workspace/model/useCompanySidebarCompany";
import { TenderWorkspaceSidebar } from "@/widgets/tender/tender-workspace-sidebar/ui/TenderWorkspaceSidebar";
import { useTenderWorkspaceAccessStore } from "@/entities/tender/model/tenderWorkspaceAccess.store";
import { useClientNotificationsWebSocket } from "@/features/user-notifications/websocket/useClientNotificationsWebSocket";
import { ScrollToTop } from "@/shared/lib/scrollToTop";

// Стилизация кнопок бокового меню под новый дизайн
const sidebarButtonStyles = {
  borderRadius: "10px",
  mb: 0.25,
  py: 0.75,
  px: 1.5,
  color: "text.secondary",
  transition: "all 0.2s ease-in-out",
  "& .MuiListItemIcon-root": {
    color: "text.secondary",
    minWidth: "34px",
    fontSize: "1.2rem",
    transition: "all 0.2s ease-in-out",
  },
  "& .MuiListItemText-primary": {
    fontWeight: 500,
    fontSize: "0.95rem",
  },
  "&:hover": {
    bgcolor: "rgba(15, 95, 194, 0.04)",
    color: "primary.main",
    "& .MuiListItemIcon-root": {
      color: "primary.main",
      transform: "translateX(3px)",
    },
  },
  "&.active": {
    bgcolor: "transparent",
    color: "primary.main",
    "& .MuiListItemIcon-root": {
      color: "primary.main",
    },
    "& .MuiListItemText-primary": {
      fontWeight: 650,
    },
  },
};

function NavItem({
  to,
  icon,
  label,
  onClick,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  end?: boolean;
}) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={end}
      onClick={onClick}
      sx={sidebarButtonStyles}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const user = useUserStore((state) => state.user);
  const { t } = useTranslation();
  const location = useLocation();
  const [tendersOpen, setTendersOpen] = useState(() =>
    location.pathname.startsWith("/dashboard/tenders"),
  );

  const isTendersActive = location.pathname.startsWith("/dashboard/tenders");

  const mainNav = [
    {
      to: "/dashboard/search",
      icon: <FiSearch />,
      label: t("dashboard.menu.search"),
    },
    {
      to: "/dashboard/profile",
      icon: <FiUser />,
      label: t("dashboard.menu.profile"),
    },
    {
      to: "/dashboard/company",
      icon: <FiBriefcase />,
      label: t("dashboard.menu.company"),
    },
    {
      to: "/dashboard/payments",
      icon: <FiCreditCard />,
      label: t("dashboard.menu.payments"),
    },
    {
      to: "/dashboard/referral",
      icon: <FiAward />,
      label: t("dashboard.menu.referrals"),
    },
    {
      to: "/dashboard/requests",
      icon: <FiCalendar />,
      label: t("dashboard.menu.myOrders"),
    },
  ];

  const bottomNav = [
    {
      to: "/dashboard/security",
      icon: <FiLock />,
      label: t("dashboard.menu.security"),
    },
    {
      to: "/reviews",
      icon: <FiMessageSquare />,
      label: t("dashboard.menu.siteReviews"),
    },
    {
      to: "/dashboard/help",
      icon: <FiHeadphones />,
      label: t("dashboard.menu.helpSupport"),
    },
  ];

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    useUserStore.getState().clearUser();
  };

  return (
    <Box sx={{ p: 0.5 }}>
      <List disablePadding>
        {mainNav.map((i) => (
          <NavItem key={i.to} {...i} onClick={onItemClick} />
        ))}

        {/* Выпадающее меню Тендеров */}
        <ListItemButton
          onClick={() => setTendersOpen((value) => !value)}
          sx={{
            ...sidebarButtonStyles,
            bgcolor: isTendersActive
              ? "rgba(15, 95, 194, 0.03)"
              : "transparent",
            color: isTendersActive ? "primary.main" : "text.secondary",
            "& .MuiListItemIcon-root": {
              minWidth: "34px",
              color: isTendersActive ? "primary.main" : "text.secondary",
              transition: "all 0.2s ease-in-out",
            },
            "&:hover": {
              bgcolor: "rgba(15, 95, 194, 0.04)",
              color: "primary.main",
              "& .MuiListItemIcon-root": {
                color: "primary.main",
                transform: "translateX(3px)",
              },
            },
          }}
        >
          <ListItemIcon>
            <FiFileText />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.menu.tenders")} />
          {tendersOpen ? (
            <FiChevronDown size={18} />
          ) : (
            <FiChevronRight size={18} />
          )}
        </ListItemButton>

        <Collapse in={tendersOpen} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ mt: 0.5, pl: 1.5 }}>
            <NavItem
              to="/dashboard/tenders"
              end
              icon={<FiSearch />}
              label={t("dashboard.menu.tenderSearch")}
              onClick={onItemClick}
            />
            <NavItem
              to="/dashboard/tenders/my"
              icon={<FiList />}
              label={t("dashboard.menu.myTenders")}
              onClick={onItemClick}
            />
          </List>
        </Collapse>
      </List>

      {/* Блок целевых кнопок (Добавить груз/транспорт) */}
      <Stack mt={1.5} mb={0.5} spacing={0.75}>
        <Button
          variant="outlined"
          fullWidth
          component={NavLink}
          to="/dashboard/create-cargo"
          startIcon={<Add />}
          onClick={onItemClick}
          sx={{
            height: "40px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            textTransform: "none",
            borderColor: "primary.main",
            color: "primary.main",
            justifyContent: "flex-start",
            "&:hover": {
              bgcolor: "rgba(15, 95, 194, 0.04)",
              borderColor: "primary.dark",
            },
          }}
        >
          {t("dashboard.menu.addCargo")}
        </Button>
        <Button
          variant="outlined"
          component={NavLink}
          to="/dashboard/create-transport"
          fullWidth
          startIcon={<Add />}
          onClick={onItemClick}
          sx={{
            height: "40px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            textTransform: "none",
            borderColor: "primary.main",
            color: "primary.main",
            justifyContent: "flex-start",
            "&:hover": {
              bgcolor: "rgba(15, 95, 194, 0.04)",
              borderColor: "primary.dark",
            },
          }}
        >
          {t("dashboard.menu.addTransport")}
        </Button>
      </Stack>

      <Divider sx={{ my: 1.5, borderColor: "divider" }} />

      <List disablePadding>
        {user?.is_admin && (
          <ListItemButton
            onClick={() => {
              window.location.href = "/admin";
              onItemClick?.();
            }}
            sx={{
              ...sidebarButtonStyles,
              color: "error.main",
              "& .MuiListItemIcon-root": {
                minWidth: "34px",
                color: "error.main",
                transition: "all 0.2s ease-in-out",
              },
              "&:hover": {
                bgcolor: "error.lighter",
                "& .MuiListItemIcon-root": {
                  transform: "translateX(3px)",
                },
              },
            }}
          >
            <ListItemIcon>
              <RiAdminFill />
            </ListItemIcon>
            <ListItemText primary={t("dashboard.menu.adminPanel")} />
          </ListItemButton>
        )}

        {bottomNav.map((i) => (
          <NavItem key={i.to} {...i} onClick={onItemClick} />
        ))}

        <ListItemButton
          onClick={() => {
            logout();
            onItemClick?.();
          }}
          sx={{
            ...sidebarButtonStyles,
            mt: 1,
            color: "error.main",
            "& .MuiListItemIcon-root": {
              minWidth: "34px",
              color: "error.main",
              transition: "all 0.2s ease-in-out",
            },
            "&:hover": {
              bgcolor: "rgba(211, 47, 47, 0.04)",
              "& .MuiListItemIcon-root": {
                transform: "translateX(3px)",
              },
            },
          }}
        >
          <ListItemIcon>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.menu.logout")} />
        </ListItemButton>
      </List>
    </Box>
  );
}

export default function DashboardLayout() {
  useClientNotificationsWebSocket();
  const isMobile = useMediaQuery("(max-width:860px)");
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const tenderAccess = useTenderWorkspaceAccessStore((state) => state);

  const isCompanyWorkspace = useIsCompanyWorkspace();
  const { company, isLoading: isCompanyLoading } = useCompanySidebarCompany();
  const tenderWorkspaceMatch = location.pathname.match(
    /^\/dashboard\/tenders\/([^/]+)\/(overview|bids|settings)/,
  );
  const tenderId = tenderWorkspaceMatch?.[1] ?? "";
  const tenderSidebarCanManage = Boolean(
    tenderId && tenderAccess.tenderId === tenderId && tenderAccess.canManage,
  );

  const toggle = (state?: boolean) =>
    setOpen((prev) => (typeof state === "boolean" ? state : !prev));
  const closeOnItem = () => {
    if (isMobile) toggle(false);
  };

  const sidebarContent = tenderId ? (
    <TenderWorkspaceSidebar
      tenderId={tenderId}
      canManage={tenderSidebarCanManage}
      onItemClick={closeOnItem}
    />
  ) : isCompanyWorkspace ? (
    isCompanyLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    ) : company ? (
      <CompanyWorkspaceSidebar company={company} onItemClick={closeOnItem} />
    ) : (
      <SidebarContent onItemClick={closeOnItem} />
    )
  ) : (
    <SidebarContent onItemClick={closeOnItem} />
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ bgcolor: "#F8FAFC" }}
    >
      <Header
        isAuthenticated
        showBurger={isMobile}
        onMenuClick={() => toggle(true)}
      />
      <ScrollToTop />

      <BookmarkPromptDialog />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 12, md: 14 },
          pb: 10,
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3, lg: 0 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="flex-start"
            sx={{ width: "100%" }}
          >
            {isMobile ? (
              <Drawer
                anchor="left"
                open={open}
                onClose={() => toggle(false)}
                PaperProps={{
                  sx: { width: 280, p: 2, borderRadius: "0 16px 16px 0" },
                }}
                ModalProps={{ keepMounted: true }}
              >
                {sidebarContent}
              </Drawer>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  width: 280,
                  flexShrink: 0,
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                {sidebarContent}
              </Paper>
            )}

            <Box
              flexGrow={1}
              sx={{
                width: "100%",
                minWidth: 0,
              }}
            >
              <Outlet />
            </Box>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
