import { useCallback, useMemo, useState } from "react";
import {Alert, Box, Button, Paper, Stack, Typography} from "@mui/material";
import { FiLayers, FiSliders } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicFilters } from "@/widgets/public/PublicFiltersDrawer";

import { ShipmentsFilterDrawerForm } from "@/widgets/shipments/ShipmentsFilterDrawerForm.tsx";
import { MyShipmentsManageToolbar } from "@/widgets/my-shipments-manage/ui/MyShipmentsManageToolbar";
import { MyShipmentsManageList } from "@/widgets/my-shipments-manage/ui/MyShipmentsManageList";
import { MyShipmentsBulkActionsDrawer } from "@/widgets/my-shipments-bulk-actions-drawer/ui/MyShipmentsBulkActionsDrawer";

import {
    cargoBulkAction,
    transportBulkAction,
} from "@/shared/api/shipmentsActions";

type BulkActionPayload =
    | { action: "raise" }
    | { action: "delete" }
    | {
    action: "update";
    payload: {
        date_from?: string;
        date_to?: string;
        price_amount?: number;
        price_currency?: string;
        bargain?: string | null;
        allow_partial_load?: boolean;
        note?: string | null;
    };
};

const DEFAULT_KIND: ShipmentsKind = "cargo";
const DEFAULT_FILTERS: PublicFilters = {};

export default function MyShipmentsManagePage() {
    const { t } = useTranslation();

    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);

    const [totalCount, setTotalCount] = useState(0);
    const [pageIds, setPageIds] = useState<string[]>([]);

    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>(DEFAULT_KIND);
    const [appliedFilters, setAppliedFilters] = useState<PublicFilters>(DEFAULT_FILTERS);

    const [reloadKey, setReloadKey] = useState(0);
    const requestReload = useCallback(() => setReloadKey((k) => k + 1), []);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const listKey = useMemo(() => {
        return `${appliedKind}-${JSON.stringify(appliedFilters)}-${reloadKey}`;
    }, [appliedKind, appliedFilters, reloadKey]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const selectedCount = selectedIds.length;

    const toggleOne = useCallback((id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }

            return [...prev, id];
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const selectAllOnPage = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            pageIds.forEach((id) => {
                next.add(id);
            });

            return Array.from(next);
        });
    }, [pageIds]);

    const deselectAllOnPage = useCallback(() => {
        if (!pageIds.length) return;

        setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }, [pageIds]);

    const allPageSelected = useMemo(() => {
        if (!pageIds.length) return false;
        return pageIds.every((id) => selectedSet.has(id));
    }, [pageIds, selectedSet]);

    const hasAnyPageSelected = useMemo(() => {
        if (!pageIds.length) return false;
        return pageIds.some((id) => selectedSet.has(id));
    }, [pageIds, selectedSet]);

    const handleBulkSubmit = useCallback(
        async (actionData: BulkActionPayload) => {
            const ids = [...selectedIds];

            if (!ids.length) {
                return;
            }

            if (actionData.action === "update") {
                toast.info(
                    t("shipments.messages.bulkUpdateNotReady", {
                        defaultValue: "Bulk update is not available yet.",
                    })
                );
                return;
            }

            try {
                if (appliedKind === "cargo") {
                    if (actionData.action === "raise") {
                        await cargoBulkAction({
                            action: "up",
                            ids,
                        });
                    }

                    if (actionData.action === "delete") {
                        await cargoBulkAction({
                            action: "delete",
                            ids,
                        });
                    }
                } else {
                    if (actionData.action === "raise") {
                        await transportBulkAction({
                            action: "up",
                            ids,
                        });
                    }

                    if (actionData.action === "delete") {
                        await transportBulkAction({
                            action: "delete",
                            ids,
                        });
                    }
                }

                toast.success(
                    actionData.action === "delete"
                        ? t("shipments.messages.orderDeleted")
                        : t("shipments.messages.orderRaised")
                );

                clearSelection();
                setBulkDrawerOpen(false);
                requestReload();
            } catch (error: any) {
                toast.error(
                    error?.response?.data?.message ||
                    t("shipments.messages.bulkActionError", {
                        defaultValue: "Bulk action failed",
                    })
                );
            }
        },
        [appliedKind, clearSelection, requestReload, selectedIds, t]
    );

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 1,
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
                        flexWrap: { xs: "wrap", md: "nowrap" },
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "rgba(68, 114, 184, 0.08)",
                            color: "primary.main",
                            flexShrink: 0,
                        }}
                    >
                        <FiLayers size={22} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={800} mb={0.5}>
                            {t("shipments.manage.title", "Manage my shipments")}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {t(
                                "shipments.manage.subtitle",
                                "Manage your orders, select multiple items, and apply bulk actions."
                            )}
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            minWidth: { xs: "100%", md: "auto" },
                        }}
                    >
                        {t("shipments.total", { count: totalCount })}
                    </Typography>
                </Box>
            </Paper>

            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                {t("shipments.autoDeleteNotice")}
            </Alert>

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Button
                        variant="contained"
                        startIcon={<FiSliders />}
                        sx={{ textTransform: "none" }}
                        onClick={() => setFilterDrawerOpen(true)}
                    >
                        {t("shipments.filter.button")}
                    </Button>
                </Stack>

                <MyShipmentsManageToolbar
                    kind={appliedKind}
                    selectedCount={selectedCount}
                    allPageSelected={allPageSelected}
                    hasAnyPageSelected={hasAnyPageSelected}
                    onKindChange={setAppliedKind}
                    onSelectAllPage={selectAllOnPage}
                    onDeselectAllPage={deselectAllOnPage}
                    onClearSelection={clearSelection}
                    onOpenBulkActions={() => setBulkDrawerOpen(true)}
                />
            </Stack>

            <div key={listKey}>
                <MyShipmentsManageList
                    kind={appliedKind}
                    filters={appliedFilters}
                    selectedIds={selectedSet}
                    onToggleSelect={toggleOne}
                    onRequestReload={requestReload}
                    onTotalChange={setTotalCount}
                    onPageIdsChange={setPageIds}
                />
            </div>

            <ShipmentsFilterDrawerForm
                open={filterDrawerOpen}
                initialKind={appliedKind}
                initialFilters={appliedFilters}
                onClose={() => setFilterDrawerOpen(false)}
                onApply={(kind, filters) => {
                    setFilterDrawerOpen(false);
                    setAppliedKind(kind);
                    setAppliedFilters(filters);
                    setSelectedIds([]);
                    setReloadKey((k) => k + 1);
                }}
            />

            <MyShipmentsBulkActionsDrawer
                open={bulkDrawerOpen}
                kind={appliedKind}
                selectedCount={selectedCount}
                onClose={() => setBulkDrawerOpen(false)}
                onSubmit={handleBulkSubmit}
            />
        </>
    );
}