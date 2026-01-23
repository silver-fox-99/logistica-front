import { useEffect, useMemo, useState } from "react";
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
import RecentActivity from "@/widgets/dashboard/RecentActivity";
import { FiTrendingUp, FiUsers, FiPackage, FiTruck } from "react-icons/fi";
import TopInfoViewersTable from "@/widgets/dashboard/TopInfoViewersTable.tsx";

export default function AdminOverviewPage() {
    const [range, setRange] = useState<Range>("30d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Awaited<ReturnType<typeof dashboardApi.getOverview>> | null>(null);

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

    const avgCargo = useMemo(() => data?.kpi.avgPrice7d.cargo ?? 0, [data]);
    const avgTransport = useMemo(() => data?.kpi.avgPrice7d.transport ?? 0, [data]);

    const onRangeChange = (e: SelectChangeEvent) => setRange(e.target.value as Range);

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack>
                        <Typography variant="h6" fontWeight={700}>Обзор</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Метрики платформы, тренды и популярные списки
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">Период:</Typography>
                        <Select size="small" value={range} onChange={onRangeChange} sx={{ minWidth: 120 }}>
                            <MenuItem value="7d">Последние 7 дней</MenuItem>
                            <MenuItem value="30d">Последние 30 дней</MenuItem>
                            <MenuItem value="90d">Последние 90 дней</MenuItem>
                        </Select>
                    </Stack>
                </Stack>
            </Paper>

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
            ) : (
                <>
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard title="Новые пользователи" value={data?.kpi.newUsers ?? 0} icon={<FiUsers size={24} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard title="Новые грузы" value={data?.kpi.newCargos ?? 0} icon={<FiPackage size={24} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard title="Новые транспортировки" value={data?.kpi.newTransports ?? 0} icon={<FiTruck size={24} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard
                                title="Средняя цена (7д)"
                                value={`Cargo: ${avgCargo.toFixed(0)} | Transport: ${avgTransport.toFixed(0)}`}
                                icon={<FiTrendingUp size={24} />}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <PriceTrendChart data={data?.series.priceTrend ?? []} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TopRoutesTable title="Популярные маршруты — Груз" rows={data?.top.routes.cargo ?? []} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TopRoutesTable title="Популярные маршруты — Транспорт" rows={data?.top.routes.transport ?? []} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TopCountriesTabs
                                cargoPickup={data?.top.countries.cargo.pickup ?? []}
                                cargoDrop={data?.top.countries.cargo.dropoff ?? []}
                                transDep={data?.top.countries.transport.departure ?? []}
                                transArr={data?.top.countries.transport.arrival ?? []}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <PowerUsersTable rows={data?.top.powerUsers ?? []} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TopInfoViewersTable rows={data?.top.infoViewers ?? []} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RecentActivity />
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}
