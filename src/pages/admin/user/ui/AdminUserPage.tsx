import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import { Alert, Chip, Container, Stack, Typography, Button } from "@mui/material";
import { FiArrowLeft, FiShield, FiUser, FiLogIn } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAdminUser } from "@/features/admin/admin-user/model/useAdminUser";
import { GeneralInfoForm } from "@/features/admin/admin-user/ui/GeneralInfoForm";
import { PasswordForm } from "@/features/admin/admin-user/ui/PasswordForm";
import { AdminToggle } from "@/features/admin/admin-user/ui/AdminToggle";
import { StatusStageForm } from "@/features/admin/admin-user/ui/StatusStageForm";
import { MetaForm } from "@/features/admin/admin-user/ui/MetaForm";
import { SessionsCard } from "@/features/admin/admin-user/ui/SessionsCard";
import { DangerZoneCard } from "@/features/admin/admin-user/ui/DangerZoneCard";
import {CrmIntegrationCard} from "@/features/admin/admin-user/ui/CrmIntegrationCard.tsx";
import TariffCard from "@/widgets/admin/users/TariffCard";
import UserInvoices from "@/widgets/admin/users/UserInvoices";
import { adminUsersApi } from "@/shared/api/adminUsersApi";
import { authApi } from "@/shared/api/authApi";
import { useUserStore } from "@/entities/user/model/user.store";
import {useAdminAccessStore} from "@/entities/adminAccess/model/adminAccess.store.ts";
import {viewCode} from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

export default function AdminUserPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { user, sessions, groups, loading, err, setUser, setGroups } = useAdminUser(id);
    const setCurrentUser = useUserStore((s) => s.setUser);
    const [impersonating, setImpersonating] = useState(false);
    const canViewUserDetails = useAdminAccessStore((s) => s.hasPermission(viewCode('USER_DETAILS' as any)));

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


    if (!canViewUserDetails) return <NoAccess/>

    if (loading) return <Container><Typography color="text.secondary">Загрузка…</Typography></Container>;
    if (!user)   return <Container><Alert severity="error">{err ?? " Пользователь не найден"}</Alert></Container>;

    return (
        <Container disableGutters>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FiUser/>
                        <Typography variant="h5" fontWeight={700}>Детали пользователя</Typography>
                        <Chip size="small" label={user.id.slice(0, 8)} />
                        {user.is_admin && <Chip size="small" icon={<FiShield/>} color="warning" label="Администратор" />}
                        <Chip size="small" label={user.status}
                              color={user.status === "ACTIVE" ? "success" : "default"}
                              variant={user.status === "ACTIVE" ? "filled" : "outlined"} />
                        {user.type && <Chip size="small" label={user.type} />}
                        {user.phone_verified_at ? (
                            <Chip
                                size="small"
                                color="success"
                                label="Телефон подтвержден"
                            />
                        ) : (
                            <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                label="Телефон не подтвержден"
                            />
                        )}
                    </Stack>
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
                </Stack>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <GeneralInfoForm user={user} onUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <PasswordForm user={user} onUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <AdminToggle userGroups={groups} onGroupsUpdated={(g) => setGroups(g)} user={user} onUserUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <CrmIntegrationCard user={user} onUpdated={(u) => setUser(u)} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <StatusStageForm user={user} onUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <MetaForm user={user} onUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TariffCard userId={id} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <UserInvoices userId={id} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <SessionsCard sessions={sessions}/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <DangerZoneCard
                            user={user}
                            onBanned={(u) => setUser(u)}
                            onDeleted={() => navigate("/admin/users")}
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Container>
    );
}
