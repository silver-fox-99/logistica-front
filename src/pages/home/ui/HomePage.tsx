import { useMemo, useState, useEffect } from "react";
import { Box, Paper, Stack, Typography, Button, Tabs, Tab, Pagination, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiFilter, FiTruck, FiPackage, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { usePublicShipments } from "@/entities/public-shipment/model/usePublicShipmets";
import { PublicShipmentCard } from "@/widgets/public/PublicShipmentCard";
import { PublicFiltersDrawer } from "@/widgets/public/PublicFiltersDrawer";
import type {PublicFilters} from "@/entities/public-shipment/model/types.ts";
import { useInitStore } from "@/shared/store/initStore";

type TabKind = "cargo" | "transport";

export default function HomePage() {
    const { t } = useTranslation();
    const { loadInit } = useInitStore();
    const [tab, setTab] = useState<TabKind>("cargo");
    const [page, setPage] = useState(1);
    const limit = 10;

  //  const getTodayDate = () => {
  //      const today = new Date();
  //      return today.toISOString().split('T')[0];
  //  };
//
  //  const getDefaultDatePlus30 = () => {
  //      const date = new Date();
  //      date.setDate(date.getDate() + 30);
  //      return date.toISOString().split('T')[0];
  //  };

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<PublicFilters>({});

    useEffect(() => {
        loadInit();
    }, [loadInit]);

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
                        <Typography variant="h5" fontWeight={700}>{t("homePage.title")}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("homePage.subtitle")}
                        </Typography>
                    </Stack>

                    <Stack direction="row" gap={1} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<FiFilter />}
                            sx={{ textTransform: "none" }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            {t("homePage.filtersButton")}
                        </Button>
                        {activeFiltersCount > 0 && (
                            <Chip size="small" color="primary" variant="outlined" label={t("homePage.filtersCount", { count: activeFiltersCount })} />
                        )}
                        <Chip size="small" color="default" variant="outlined" label={t("homePage.totalCount", { count: total })} />
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
                    <Tab value="cargo" icon={<FiPackage />} iconPosition="start" label={t("homePage.cargoTab")} />
                    <Tab value="transport" icon={<FiTruck />} iconPosition="start" label={t("homePage.transportTab")} />
                </Tabs>
            </Paper>

            <Box sx={{ 
                width: "100%", 
                overflow: { xs: "hidden", md: "visible" }, 
                boxSizing: "border-box" 
            }}>
                <Grid container spacing={{ xs: 0, md: 1.5 }} sx={{ 
                    width: "100%", 
                    margin: { xs: "0 !important", md: 0 }, 
                    marginLeft: { xs: "0 !important", md: 0 }, 
                    marginRight: { xs: "0 !important", md: 0 } 
                }}>
                    {list.map((item) => (
                        <Grid key={item.id} size={{ xs: 12 }} sx={{ 
                            padding: { xs: "0 0 12px 0", md: 0 }, 
                            width: "100%", 
                            maxWidth: "100%", 
                            boxSizing: "border-box" 
                        }}>
                            <PublicShipmentCard
                                data={item}
                                cta={{
                                    label: t("homePage.moreDetails"),
                                    href: `/login?next=/${tab}/${item.id}`,
                                    icon: <FiChevronRight />,
                                }}
                                kind={tab}
                                mobileLayout="column"
                            />
                        </Grid>
                    ))}

                    {!loading && list.length === 0 && (
                        <Grid size={{ xs: 12 }} sx={{ padding: { xs: "0 0 12px 0", md: 0 } }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography>{t("homePage.noResults")}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t("homePage.noResultsHint")}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                    {loading && (
                        <Grid size={{ xs: 12 }} sx={{ padding: { xs: "0 0 12px 0", md: 0 } }}>
                            <Typography variant="body2" color="text.secondary">{t("homePage.loading")}</Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>

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
