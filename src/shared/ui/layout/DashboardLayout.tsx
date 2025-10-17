import { Outlet, NavLink } from "react-router-dom";
import {
    Box, Container, Paper, Stack, Button, Divider,
    List, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import {
    FiShield, FiUser, FiCreditCard, FiHelpCircle, FiPackage, FiTruck, FiLogOut, FiUsers, FiSearch
} from "react-icons/fi";

import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import React from "react";


const mainNav = [
    { to: "/dashboard/search",  icon: <FiSearch />,      label: "Search" },
    { to: "/dashboard/profile",  icon: <FiUser />,      label: "Profile" },
    { to: "/dashboard/company",  icon: <FiPackage />,   label: "Company" },
    { to: "/dashboard/staff",    icon: <FiUsers />,     label: "Staff" },
    { to: "/dashboard/payments", icon: <FiCreditCard />,label: "Payments" },
    { to: "/dashboard/requests", icon: <FiTruck />,     label: "My requests" },
];


const bottomNav = [
    { to: "/dashboard/security", icon: <FiShield />,    label: "Security" },
    { to: "/dashboard/help",     icon: <FiHelpCircle />,label: "Help & support" },
];

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <ListItemButton
            component={NavLink}
            to={to}
            sx={{
                borderRadius: 1.5,
                px: 1.25,
                py: 1,
                color: "text.primary",
                "& .MuiListItemIcon-root": { minWidth: 32, color: "text.secondary" },
                "&.active": {
                    bgcolor: "primary.main",
                    color: "common.white",
                    "& .MuiListItemIcon-root": { color: "common.white" },
                },
            }}
        >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
    );
}

export default function DashboardLayout() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100dvh">
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
                                    sx={{
                                        height: 36,
                                        textTransform: "none",
                                        bgcolor: "action.hover",
                                        borderColor: "action.focus",
                                    }}
                                >
                                    Post cargo
                                </Button>
                                <Button
                                    variant="outlined"
                                    component={NavLink}
                                    to="/dashboard/create-transport"
                                    fullWidth
                                    size="small"
                                    sx={{
                                        height: 36,
                                        textTransform: "none",
                                        bgcolor: "action.hover",
                                        borderColor: "action.focus",
                                    }}
                                >
                                    Post transport
                                </Button>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />


                            <List disablePadding>
                                {bottomNav.map((i) => (
                                    <NavItem key={i.to} {...i} />
                                ))}

                                <ListItemButton
                                    onClick={() => {/* logout() */}}
                                    sx={{
                                        borderRadius: 1.5,
                                        px: 1.25,
                                        py: 1,
                                        color: "text.primary",
                                        "& .MuiListItemIcon-root": { minWidth: 32, color: "text.secondary" },
                                        "&:hover": { bgcolor: "action.hover" },
                                    }}
                                >
                                    <ListItemIcon><FiLogOut /></ListItemIcon>
                                    <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: 14 }} />
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
