import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Alert, Chip, Container, Stack, Typography, Button } from "@mui/material";
import { FiArrowLeft, FiShield, FiUser } from "react-icons/fi";
import { useAdminUser } from "@/features/admin/admin-user/model/useAdminUser";
import { GeneralInfoForm } from "@/features/admin/admin-user/ui/GeneralInfoForm";
import { PasswordForm } from "@/features/admin/admin-user/ui/PasswordForm";
import { AdminToggle } from "@/features/admin/admin-user/ui/AdminToggle";
import { StatusStageForm } from "@/features/admin/admin-user/ui/StatusStageForm";
import { MetaForm } from "@/features/admin/admin-user/ui/MetaForm";
import { SessionsCard } from "@/features/admin/admin-user/ui/SessionsCard";
import { DangerZoneCard } from "@/features/admin/admin-user/ui/DangerZoneCard";
import {CrmIntegrationCard} from "@/features/admin/admin-user/ui/CrmIntegrationCard.tsx";

export default function AdminUserPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { user, sessions, loading, err, setUser } = useAdminUser(id);

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
                    </Stack>
                    <Button variant="outlined" startIcon={<FiArrowLeft/>} onClick={() => navigate("/admin/users")}>
                        Назад к списку
                    </Button>
                </Stack>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <GeneralInfoForm user={user} onUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <PasswordForm user={user} onUpdated={(u) => setUser(u)}/>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <AdminToggle user={user} onUpdated={(u) => setUser(u)}/>
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
