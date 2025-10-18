import { Outlet, NavLink } from "react-router-dom";
import {
    Box, Container, Paper, Stack, Button, Divider,
    List, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import {
    FiShield, FiUser, FiCreditCard, FiHelpCircle, FiPackage, FiTruck, FiLogOut, FiUsers, FiSearch
} from "react-icons/fi";
import { Add } from "@mui/icons-material"

import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import React from "react";

import './DashboardLayout.scss';
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {RiAdminFill} from "react-icons/ri";

const mainNav = [
    { to: "/dashboard/search",  icon: <FiSearch />,      label: "Поиск заказов" },
    { to: "/dashboard/profile",  icon: <FiUser />,      label: "Профиль" },
    { to: "/dashboard/company",  icon: <FiPackage />,   label: "Компании" },
    { to: "/dashboard/staff",    icon: <FiUsers />,     label: "Сотрудники" },
    { to: "/dashboard/payments", icon: <FiCreditCard />,label: "Платежи" },
    { to: "/dashboard/requests", icon: <FiTruck />,     label: "Мои заказы" },
];


const bottomNav = [
    { to: "/dashboard/security", icon: <FiShield />,    label: "Безопасность" },
    { to: "/dashboard/help",     icon: <FiHelpCircle />,label: "Помощь и поддержка" },
];

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <ListItemButton
            component={NavLink}
            to={to}
            className="dashboard-buttons"
        >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 16 }} />
        </ListItemButton>
    );
}

export default function DashboardLayout() {

    const clearUser = useUserStore(state => state.clearUser);
    const user = useUserStore(state => state.user);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        clearUser()
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="100dvh" className="dashboard-layout">
            <Header isAuthenticated />
            <Box component="main" sx={{ bgcolor: "#F5F5F5", flexGrow: 1, paddingBottom: 32 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" spacing={3} alignItems="flex-start">

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                width: 260,
                                flexShrink: 0,
                            }}
                        >

                            <List disablePadding>
                                {mainNav.map((i) => (
                                    <NavItem key={i.to} {...i} />
                                ))}
                            </List>


                            <Stack mt={1.5} spacing={1}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    component={NavLink}
                                    to="/dashboard/create-cargo"
                                    size="small"
                                    // sx={{
                                    //     height: 36,
                                    //     textTransform: "none",
                                    //     bgcolor: "action.hover",
                                    //     borderColor: "action.focus",
                                    // }}

                                    className="dashboard-buttons dashboard-buttons__post "
                                    startIcon={<Add sx={{ fontSize: 16 }} />}
                                >
                                    Добавить груз
                                </Button>
                                <Button
                                    variant="outlined"
                                    component={NavLink}
                                    to="/dashboard/create-transport"
                                    fullWidth
                                    size="small"
                                    className="dashboard-buttons dashboard-buttons__post"
                                    startIcon={<Add sx={{ fontSize: 16 }} />}
                                >
                                    Добавить транспорт
                                </Button>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />


                            <List disablePadding>
                                {user?.is_admin && <ListItemButton
                                    onClick={() => window.location.href = "/admin"}

                                    className="dashboard-buttons dashboard-buttons__logout"
                                >
                                    <ListItemIcon><RiAdminFill /></ListItemIcon>
                                    <ListItemText primary="Админ панель" primaryTypographyProps={{ fontSize: 16 }} />
                                </ListItemButton>}

                                {bottomNav.map((i) => (
                                    <NavItem key={i.to} {...i} />
                                ))}

                                <ListItemButton
                                    onClick={logout}

                                    className="dashboard-buttons dashboard-buttons__logout"
                                >
                                    <ListItemIcon><FiLogOut /></ListItemIcon>
                                    <ListItemText primary="Выйти из аккаунта" primaryTypographyProps={{ fontSize: 16 }} />
                                </ListItemButton>
                            </List>
                        </Paper>


                        <Box flexGrow={1}>
                            <Outlet />
                        </Box>
                    </Stack>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
}
