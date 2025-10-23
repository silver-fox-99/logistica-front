
import { Outlet, NavLink } from "react-router-dom";
import {
    AppBar, Toolbar, Typography, Box, Container, Paper, Stack,
    List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton
} from "@mui/material";
import {FiHome, FiUsers, FiPackage, FiSettings, FiShield, FiBarChart2, FiDatabase} from "react-icons/fi";
import React from "react";
import {BsGeoAltFill} from "react-icons/bs";

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <ListItemButton component={NavLink} to={to} className="dashboard-buttons">
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 16 }} />
        </ListItemButton>
    );
}

export default function AdminLayout() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100dvh">
<AppBar position="sticky" color="default" elevation={0}>
    <Container maxWidth="xl">
        <Toolbar>
            <Typography variant="h6" fontWeight={700}>Панель администратора</Typography>
            <Box flexGrow={1} />
            <IconButton component={NavLink} to="/dashboard" title="Back to dashboard">
                <FiHome />
            </IconButton>
        </Toolbar>
        <Divider />
    </Container>
</AppBar>

            <Box component="main" sx={{ bgcolor: "#F5F5F5", flexGrow: 1, py: 3 }}>
                <Container maxWidth="xl">
                    <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Paper elevation={0} sx={{ p: 1.5, width: 260, flexShrink: 0 }}>
                            <List disablePadding>
                                <NavItem to="/admin" icon={<FiBarChart2 />} label="Обзор" />
                                <NavItem to="/admin/users" icon={<FiUsers />} label="Пользователи" />
                                <NavItem to="/admin/cargo" icon={<FiPackage />} label="Грузы" />
                                <NavItem to="/admin/transport" icon={<FiPackage />} label="Транспорт" />
                                <NavItem to="/admin/geo" icon={<BsGeoAltFill />} label="Гео-локации" />
                                <NavItem to="/admin/initial-data" icon={<FiDatabase  />} label="Справочник" />
                                <NavItem to="/admin/black-list" icon={<FiShield />} label="Черный список" />
                                <NavItem to="/admin/activity-logs" icon={<FiSettings />} label="Логи активности" />
                            </List>
                        </Paper>

                        <Box flexGrow={1}>
                            <Outlet />
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
