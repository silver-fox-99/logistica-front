import { useEffect, useState } from "react";
import {
    Box, Paper, Stack, Typography, MenuItem, Select, CircularProgress, type SelectChangeEvent,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { dashboardApi, type Range } from "@/shared/api/dashboardApi";
import KpiCard from "@/widgets/dashboard/KpiCard";
import PriceTrendChart from "@/widgets/dashboard/PriceTrendChart";
import TopRoutesTable from "@/widgets/dashboard/TopRoutesTable";
import TopCountriesTabs from "@/widgets/dashboard/TopCountriesTabs";
import PowerUsersTable from "@/widgets/dashboard/PowerUsersTable";
import { FiActivity, FiUsers, FiPackage, FiTruck } from "react-icons/fi";
import TopInfoViewersTable from "@/widgets/dashboard/TopInfoViewersTable.tsx";
import {useAdminAccessStore} from "@/entities/adminAccess/model/adminAccess.store.ts";
import {viewCode} from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

export default function AdminOverviewPage() {
    const [range, setRange] = useState<Range>("30d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Awaited<ReturnType<typeof dashboardApi.getOverview>> | null>(null);
    const canViewDashboard = useAdminAccessStore((s) => s.hasPermission(viewCode('DASHBOARD' as any)));
    const load = async (r: Range) => {
        setLoading(true);
        try {
            const res = await dashboardApi.getOverview(r);
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(range); }, [range]);

    const onRangeChange = (e: SelectChangeEvent) => setRange(e.target.value as Range);

    if (!canViewDashboard) {
        return <NoAccess/>
    }

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3, bgcolor: "background.paper" }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>Обзор</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Метрики платформы, тренды и популярные списки активности пользователей
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">Период:</Typography>
                        <Select size="small" value={range} onChange={onRangeChange} sx={{ minWidth: 160, borderRadius: 2 }}>
                            <MenuItem value="1d">Последний 1 день</MenuItem>
                            <MenuItem value="7d">Последние 7 дней</MenuItem>
                            <MenuItem value="30d">Последние 30 дней</MenuItem>
                            <MenuItem value="90d">Последние 90 дней</MenuItem>
                        </Select>
                    </Stack>
                </Stack>
            </Paper>

            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}><CircularProgress /></Stack>
            ) : (
                <Stack spacing={3}>
                    {/* Top KPI Cards Block */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Новые пользователи"
                                value={data?.kpi.newUsers ?? 0}
                                icon={<FiUsers />}
                                color="primary"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Новые грузы"
                                value={data?.kpi.newCargos ?? 0}
                                icon={<FiPackage />}
                                color="success"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Новые транспортировки"
                                value={data?.kpi.newTransports ?? 0}
                                icon={<FiTruck />}
                                color="secondary"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Уникальные посетители"
                                value={data?.kpi.activeUsers ?? 0}
                                icon={<FiActivity />}
                                color="warning"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        {/* 1. Просмотр контактов (деталей) */}
                        <Grid size={{ xs: 12 }}>
                            <TopInfoViewersTable rows={data?.top.infoViewers ?? []} />
                        </Grid>

                        {/* 2. Динамика создания объявлений */}
                        <Grid size={{ xs: 12 }}>
                            <PriceTrendChart data={data?.series.creationTrend ?? []} />
                        </Grid>

                        {/* 3. Активные пользователи */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <PowerUsersTable rows={data?.top.powerUsers ?? []} />
                        </Grid>

                        {/* 4. Популярные страны */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <TopCountriesTabs
                                cargoPickup={data?.top.countries.cargo.pickup ?? []}
                                cargoDrop={data?.top.countries.cargo.dropoff ?? []}
                                transDep={data?.top.countries.transport.departure ?? []}
                                transArr={data?.top.countries.transport.arrival ?? []}
                            />
                        </Grid>

                        {/* 5. Популярные маршруты */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TopRoutesTable title="Популярные маршруты — Груз" rows={data?.top.routes.cargo ?? []} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TopRoutesTable title="Популярные маршруты — Транспорт" rows={data?.top.routes.transport ?? []} />
                        </Grid>
                    </Grid>
                </Stack>
            )}
        </Box>
    );
}
