import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    AppBar,
    Box,
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
    Tooltip,
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
    FiChevronLeft,
    FiChevronRight,
    FiAward,
    FiLink2, FiTruck,
} from "react-icons/fi";
import {BsGeoAlt} from "react-icons/bs";
import {MdOutlineAdminPanelSettings, MdOutlineRateReview} from "react-icons/md";
import { TbPremiumRights } from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { PiBellRingingLight } from "react-icons/pi";

import type { AdminPermissionTarget } from "@/entities/adminPermission/model/types";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store";
import {LuNewspaper} from "react-icons/lu";

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
    { to: "/admin", icon: <FiBarChart2 />, label: "Обзор", end: true, requiredAny: [viewCode("DASHBOARD" as any)] },
    { to: "/admin/users", icon: <FiUsers />, label: "Пользователи", requiredAny: [viewCode("USERS" as any)] },
    { to: "/admin/cargo", icon: <FiPackage />, label: "Грузы", requiredAny: [viewCode("CARGO" as any)] },
    { to: "/admin/transport", icon: <FiTruck />, label: "Транспорт", requiredAny: [viewCode("TRANSPORT" as any)] },
    { to: "/admin/geo", icon: <BsGeoAlt />, label: "Геолокации", requiredAny: [viewCode("GEO_LOCATIONS" as any)] },
    { to: "/admin/reviews", icon: <MdOutlineRateReview />, label: "Отзывы", requiredAny: [viewCode("REVIEWS" as any)] },
    { to: "/admin/documents", icon: <HiOutlineDocumentText />, label: "Документы", requiredAny: [viewCode("DOCUMENTS" as any)] },
    { to: "/admin/referral-settings", icon: <FiAward />, label: "Реферальная система", requiredAny: [viewCode("REFERRAL_SETTINGS" as any)] },
    { to: "/admin/tariffs/plans", icon: <TbPremiumRights />, label: "Тарифы", requiredAny: [viewCode("TARIFF_PLANS" as any)] },
    { to: "/admin/initial-data", icon: <FiDatabase />, label: "Справочники", requiredAny: [viewCode("LOOKUPS" as any)] },
    { to: "/admin/black-list", icon: <FiShield />, label: "Чёрный список", requiredAny: [viewCode("BLACKLIST" as any)] },
    { to: "/admin/notifications", icon: <PiBellRingingLight />, label: "Уведомления", requiredAny: [viewCode("NOTIFICATION" as any)] },
    { to: "/admin/integrations", icon: <FiLink2 />, label: "Интеграции", requiredAny: [viewCode("INTEGRATIONS" as any)] },
    { to: "/admin/ads", icon: <LuNewspaper />, label: "Реклама", requiredAny: [viewCode("ADS" as any)] },
    { to: "/admin/activity-logs", icon: <FiSettings />, label: "Журнал активности", requiredAny: [viewCode("ACTIVITY_LOGS" as any)] },
    {
        to: "/admin/groups-roles",
        icon: <MdOutlineAdminPanelSettings />,
        label: "Группы и роли",
        requiredAny: [viewCode("ADMIN_GROUPS" as any), viewCode("ADMIN_PERMISSIONS" as any)],
    },
];

function NavItem(props: { to: string; icon: React.ReactNode; label: string; collapsed: boolean; end?: boolean }) {
    const { to, icon, label, collapsed, end } = props;

    return (
        <ListItemButton
            component={NavLink}
            to={to}
            end={end}
            sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                justifyContent: collapsed ? "center" : "flex-start",
                "& .MuiListItemIcon-root": { minWidth: collapsed ? 40 : 44 },
                "&.active": { bgcolor: "action.selected", "&:hover": { bgcolor: "action.selected" } },
            }}
        >
            <ListItemIcon sx={{ color: "text.primary", fontSize: 18 }}>{icon}</ListItemIcon>
            {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />}
        </ListItemButton>
    );
}

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

const LS_KEY = "admin.sidebar.collapsed";

function readCollapsedFromStorage(): boolean {
    try {
        const v = localStorage.getItem(LS_KEY);
        if (v === null) return true;
        return v === "true";
    } catch {
        return true;
    }
}

function writeCollapsedToStorage(value: boolean) {
    try {
        localStorage.setItem(LS_KEY, String(value));
    } catch {
        // ignore
    }
}

