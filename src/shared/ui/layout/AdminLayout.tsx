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
    FiLayers,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { BsGeoAltFill } from "react-icons/bs";
import { MdRateReview } from "react-icons/md";
import { FaTruck } from "react-icons/fa";

type NavItemConfig = {
    to: string;
    label: string;
    icon: React.ReactNode;
    end?: boolean;
};

const NAV_ITEMS: NavItemConfig[] = [
    { to: "/admin", icon: <FiBarChart2 />, label: "Overview", end: true },
    { to: "/admin/users", icon: <FiUsers />, label: "Users" },
    { to: "/admin/cargo", icon: <FiPackage />, label: "Cargo" },
    { to: "/admin/transport", icon: <FaTruck />, label: "Transport" },
    { to: "/admin/geo", icon: <BsGeoAltFill />, label: "Geo locations" },
    { to: "/admin/initial-data", icon: <FiDatabase />, label: "Reference data" },
    { to: "/admin/black-list", icon: <FiShield />, label: "Blacklist" },
    { to: "/admin/reviews", icon: <MdRateReview />, label: "Reviews" },
    { to: "/admin/activity-logs", icon: <FiSettings />, label: "Activity logs" },
    { to: "/admin/tariffs/plans", icon: <FiLayers />, label: "Tariff plans" },
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
        if (v === null) return true; // дефолт: свернуто
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

    // 1) init from localStorage
    const [collapsed, setCollapsed] = React.useState<boolean>(() => readCollapsedFromStorage());

    // 2) force-collapse on tight screens (do not overwrite storage)
    React.useEffect(() => {
        if (!isDesktop) return;
        if (isTight && collapsed === false) setCollapsed(true);
    }, [isDesktop, isTight, collapsed]);

    // 3) persist on change
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
                        Admin panel
                    </Typography>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <IconButton onClick={toggleCollapsed} size="small" title="Toggle sidebar">
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
                        Admin panel
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    {isDesktop && (
                        <IconButton
                            onClick={toggleCollapsed}
                            title={collapsed ? "Expand navigation" : "Collapse navigation"}
                            sx={{ mr: 1 }}
                        >
                            {collapsed ? <FiChevronLeft /> : <FiChevronRight />}
                        </IconButton>
                    )}

                    <IconButton component={NavLink} to="/dashboard" title="Back to dashboard">
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
