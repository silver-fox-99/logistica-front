import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    AppBar,
    Box,
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
    FiChevronRight, FiAward,
} from "react-icons/fi";
import { BsGeoAltFill } from "react-icons/bs";
import { MdRateReview } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import {TbPremiumRights} from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi2";
import {PiBellRingingLight} from "react-icons/pi";

type NavItemConfig = {
    to: string;
    label: string;
    icon: React.ReactNode;
    end?: boolean;
};

const NAV_ITEMS: NavItemConfig[] = [
    { to: "/admin", icon: <FiBarChart2 />, label: "Обзор", end: true },
    { to: "/admin/users", icon: <FiUsers />, label: "Пользователи" },
    { to: "/admin/cargo", icon: <FiPackage />, label: "Грузы" },
    { to: "/admin/transport", icon: <FaTruck />, label: "Транспорт" },
    { to: "/admin/geo", icon: <BsGeoAltFill />, label: "Геолокации" },
    { to: "/admin/reviews", icon: <MdRateReview />, label: "Отзывы" },
    { to: "/admin/documents", icon: <HiOutlineDocumentText />, label: "Документы" },
    { to: "/admin/referral-settings", icon: <FiAward />, label: "Реферальная система" },
    { to: "/admin/tariffs/plans", icon: <TbPremiumRights />, label: "Тарифы" },
    { to: "/admin/initial-data", icon: <FiDatabase />, label: "Справочники" },
    { to: "/admin/black-list", icon: <FiShield />, label: "Черный список" },
    { to: "/admin/notifications", icon: <PiBellRingingLight />, label: "Уведомления" },
    { to: "/admin/activity-logs", icon: <FiSettings />, label: "Журнал активности" },

];

function NavItem(props: {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    end?: boolean
}) {
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
                "&.active": {
                    bgcolor: "action.selected",
                    "&:hover": { bgcolor: "action.selected" },
                },
            }}
        >
            <ListItemIcon sx={{ color: "text.primary", fontSize: 18 }}>{icon}</ListItemIcon>
            {!collapsed && (
                <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                />
            )}
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
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", py: 1 }}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                {!collapsed && (
                    <Typography variant="subtitle2" fontWeight={800} sx={{ whiteSpace: "nowrap" }}>
                        Админ-панель
                    </Typography>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <IconButton
                    onClick={toggleCollapsed}
                    size="small"
                    title={collapsed ? "Развернуть меню" : "Свернуть меню"}
                >
                    {collapsed ? <FiChevronLeft /> : <FiChevronRight />}
                </IconButton>
            </Box>

            <Divider />

            <List disablePadding sx={{ py: 1 }}>
                {NAV_ITEMS.map((item) => (
                    <NavItem
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        icon={item.icon}
                        label={item.label}
                        collapsed={collapsed}
                    />
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider />
            {!collapsed && (
                <Box sx={{ p: 1.5 }}>
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
                        <IconButton
                            onClick={toggleCollapsed}
                            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
                            sx={{ mr: 1 }}
                        >
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
