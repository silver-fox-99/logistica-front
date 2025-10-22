import { useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, Button, Tabs, Tab, Pagination, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiFilter, FiTruck, FiPackage, FiChevronRight } from "react-icons/fi";
import { usePublicShipments } from "@/entities/public-shipment/model/usePublicShipmets";
import { PublicShipmentCard } from "@/widgets/public/PublicShipmentCard";
import { PublicFiltersDrawer } from "@/widgets/public/PublicFiltersDrawer";
import type {PublicFilters} from "@/entities/public-shipment/model/types.ts";

type TabKind = "cargo" | "transport";

export default function HomePage() {
    const [tab, setTab] = useState<TabKind>("cargo");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<PublicFilters>({});

    const { items, pages, total, loading } = usePublicShipments(tab, page, limit, filters);
    const list = useMemo(() => items, [items]);

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter(v => v !== undefined && v !== "").length;
    }, [filters]);

    return (
        <Box sx={{ py: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Stack>
                        <Typography variant="h5" fontWeight={700}>Find shipments</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Browse public cargo and available transport. Sign in to see full details.
                        </Typography>
                    </Stack>

                    <Stack direction="row" gap={1} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<FiFilter />}
                            sx={{ textTransform: "none" }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            Filters
                        </Button>
                        {activeFiltersCount > 0 && (
                            <Chip size="small" color="primary" variant="outlined" label={`Filters: ${activeFiltersCount}`} />
                        )}
                        <Chip size="small" color="default" variant="outlined" label={`Total: ${total}`} />
                    </Stack>
                </Stack>

                <Tabs
                    value={tab}
                    onChange={(_, v) => {
                        setTab(v);
                        setPage(1);
                    }}
                    sx={{ mt: 1 }}
                >
                    <Tab value="cargo" icon={<FiPackage />} iconPosition="start" label="Cargo" />
                    <Tab value="transport" icon={<FiTruck />} iconPosition="start" label="Transport" />
                </Tabs>
            </Paper>

            <Grid container spacing={1.5}>
                {list.map((item) => (
                    <Grid key={item.id} size={{ xs: 12 }}>
                        <PublicShipmentCard
                            data={item}
                            cta={{
                                label: "More details",
                                href: `/login?next=/${tab}/${item.id}`,
                                icon: <FiChevronRight />,
                            }}
                            kind={tab}
                        />
                    </Grid>
                ))}

                {loading && (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">Loading...</Typography>
                    </Grid>
                )}

                {!loading && list.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography>No results</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try switching a tab or adjusting filters.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} siblingCount={1} />
            </Stack>

            <PublicFiltersDrawer
                open={drawerOpen}
                kind={tab}
                initial={filters}
                onClose={() => setDrawerOpen(false)}
                onApply={(f) => {
                    setFilters(f);
                    setPage(1);
                    setDrawerOpen(false);
                }}
            />
        </Box>
    );
}
