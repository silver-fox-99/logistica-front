import { useMemo, useState, useEffect } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Button,
    Tabs,
    Tab,
    Pagination,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiFilter, FiTruck, FiPackage, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { usePublicShipments } from "@/entities/public-shipment/model/usePublicShipmets";
import { PublicShipmentCard } from "@/widgets/public/PublicShipmentCard";
import { PublicFiltersDrawer } from "@/widgets/public/PublicFiltersDrawer";
import type { PublicFilters } from "@/entities/public-shipment/model/types";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";

type TabKind = "cargo" | "transport";

const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function HomePage() {
    const { t } = useTranslation();
    const { loadInit } = useInitStore();
    const user = useUserStore((s) => s.user);

    const isAuthenticated = !!user;

    const [tab, setTab] = useState<TabKind>("cargo");
    const [page, setPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<PublicFilters>(() => {
        const storedKey = `shipments:public-filters:cargo`;
        try {
            const raw = localStorage.getItem(storedKey);
            if (raw) return JSON.parse(raw);
        } catch {}
        return { pickup_date_from: getTodayDateString() };
    });

    const limit = 10;

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const { items, pages, total, loading } = usePublicShipments(tab, page, limit, filters);

    const list = useMemo(() => items, [items]);

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter((value) => value !== undefined && value !== "").length;
    }, [filters]);

    return (
        <Box sx={{ py: { xs: 1.5, md: 2.5 } }}>
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 1.5, md: 2 },
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Stack spacing={1.5}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", md: "center" }}
                        gap={1.5}
                    >
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                            <Typography variant="h5" fontWeight={700}>
                                {t("homePage.title")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.subtitle")}
                            </Typography>
                        </Stack>

                        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                            <Button
                                variant="outlined"
                                startIcon={<FiFilter />}
                                sx={{ textTransform: "none" }}
                                onClick={() => setDrawerOpen(true)}
                            >
                                {t("homePage.filtersButton")}
                            </Button>

                            {activeFiltersCount > 0 ? (
                                <Chip
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    label={t("homePage.filtersCount", { count: activeFiltersCount })}
                                />
                            ) : null}

                            <Chip
                                size="small"
                                variant="outlined"
                                label={t("homePage.totalCount", { count: total })}
                            />
                        </Stack>
                    </Stack>

                    <Tabs
                        value={tab}
                        onChange={(_, value: TabKind) => {
                            setTab(value);
                            setPage(1);
                            const storedKey = `shipments:public-filters:${value}`;
                            try {
                                const raw = localStorage.getItem(storedKey);
                                if (raw) {
                                    setFilters(JSON.parse(raw));
                                    return;
                                }
                            } catch {}
                            setFilters({ pickup_date_from: getTodayDateString() });
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab
                            value="cargo"
                            icon={<FiPackage />}
                            iconPosition="start"
                            label={t("homePage.cargoTab")}
                        />
                        <Tab
                            value="transport"
                            icon={<FiTruck />}
                            iconPosition="start"
                            label={t("homePage.transportTab")}
                        />
                    </Tabs>
                </Stack>
            </Paper>

            <Grid container spacing={1.5}>
                {list.map((item) => (
                    <Grid key={item.id} size={{ xs: 12 }}>
                        <PublicShipmentCard
                            data={item}
                            kind={tab}
                            cta={{
                                label: isAuthenticated ? t("homePage.moreDetails") : t("header.register"),
                                href: isAuthenticated ? "/dashboard/search" : "/auth/register",
                                icon: <FiChevronRight />,
                            }}
                        />
                    </Grid>
                ))}

                {!loading && list.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography fontWeight={700}>{t("homePage.noResults")}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.noResultsHint")}
                            </Typography>
                        </Paper>
                    </Grid>
                ) : null}

                {loading ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.loading")}
                            </Typography>
                        </Paper>
                    </Grid>
                ) : null}
            </Grid>

            {pages > 1 ? (
                <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} siblingCount={1} />
                </Stack>
            ) : null}

            <PublicFiltersDrawer
                open={drawerOpen}
                kind={tab}
                initial={filters}
                onClose={() => setDrawerOpen(false)}
                onApply={(nextFilters) => {
                    setFilters(nextFilters);
                    setPage(1);
                    setDrawerOpen(false);
                }}
            />
        </Box>
    );
}