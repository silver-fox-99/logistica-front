import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  FiHome,
  FiUsers,
  FiPackage,
  FiSettings,
  FiShield,
  FiBarChart2,
  FiDatabase,
  FiAward,
  FiLink2,
  FiTruck,
  FiBriefcase,
  FiSend,
  FiFileText,
  FiMenu,
  FiX,
  FiVolume2,
} from "react-icons/fi";
import { BsGeoAlt } from "react-icons/bs";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineRateReview,
} from "react-icons/md";
import { TbPremiumRights } from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { PiBellRingingLight } from "react-icons/pi";

import type { AdminPermissionTarget } from "@/entities/adminPermission/model/types";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store";
import { LuNewspaper } from "react-icons/lu";
import { useNotificationsWebSocket } from "@/features/notifications/websocket/useNotificationsWebSocket";
import { useUnreadNotificationsStore } from "@/entities/notification/model/unreadNotifications.store";

type NavItemConfig = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  requiredAny?: string[];
};

const VIEW = "VIEW" as const;

export function viewCode(target: AdminPermissionTarget) {
  return `${target}:${VIEW}`;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    to: "/admin",
    icon: <FiBarChart2 />,
    label: "Обзор",
    end: true,
    requiredAny: [viewCode("DASHBOARD" as any)],
  },
  {
    to: "/admin/users",
    icon: <FiUsers />,
    label: "Пользователи",
    requiredAny: [viewCode("USERS" as any)],
  },
  {
    to: "/admin/companies",
    icon: <FiBriefcase />,
    label: "Компании",
    requiredAny: [viewCode("COMPANIES" as any)],
  },
  {
    to: "/admin/cargo",
    icon: <FiPackage />,
    label: "Грузы",
    requiredAny: [viewCode("CARGO" as any)],
  },
  {
    to: "/admin/transport",
    icon: <FiTruck />,
    label: "Транспорт",
    requiredAny: [viewCode("TRANSPORT" as any)],
  },
  { to: "/admin/tenders", icon: <FiFileText />, label: "Тендеры" },
  {
    to: "/admin/geo",
    icon: <BsGeoAlt />,
    label: "Геолокации",
    requiredAny: [viewCode("GEO_LOCATIONS" as any)],
  },
  {
    to: "/admin/reviews",
    icon: <MdOutlineRateReview />,
    label: "Отзывы",
    requiredAny: [viewCode("REVIEWS" as any)],
  },
  {
    to: "/admin/documents",
    icon: <HiOutlineDocumentText />,
    label: "Документы",
    requiredAny: [viewCode("DOCUMENTS" as any)],
  },
  {
    to: "/admin/referral-settings",
    icon: <FiAward />,
    label: "Реферальная система",
    requiredAny: [viewCode("REFERRAL_SETTINGS" as any)],
  },
  {
    to: "/admin/tariffs/plans",
    icon: <TbPremiumRights />,
    label: "Тарифы",
    requiredAny: [viewCode("TARIFF_PLANS" as any)],
  },
  {
    to: "/admin/initial-data",
    icon: <FiDatabase />,
    label: "Справочники",
    requiredAny: [viewCode("LOOKUPS" as any)],
  },
  {
    to: "/admin/black-list",
    icon: <FiShield />,
    label: "Чёрный список",
    requiredAny: [viewCode("BLACKLIST" as any)],
  },
  {
    to: "/admin/notifications",
    icon: <PiBellRingingLight />,
    label: "Уведомления",
    requiredAny: [viewCode("NOTIFICATION" as any)],
  },
  {
    to: "/admin/user-notifications-admin",
    icon: <FiVolume2 />,
    label: "Рассылка юзерам",
    requiredAny: [viewCode("NOTIFICATION" as any)],
  },
  {
    to: "/admin/integrations",
    icon: <FiLink2 />,
    label: "Интеграции",
    requiredAny: [viewCode("INTEGRATIONS" as any)],
  },
  {
    to: "/admin/telegram-notifications",
    icon: <FiSend />,
    label: "Telegram",
    requiredAny: [viewCode("TELEGRAM_NOTIFICATIONS" as any)],
  },
  {
    to: "/admin/ads",
    icon: <LuNewspaper />,
    label: "Реклама",
    requiredAny: [viewCode("ADS" as any)],
  },
  {
    to: "/admin/system-settings",
    icon: <FiSettings />,
    label: "Настройки фильтров",
    requiredAny: [viewCode("SYSTEM_SETTINGS" as any)],
  },
  {
    to: "/admin/activity-logs",
    icon: <FiSettings />,
    label: "Журнал активности",
    requiredAny: [viewCode("ACTIVITY_LOGS" as any)],
  },
  {
    to: "/admin/groups-roles",
    icon: <MdOutlineAdminPanelSettings />,
    label: "Группы и роли",
    requiredAny: [
      viewCode("ADMIN_GROUPS" as any),
      viewCode("ADMIN_PERMISSIONS" as any),
    ],
  },
];

