import { Outlet, NavLink } from "react-router-dom";
import React, { useState, Fragment } from "react";
import {
    Box, Container, Paper, Stack, Button, Divider, List, ListItemButton,
    ListItemIcon, ListItemText, Drawer,  useMediaQuery
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
    FiShield, FiUser, FiCreditCard, FiHelpCircle, FiPackage, FiTruck,
    FiLogOut, FiUsers, FiSearch,
    FiAward
} from "react-icons/fi";
import { RiAdminFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";

import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { useUserStore } from "@/entities/user/model/user.store";
import "./DashboardLayout.scss";
import BookmarkPromptDialog from "@/features/bookmarkPrompt/ui/BookmarkPromptDialog";

function NavItem({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
    return (
        <ListItemButton component={NavLink} to={to} className="dashboard-buttons" onClick={onClick}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 16 }} />
        </ListItemButton>
    );
}

function SidebarContent({
                            onItemClick,
                        }: { onItemClick?: () => void }) {
    const user = useUserStore(state => state.user);
    const { t } = useTranslation();

    const mainNav = [
        { to: "/dashboard/search",   icon: <FiSearch />,      label: t('dashboard.menu.search') },
        { to: "/dashboard/profile",  icon: <FiUser />,        label: t('dashboard.menu.profile') },
        { to: "/dashboard/company",  icon: <FiPackage />,     label: t('dashboard.menu.company') },
        { to: "/dashboard/staff",    icon: <FiUsers />,       label: t('dashboard.menu.staff') },
        { to: "/dashboard/payments", icon: <FiCreditCard />,  label: t('dashboard.menu.payments') },
        { to: "/dashboard/referral", icon: <FiAward />,  label: t('dashboard.menu.referrals') },
        { to: "/dashboard/requests", icon: <FiTruck />,       label: t('dashboard.menu.myOrders') },
    ];

    const bottomNav = [
        { to: "/dashboard/security", icon: <FiShield />,      label: t('dashboard.menu.security') },
        { to: "/dashboard/help",     icon: <FiHelpCircle />,  label: t('dashboard.menu.helpSupport') },
    ];

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        useUserStore.getState().clearUser();
    };

    return (
        <Fragment>
            <List disablePadding>
                {mainNav.map((i) => (
                    <NavItem key={i.to} {...i} onClick={onItemClick} />
                ))}
            </List>

            <Stack mt={1.5} spacing={1}>
                <Button
                    variant="outlined"
                    fullWidth
                    component={NavLink}
                    to="/dashboard/create-cargo"
                    size="small"
                    className="dashboard-buttons dashboard-buttons__post"
                    startIcon={<Add sx={{ fontSize: 16 }} />}
                    onClick={onItemClick}
                >
                    {t('dashboard.menu.addCargo')}
                </Button>
                <Button
                    variant="outlined"
                    component={NavLink}
                    to="/dashboard/create-transport"
                    fullWidth
                    size="small"
                    className="dashboard-buttons dashboard-buttons__post"
                    startIcon={<Add sx={{ fontSize: 16 }} />}
                    onClick={onItemClick}
                >
                    {t('dashboard.menu.addTransport')}
                </Button>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <List disablePadding>
                {user?.is_admin && (
                    <ListItemButton
                        onClick={() => { window.location.href = "/admin"; onItemClick?.(); }}
                        className="dashboard-buttons dashboard-buttons__logout"
                    >
                        <ListItemIcon><RiAdminFill /></ListItemIcon>
                        <ListItemText primary={t('dashboard.menu.adminPanel')} primaryTypographyProps={{ fontSize: 16 }} />
                    </ListItemButton>
                )}

                {bottomNav.map((i) => (
                    <NavItem key={i.to} {...i} onClick={onItemClick} />
                ))}

                <ListItemButton
                    onClick={() => { logout(); onItemClick?.(); }}
                    className="dashboard-buttons dashboard-buttons__logout"
                >
                    <ListItemIcon><FiLogOut /></ListItemIcon>
                    <ListItemText primary={t('dashboard.menu.logout')} primaryTypographyProps={{ fontSize: 16 }} />
                </ListItemButton>
            </List>
        </Fragment>
    );
}

export default function DashboardLayout() {
    const isMobile = useMediaQuery("(max-width:860px)");
    const [open, setOpen] = useState(false);

    const toggle = (state?: boolean) => setOpen(prev => (typeof state === "boolean" ? state : !prev));
    const closeOnItem = () => { if (isMobile) toggle(false); };

    return (
        <Box display="flex" flexDirection="column" minHeight="100dvh" className="dashboard-layout">
            <Header 
                isAuthenticated 
                showBurger={isMobile}
                onMenuClick={() => toggle(true)}
            />

            <BookmarkPromptDialog />


            <Box component="main" sx={{ bgcolor: "#F5F5F5", flexGrow: 1, paddingBottom: 32, overflow: "hidden" }}>
                <Container 
                    maxWidth="lg"
                    sx={{ 
                        maxWidth: { xs: "100%", md: "lg" },
                        px: { xs: "16px", md: 3 },
                        overflow: "hidden",
                        width: "100%",
                        boxSizing: "border-box",
                        "& > *": {
                            maxWidth: "100%",
                            boxSizing: "border-box"
                        }
                    }}
                >
                    <Stack 
                        direction="row" 
                        spacing={3} 
                        alignItems="flex-start" 
                        sx={{ 
                            width: "100%", 
                            maxWidth: "100%", 
                            minWidth: 0,
                            boxSizing: "border-box",
                            overflow: "hidden"
                        }}
                    >

                        {isMobile ? (
                            <Drawer
                                anchor="left"
                                open={open}
                                onClose={() => toggle(false)}
                                PaperProps={{ sx: { width: 280, p: 1.5 } }}
                                ModalProps={{ keepMounted: true }}
                            >
                                <SidebarContent onItemClick={closeOnItem} />
                            </Drawer>
                        ) : (
                            <Paper elevation={0} sx={{ p: 1.5, width: 260, flexShrink: 0 }}>
                                <SidebarContent />
                            </Paper>
                        )}

                        <Box
                            flexGrow={1}
                            sx={{
                                width: "100%",
                                maxWidth: "100%",
                                minWidth: 0,
                                overflow: "hidden",
                                boxSizing: "border-box"
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
