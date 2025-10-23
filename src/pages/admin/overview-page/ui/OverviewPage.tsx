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
                        <Typography variant="h6" fontWeight={700}>Admin overview</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Platform metrics, trends and top lists
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">Range:</Typography>
                        <Select size="small" value={range} onChange={onRangeChange} sx={{ minWidth: 120 }}>
                            <MenuItem value="7d">Last 7 days</MenuItem>
                            <MenuItem value="30d">Last 30 days</MenuItem>
                            <MenuItem value="90d">Last 90 days</MenuItem>
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
                            <KpiCard title="New users" value={data?.kpi.newUsers ?? 0} icon={<FiUsers size={24} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard title="New cargos" value={data?.kpi.newCargos ?? 0} icon={<FiPackage size={24} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard title="New transports" value={data?.kpi.newTransports ?? 0} icon={<FiTruck size={24} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <KpiCard
                                title="Avg price (7d)"
                                value={`Cargo: ${avgCargo.toFixed(0)} | Transport: ${avgTransport.toFixed(0)}`}
                                icon={<FiTrendingUp size={24} />}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <PriceTrendChart data={data?.series.priceTrend ?? []} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TopRoutesTable title="Top routes — Cargo" rows={data?.top.routes.cargo ?? []} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TopRoutesTable title="Top routes — Transport" rows={data?.top.routes.transport ?? []} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TopCountriesTabs
                                cargoPickup={data?.top.countries.cargo.pickup ?? []}
                                cargoDrop={data?.top.countries.cargo.dropoff ?? []}
                                transDep={data?.top.countries.transport.departure ?? []}
                                transArr={data?.top.countries.transport.arrival ?? []}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <PowerUsersTable rows={data?.top.powerUsers ?? []} />
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
