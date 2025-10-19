
import { Outlet, NavLink } from "react-router-dom";
import {
    AppBar, Toolbar, Typography, Box, Container, Paper, Stack,
    List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton
} from "@mui/material";
import { FiHome, FiUsers, FiPackage, FiSettings, FiShield, FiBarChart2 } from "react-icons/fi";
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
            <Container maxWidth="xl">
            <AppBar position="sticky" color="default" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" fontWeight={700}>Admin</Typography>
                    <Box flexGrow={1} />
                    <IconButton component={NavLink} to="/dashboard" title="Back to dashboard">
                        <FiHome />
                    </IconButton>
                </Toolbar>
                <Divider />
            </AppBar>
            </Container>

            <Box component="main" sx={{ bgcolor: "#F5F5F5", flexGrow: 1, py: 3 }}>
                <Container maxWidth="xl">
                    <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Paper elevation={0} sx={{ p: 1.5, width: 260, flexShrink: 0 }}>
                            <List disablePadding>
                                <NavItem to="/admin" icon={<FiBarChart2 />} label="Overview" />
                                <NavItem to="/admin/users" icon={<FiUsers />} label="Users" />
                                <NavItem to="/admin/cargo" icon={<FiPackage />} label="Cargo" />
                                <NavItem to="/admin/transport" icon={<FiPackage />} label="Transport" />
                                <NavItem to="/admin/geo" icon={<BsGeoAltFill />} label="Geo locations" />
                                <NavItem to="/admin/black-list" icon={<FiShield />} label="Black list" />
                                <NavItem to="/admin/activity-logs" icon={<FiSettings />} label="Activity logs" />
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