export default function AdminLayout() {
  useNotificationsWebSocket();
  const fetchUnreadCount = useUnreadNotificationsStore((s) => s.fetchCount);
  const unreadCount = useUnreadNotificationsStore((s) => s.count);
  const location = useLocation();

  React.useEffect(() => {
    void fetchUnreadCount();
  }, [fetchUnreadCount]);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Zustand access
  const access = useAdminAccessStore((s) => s.access);
  const accessLoading = useAdminAccessStore((s) => s.loading);
  const loadAccess = useAdminAccessStore((s) => s.load);
  const hasAny = useAdminAccessStore((s) => s.hasAny);

  React.useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  const activeGroups = React.useMemo(() => {
    const groups = access?.groups ?? [];
    return [...groups].sort(
      (a: any, b: any) => Number(b?.rank ?? 0) - Number(a?.rank ?? 0),
    );
  }, [access?.groups]);

  const groupedNav = React.useMemo(() => {
    if (accessLoading || !access) return { overview: null, groups: [] };

    const filterItem = (item: NavItemConfig) => {
      if (access.isRoot) return true;
      if (!item.requiredAny) return true;
      return hasAny(item.requiredAny);
    };

    const overviewItem = NAV_ITEMS.find((i) => i.to === "/admin");
    const overview =
      overviewItem && filterItem(overviewItem) ? overviewItem : null;

    const groups = [
      {
        label: "Пользователи",
        items: NAV_ITEMS.filter((i) =>
          ["/admin/users", "/admin/groups-roles", "/admin/black-list"].includes(
            i.to,
          ),
        ).filter(filterItem),
      },
      {
        label: "Ресурсы",
        items: NAV_ITEMS.filter((i) =>
          [
            "/admin/companies",
            "/admin/cargo",
            "/admin/transport",
            "/admin/tenders",
            "/admin/reviews",
            "/admin/documents",
            "/admin/user-notifications-admin",
          ].includes(i.to),
        ).filter(filterItem),
      },
      {
        label: "Система",
        items: NAV_ITEMS.filter((i) =>
          [
            "/admin/tariffs/plans",
            "/admin/referral-settings",
            "/admin/geo",
            "/admin/initial-data",
            "/admin/integrations",
            "/admin/telegram-notifications",
            "/admin/ads",
            "/admin/system-settings",
            "/admin/activity-logs",
            "/admin/notifications",
          ].includes(i.to),
        ).filter(filterItem),
      },
    ];

    return {
      overview,
      groups: groups.filter((g) => g.items.length > 0),
    };
  }, [access, accessLoading, hasAny]);

  const mobileDrawerContent = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          Админ-панель
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <FiX />
        </IconButton>
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1, py: 1, overflowY: "auto" }}>
        {groupedNav.overview && (
          <ListItemButton
            component={NavLink}
            to={groupedNav.overview.to}
            end
            onClick={handleDrawerToggle}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 1.5,
              "&.active": { bgcolor: "action.selected", color: "primary.main" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, fontSize: 18 }}>
              {groupedNav.overview.icon}
            </ListItemIcon>
            <ListItemText
              primary={groupedNav.overview.label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            />
          </ListItemButton>
        )}

        {groupedNav.groups.map((group) => (
          <Box key={group.label} sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 3,
                py: 0.5,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {group.label}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const isNotification = item.to === "/admin/notifications";
                return (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    onClick={handleDrawerToggle}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 1.5,
                      pl: 4,
                      "&.active": {
                        bgcolor: "action.selected",
                        color: "primary.main",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, fontSize: 16 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                    />
                    {isNotification && unreadCount > 0 && (
                      <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            position: "static",
                            transform: "none",
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        {accessLoading ? (
          <CircularProgress size={16} />
        ) : access?.isRoot ? (
          <Chip size="small" label="ROOT" />
        ) : activeGroups.length ? (
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            useFlexGap
            sx={{ maxWidth: 240 }}
          >
            {activeGroups.slice(0, 4).map((g: any) => (
              <Chip key={g.id} size="small" label={g.code || g.name} />
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Группы не назначены
          </Typography>
        )}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            © Admin Logistics
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "#F5F5F5" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, height: "64px" }}>
          {!isDesktop && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1.5 }}
            >
              <FiMenu />
            </IconButton>
          )}

          <Typography
            variant="h6"
            fontWeight={800}
            component={NavLink}
            to="/admin"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            Админ-панель
          </Typography>

          {isDesktop && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ ml: 2, height: "100%", alignItems: "center" }}
            >
              {groupedNav.overview && (
                <Button
                  component={NavLink}
                  to={groupedNav.overview.to}
                  end
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: 14,
                    textTransform: "none",
                    px: 2,
                    py: 0.75,
                    borderRadius: 1.5,
                    "&.active": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  {groupedNav.overview.label}
                </Button>
              )}

              {groupedNav.groups.map((group) => {
                const isGroupActive = group.items.some((item) => {
                  if (item.to === "/admin") {
                    return location.pathname === "/admin";
                  }
                  return location.pathname.startsWith(item.to);
                });
                return (
                  <Box
                    key={group.label}
                    sx={{
                      position: "relative",
                      alignSelf: "stretch",
                      display: "flex",
                      alignItems: "center",
                      "&:hover .dropdown-menu": {
                        display: "block",
                      },
                    }}
                  >
                    <Button
                      sx={{
                        color: isGroupActive ? "primary.main" : "text.primary",
                        bgcolor: isGroupActive
                          ? "action.selected"
                          : "transparent",
                        fontWeight: 600,
                        fontSize: 14,
                        textTransform: "none",
                        px: 2,
                        py: 0.75,
                        borderRadius: 1.5,
                        "&:hover": {
                          bgcolor: isGroupActive
                            ? "action.selected"
                            : "action.hover",
                        },
                      }}
                    >
                      {group.label}
                    </Button>
                    <Paper
                      className="dropdown-menu"
                      elevation={4}
                      sx={{
                        display: "none",
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 1300,
                        minWidth: 220,
                        py: 1,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      {group.items.map((item) => (
                        <ListItemButton
                          key={item.to}
                          component={NavLink}
                          to={item.to}
                          sx={{
                            mx: 1,
                            my: 0.5,
                            borderRadius: 1.5,
                            py: 1,
                            "&.active": {
                              bgcolor: "action.selected",
                              color: "primary.main",
                              "& .MuiListItemIcon-root": {
                                color: "primary.main",
                              },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 32,
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </Paper>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {isDesktop && (
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mr: 2 }}
            >
              {accessLoading ? (
                <CircularProgress size={16} />
              ) : access?.isRoot ? (
                <Chip
                  size="small"
                  label="ROOT"
                  color="primary"
                  variant="outlined"
                />
              ) : activeGroups.length ? (
                activeGroups
                  .slice(0, 3)
                  .map((g: any) => (
                    <Chip
                      key={g.id}
                      size="small"
                      label={g.code || g.name}
                      variant="outlined"
                    />
                  ))
              ) : null}
            </Stack>
          )}

          <IconButton
            component={NavLink}
            to="/admin/notifications"
            title="Уведомления"
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <PiBellRingingLight />
            </Badge>
          </IconButton>

          <IconButton
            component={NavLink}
            to="/dashboard"
            title="Назад в кабинет"
          >
            <FiHome />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
        }}
      >
        <Toolbar />
        <Box sx={{ pt: 3, pb: 12, px: { xs: 2, md: 3 }, width: "100%" }}>
          <Outlet />
        </Box>
      </Box>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </Box>
  );
}
