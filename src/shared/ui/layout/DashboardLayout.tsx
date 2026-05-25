import { Outlet, NavLink } from "react-router-dom";
import React, { useState, Fragment } from "react";
import {
    Box, Container, Paper, Stack, Button, Divider, List, ListItemButton,
    ListItemIcon, ListItemText, Drawer,  useMediaQuery,
    CircularProgress, Collapse
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
    FiShield, FiUser, FiCreditCard, FiHelpCircle, FiPackage, FiTruck,
    FiLogOut, FiSearch,
    FiAward, FiFileText, FiChevronDown, FiChevronRight, FiList
} from "react-icons/fi";
import { RiAdminFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { useUserStore } from "@/entities/user/model/user.store";
import "./DashboardLayout.scss";
import BookmarkPromptDialog from "@/features/bookmarkPrompt/ui/BookmarkPromptDialog";
import { CompanyWorkspaceSidebar } from "@/widgets/company/company-workspace-sidebar/ui/CompanyWorkspaceSidebar";
import { useIsCompanyWorkspace } from "@/pages/dashboard/company/workspace/model/useIsCompanyWorkspace";
import { useCompanySidebarCompany } from "@/pages/dashboard/company/workspace/model/useCompanySidebarCompany";
import { TenderWorkspaceSidebar } from "@/widgets/tender/tender-workspace-sidebar/ui/TenderWorkspaceSidebar";
import { useTenderWorkspaceAccessStore } from "@/entities/tender/model/tenderWorkspaceAccess.store";

function NavItem({ to, icon, label, onClick, end }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void; end?: boolean }) {
    return (
        <ListItemButton component={NavLink} to={to} end={end} className="dashboard-buttons" onClick={onClick}>
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
    const location = useLocation();
    const [tendersOpen, setTendersOpen] = useState(() => location.pathname.startsWith("/dashboard/tenders"));

    const mainNav = [
        { to: "/dashboard/search",   icon: <FiSearch />,      label: t('dashboard.menu.search') },
        { to: "/dashboard/profile",  icon: <FiUser />,        label: t('dashboard.menu.profile') },
        { to: "/dashboard/company",  icon: <FiPackage />,     label: t('dashboard.menu.company') },
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

                <ListItemButton
                    className={`dashboard-buttons ${location.pathname.startsWith("/dashboard/tenders") ? "active" : ""}`}
                    onClick={() => setTendersOpen((value) => !value)}
                >
                    <ListItemIcon><FiFileText /></ListItemIcon>
                    <ListItemText primary={t("dashboard.menu.tenders")} primaryTypographyProps={{ fontSize: 16 }} />
                    {tendersOpen ? <FiChevronDown /> : <FiChevronRight />}
                </ListItemButton>

                <Collapse in={tendersOpen} timeout="auto" unmountOnExit>
                    <List disablePadding sx={{ mt: 0.5, pl: 1 }}>
                        <NavItem to="/dashboard/tenders" end icon={<FiSearch />} label={t("dashboard.menu.tenderSearch")} onClick={onItemClick} />
                        <NavItem to="/dashboard/tenders/my" icon={<FiList />} label={t("dashboard.menu.myTenders")} onClick={onItemClick} />
                    </List>
                </Collapse>
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
    const location = useLocation();
    const tenderAccess = useTenderWorkspaceAccessStore((state) => state);

    const isCompanyWorkspace = useIsCompanyWorkspace();
    const { company, isLoading: isCompanyLoading } = useCompanySidebarCompany();
    const tenderWorkspaceMatch = location.pathname.match(/^\/dashboard\/tenders\/([^/]+)\/(overview|bids|settings)/);
    const tenderId = tenderWorkspaceMatch?.[1] ?? "";
    const tenderSidebarCanManage = Boolean(tenderId && tenderAccess.tenderId === tenderId && tenderAccess.canManage);

    const toggle = (state?: boolean) => setOpen(prev => (typeof state === "boolean" ? state : !prev));
    const closeOnItem = () => { if (isMobile) toggle(false); };

    const sidebarContent = tenderId ? (
        <TenderWorkspaceSidebar tenderId={tenderId} canManage={tenderSidebarCanManage} onItemClick={closeOnItem} />
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
                                {sidebarContent}
                            </Drawer>
                        ) : (
                            <Paper elevation={0} sx={{ p: 1.5, width: 260, flexShrink: 0, borderRadius: 3 }}>
                                {sidebarContent}
                            </Paper>
                        )}

                        <Box
                            flexGrow={1}
                            sx={{
                                width: "100%",
                                maxWidth: "100%",
                                minWidth: 0,
                                overflow: "hidden",
                                boxSizing: "border-box",
                                mt: "12px !important"
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
