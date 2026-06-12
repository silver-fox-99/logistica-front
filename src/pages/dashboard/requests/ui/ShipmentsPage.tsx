import { useCallback, useMemo, useState } from "react";
import { Box, Button, Paper, Stack, Typography} from "@mui/material";
import { FiSliders } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicFilters } from "@/widgets/public/PublicFiltersDrawer";

import { ShipmentsListBody } from "@/widgets/shipments/ShipmentsListBody";
import { ShipmentsFilterDrawerForm } from "@/widgets/shipments/ShipmentsFilterDrawerForm.tsx";
import { PublicPlacementBanner } from "@/widgets/public-ads/ui/PublicPlacementBanner";

import "./MyShipmentsPage.scss";

type Props = { scope: "public" | "my" };

const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getStoredFilters = (): PublicFilters => {
    if (typeof window === "undefined") return { pickup_date_from: getTodayDateString() };
    try {
        const raw = localStorage.getItem("shipments:filters:drawer-form");
        if (raw) {
            const parsed = JSON.parse(raw);
            const { kind, ...filters } = parsed;
            return filters;
        }
    } catch {}
    return { pickup_date_from: getTodayDateString() };
};

const getStoredKind = (): ShipmentsKind => {
    if (typeof window === "undefined") return "cargo";
    try {
        const raw = localStorage.getItem("shipments:filters:drawer-form");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.kind) return parsed.kind;
        }
    } catch {}
    return "cargo";
};

export default function ShipmentsListPage({ scope }: Props) {
    const { t } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>(() => getStoredKind());
    const [appliedFilters, setAppliedFilters] = useState<PublicFilters>(() => getStoredFilters());

    const [reloadKey, setReloadKey] = useState(0);
    const requestReload = useCallback(() => setReloadKey((k) => k + 1), []);

    const listKey = useMemo(() => {
        return `${appliedKind}-${JSON.stringify(appliedFilters)}`;
    }, [appliedKind, appliedFilters]);

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: "divider",
                    mb: 2,
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                >
                    <Box className="shipments-page__icon">
                        <svg
                            width="42"
                            height="42"
                            viewBox="0 0 42 42"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7" />
                            <circle cx="18" cy="18" r="6" stroke="#4472B8" strokeWidth="2.5" fill="none" />
                            <path d="M24 24L28 28" stroke="#4472B8" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="shipments-page__title">
                            {scope === "my"
                                ? t("shipments.myShipments.title")
                                : t("shipments.myShipments.searchTitle")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                            className="shipments-page__subtitle"
                        >
                            {scope === "my"
                                ? t("shipments.myShipments.description")
                                : t("shipments.myShipments.searchDescription")}
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            textAlign: "right",
                            minWidth: { xs: "100%", sm: "auto" },
                            alignSelf: { xs: "flex-start", sm: "center" },
                        }}
                    >
                        {t("shipments.total", { count: totalCount })}
                    </Typography>
                </Box>
            </Paper>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                sx={{ mb: 1, width: "100%" }}
            >
                <Button
                    variant="contained"
                    startIcon={<FiSliders />}
                    sx={{ textTransform: "none", width: { xs: "100%", sm: "auto" } }}
                    onClick={() => setDrawerOpen(true)}
                >
                    {t("shipments.filter.button")}
                </Button>
            </Stack>

            <PublicPlacementBanner
                page="/dashboard/search"
                placementKey="top-list"
            />

            <div key={listKey}>
                <ShipmentsListBody
                    scope={scope}
                    kind={appliedKind}
                    filters={appliedFilters}
                    onRequestReload={requestReload}
                    onTotalChange={setTotalCount}
                    reloadKey={reloadKey}
                />
            </div>

            <ShipmentsFilterDrawerForm
                open={drawerOpen}
                initialKind={appliedKind}
                initialFilters={appliedFilters}
                onClose={() => setDrawerOpen(false)}
                onApply={(kind, filters) => {
                    setDrawerOpen(false);
                    setAppliedKind(kind);
                    setAppliedFilters(Object.keys(filters).length === 0 ? {} : filters);
                    setReloadKey((k) => k + 1);
                }}
            />
        </>
    );
}