export default function AdminLayout() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const isTight = useMediaQuery("(max-width:1100px)");

    const [collapsed, setCollapsed] = React.useState<boolean>(() => readCollapsedFromStorage());

    // Zustand access
    const access = useAdminAccessStore((s) => s.access);
    const accessLoading = useAdminAccessStore((s) => s.loading);
    const loadAccess = useAdminAccessStore((s) => s.load);
    const hasAny = useAdminAccessStore((s) => s.hasAny);

    React.useEffect(() => {
        void loadAccess();
    }, [loadAccess]);

    const navItems = React.useMemo(() => {
        if (accessLoading) return [];
        if (!access) return [];
        if (access.isRoot) return NAV_ITEMS;
        return NAV_ITEMS.filter((item) => hasAny(item.requiredAny));
    }, [access, accessLoading, hasAny]);

    const activeGroups = React.useMemo(() => {
        const groups = access?.groups ?? [];
        return [...groups].sort((a: any, b: any) => Number(b?.rank ?? 0) - Number(a?.rank ?? 0));
    }, [access?.groups]);

    React.useEffect(() => {
        if (!isDesktop) return;
        if (isTight && collapsed === false) setCollapsed(true);
    }, [isDesktop, isTight, collapsed]);

    React.useEffect(() => {
        writeCollapsedToStorage(collapsed);
    }, [collapsed]);

    const toggleCollapsed = () => setCollapsed((v) => !v);
    const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", pt: 7, pb: 2 }}>

            <List disablePadding sx={{ py: 1 }}>
                {accessLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                        <CircularProgress size={22} />
                    </Box>
                ) : navItems.length ? (
                    navItems.map((item) => (
                        <NavItem key={item.to} to={item.to} end={item.end} icon={item.icon} label={item.label} collapsed={collapsed} />
                    ))
                ) : (
                    <Box sx={{ px: 2, py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Нет доступных разделов
                        </Typography>
                    </Box>
                )}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider />
            {!collapsed && (
                <Box sx={{ p: 1.5 }}>
                    {accessLoading ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
                            <CircularProgress size={14} />
                            <Typography variant="caption" color="text.secondary">
                                Загрузка прав...
                            </Typography>
                        </Box>
                    ) : access?.isRoot ? (
                        <Box sx={{ mt: 0.75 }}>
                            <Chip size="small" label="ROOT" />
                        </Box>
                    ) : activeGroups.length ? (
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.75, maxWidth: 220 }}>
                            {activeGroups.slice(0, 6).map((g: any) => {
                                const label = (g.code || g.name || "").toString();
                                return (
                                    <Tooltip key={g.id} title={g.name || g.code || ""}>
                                        <Chip size="small" label={label} />
                                    </Tooltip>
                                );
                            })}
                            {activeGroups.length > 6 && (
                                <Tooltip
                                    title={activeGroups
                                        .slice(6)
                                        .map((g: any) => (g.name || g.code || "").toString())
                                        .join(", ")}
                                >
                                    <Chip size="small" label={`+${activeGroups.length - 6}`} />
                                </Tooltip>
                            )}
                        </Stack>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                            Группы не назначены
                        </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                        © Admin Logistics
                    </Typography>
                </Box>
            )}
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
                <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" fontWeight={800}>
                        Админ-панель
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    {isDesktop && (
                        <IconButton onClick={toggleCollapsed} title={collapsed ? "Развернуть меню" : "Свернуть меню"} sx={{ mr: 1 }}>
                            {collapsed ? <FiChevronLeft /> : <FiChevronRight />}
                        </IconButton>
                    )}

                    <IconButton component={NavLink} to="/dashboard" title="Назад в кабинет">
                        <FiHome />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mr: `${drawerWidth}px`,
                    width: `calc(100% - ${drawerWidth}px)`,
                    transition: theme.transitions.create(["margin-right", "width"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.shortest,
                    }),
                }}
            >
                <Toolbar />
                <Box sx={{ py: 3, px: { xs: 2, md: 3 }, width: "100%" }}>
                    <Outlet />
                </Box>
            </Box>

            <Drawer
                variant="permanent"
                anchor="right"
                open
                sx={{
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        overflowX: "hidden",
                        transition: theme.transitions.create("width", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.shortest,
                        }),
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
