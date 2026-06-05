import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import { Alert, Chip, Container, Stack, Typography, Button, Tabs, Tab, Box, Card, Avatar } from "@mui/material";
import { FiArrowLeft, FiShield, FiUser, FiLogIn, FiCreditCard, FiActivity, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAdminUser } from "@/features/admin/admin-user/model/useAdminUser";
import { GeneralInfoForm } from "@/features/admin/admin-user/ui/GeneralInfoForm";
import { PasswordForm } from "@/features/admin/admin-user/ui/PasswordForm";
import { AdminToggle } from "@/features/admin/admin-user/ui/AdminToggle";
import { StatusStageForm } from "@/features/admin/admin-user/ui/StatusStageForm";
import { MetaForm } from "@/features/admin/admin-user/ui/MetaForm";
import { SessionsCard } from "@/features/admin/admin-user/ui/SessionsCard";
import { DangerZoneCard } from "@/features/admin/admin-user/ui/DangerZoneCard";
import { CrmIntegrationCard } from "@/features/admin/admin-user/ui/CrmIntegrationCard.tsx";
import TariffCard from "@/widgets/admin/users/TariffCard";
import UserInvoices from "@/widgets/admin/users/UserInvoices";
import { adminUsersApi } from "@/shared/api/adminUsersApi";
import { authApi } from "@/shared/api/authApi";
import { useUserStore } from "@/entities/user/model/user.store";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store.ts";
import { viewCode } from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

export default function AdminUserPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { user, sessions, groups, loading, err, setUser, setGroups } = useAdminUser(id);
    const setCurrentUser = useUserStore((s) => s.setUser);
    const [impersonating, setImpersonating] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const canViewUserDetails = useAdminAccessStore((s) => s.hasPermission(viewCode('USER_DETAILS' as any)));

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleImpersonate = async () => {
        if (!id) return;
        setImpersonating(true);
        try {
            const tokens = await adminUsersApi.impersonate(id, "Admin impersonation");

            if (tokens.accessToken) localStorage.setItem("accessToken", tokens.accessToken);
            if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);

            try {
                const me = await authApi.getMe();
                if (me?.data) setCurrentUser(me.data);
            } catch (error) {
                console.error(error);
            }

            toast.success("Вы вошли под пользователем");
            navigate("/dashboard/profile");
        } catch (e: any) {
            const message = e?.response?.data?.message ?? "Не удалось выполнить вход под пользователем";
            toast.error(message);
        } finally {
            setImpersonating(false);
        }
    };

    if (!canViewUserDetails) return <NoAccess/>;

    if (loading) return <Container sx={{ py: 4 }}><Typography color="text.secondary">Загрузка…</Typography></Container>;
    if (!user)   return <Container sx={{ py: 4 }}><Alert severity="error">{err ?? " Пользователь не найден"}</Alert></Container>;

    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

    return (
        <Container disableGutters sx={{ pb: 6 }}>
            <Stack spacing={3}>
                {/* Modern User Header Card */}
                <Card variant="outlined" sx={{ borderRadius: 2, background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.06) 0%, rgba(25, 118, 210, 0.01) 100%)', p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Stack direction="row" spacing={3} alignItems="center" flexWrap={{ xs: "wrap", sm: "nowrap" }} gap={{ xs: 2, sm: 0 }}>
                                <Avatar 
                                    src={user.avatar || undefined} 
                                    sx={{ 
                                        width: 80, 
                                        height: 80, 
                                        fontSize: 32, 
                                        bgcolor: user.is_admin ? 'warning.main' : 'primary.main',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {user.first_name?.[0] || user.phone?.[0] || '?'}
                                </Avatar>
                                <Stack spacing={1}>
                                    <Typography variant="h5" fontWeight={700}>
                                        {fullName || 'Пользователь без имени'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                                        <Chip size="small" label={`ID: ${user.id.slice(0, 8)}`} />
                                        {user.is_admin && <Chip size="small" icon={<FiShield/>} color="warning" label="Администратор" />}
                                        <Chip size="small" label={user.status}
                                              color={user.status === "ACTIVE" ? "success" : "default"}
                                              variant={user.status === "ACTIVE" ? "filled" : "outlined"} />
                                        {user.type && <Chip size="small" label={user.type} />}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    startIcon={<FiLogIn />}
                                    onClick={handleImpersonate}
                                    disabled={impersonating}
                                >
                                    Войти
                                </Button>
                                <Button variant="outlined" startIcon={<FiArrowLeft/>} onClick={() => navigate("/admin/users")}>
                                    Назад к списку
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Card>

                {/* Tab Navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="user admin tabs" variant="scrollable" scrollButtons="auto">
                        <Tab icon={<FiUser />} iconPosition="start" label="Общая информация" />
                        <Tab icon={<FiShield />} iconPosition="start" label="Доступ и роли" />
                        <Tab icon={<FiCreditCard />} iconPosition="start" label="Тарифы и счета" />
                        <Tab icon={<FiActivity />} iconPosition="start" label="Сессии" />
                        <Tab icon={<FiAlertTriangle />} iconPosition="start" label="Опасная зона" />
                    </Tabs>
                </Box>

                {/* Tab Panels */}
                <Box sx={{ mt: 1 }}>
                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <GeneralInfoForm user={user} onUpdated={(u) => setUser(u)}/>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <CrmIntegrationCard user={user} onUpdated={(u) => setUser(u)} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <StatusStageForm user={user} onUpdated={(u) => setUser(u)}/>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <MetaForm user={user} onUpdated={(u) => setUser(u)}/>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <PasswordForm user={user} onUpdated={(u) => setUser(u)}/>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <AdminToggle userGroups={groups} onGroupsUpdated={(g) => setGroups(g)} user={user} onUserUpdated={(u) => setUser(u)}/>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 2 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TariffCard userId={id} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <UserInvoices userId={id} />
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 3 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <SessionsCard sessions={sessions}/>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 4 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <DangerZoneCard
                                    user={user}
                                    onBanned={(u) => setUser(u)}
                                    onDeleted={() => navigate("/admin/users")}
                                />
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Stack>
        </Container>
    );
}
