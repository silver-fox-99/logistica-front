import React, { useCallback, useEffect, useMemo, useState } from "react";
import {Box, Button, FormControl, InputLabel, MenuItem, Pagination, Select, Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { useShipments } from "@/entities/shipment/model/useShipments";
import type { ShipmentsKind, ShipmentRowData } from "@/entities/shipment/model/type";
import type { PublicFilters } from "@/widgets/shipments/ShipmentsFilterDrawer";

import { MyShipmentManageCard } from "@/widgets/my-shipments-manage/ui/MyShipmentManageCard";
import ConfirmDialog from "@/widgets/common/ConfirmDialog";
import FullEditDialog from "@/widgets/shipments/full-edit-dialog/ui/FullEditDialog.tsx";
import CopyShipmentDialog from "@/widgets/shipments/CopyShipmentDialog";

import {
    cargoDelete,
    cargoPatch,
    cargoUp,
    shipmentCopy,
    transportDelete,
    transportPatch,
    transportUp,
} from "@/shared/api/shipmentsActions";
import {ListingAutoBumpDialog} from "@/entities/listing-auto-bump/ui/ListingAutoBumpDialog.tsx";
import {mapShipmentKindToAutoBumpTarget} from "@/shared/lib/mapShipmentKindToAutoBumpTarget.ts";

function parsePriceAmount(price?: string | null): number | null {
    if (!price) return null;
    const num = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const val = Number(num);
    return Number.isFinite(val) ? val : null;
}

type Props = {
    kind: ShipmentsKind;
    filters: Partial<PublicFilters>;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onRequestReload?: (page?: number) => void;
    onTotalChange?: (count: number) => void;
    onPageIdsChange?: (ids: string[]) => void;
    reloadKey?: number;
};

export const MyShipmentsManageList = React.memo(function MyShipmentsManageList({
                                                                                   kind,
                                                                                   filters,
                                                                                   selectedIds,
                                                                                   onToggleSelect,
                                                                                   onRequestReload,
                                                                                   onTotalChange,
                                                                                   onPageIdsChange,
                                                                                   reloadKey,
                                                                               }: Props) {
    const { t } = useTranslation();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { items, pages, total, loading } = useShipments(kind, "my", page, limit, filters, reloadKey);

    useEffect(() => {
        setPage(1);
    }, [filters, kind, limit]);

    const reload = useCallback(() => onRequestReload?.(), [onRequestReload]);

    useEffect(() => {
        setPage(1);
    }, [filters, kind]);

    useEffect(() => {
        onTotalChange?.(total || 0);
    }, [onTotalChange, total]);

    const pageIds = useMemo(() => items.map((item) => item.id), [items]);

    useEffect(() => {
        onPageIdsChange?.(pageIds);
    }, [onPageIdsChange, pageIds]);

    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<ShipmentRowData | null>(null);

    const [copyOpen, setCopyOpen] = useState(false);
    const [copyId, setCopyId] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [autoBumpOpen, setAutoBumpOpen] = useState(false);
    const [autoBumpTargetId, setAutoBumpTargetId] = useState<string | null>(null);

    const openCopy = useCallback((id: string) => {
        setCopyId(id);
        setCopyOpen(true);
    }, []);

    const closeCopy = useCallback(() => {
        setCopyOpen(false);
        setCopyId(null);
    }, []);

    const openDelete = useCallback((id: string) => {
        setDeleteId(id);
        setDeleteOpen(true);
    }, []);

    const closeDelete = useCallback(() => {
        setDeleteOpen(false);
        setDeleteId(null);
    }, []);

    const openAutoBump = useCallback((id: string) => {
        setAutoBumpTargetId(id);
        setAutoBumpOpen(true);
    }, []);

    const closeAutoBump = useCallback(() => {
        setAutoBumpOpen(false);
        setAutoBumpTargetId(null);
    }, []);

    const openEdit = useCallback(
        (id: string) => {
            const found = items.find((x) => x.id === id) || null;
            setEditItem(found);
            setEditOpen(true);
        },
        [items]
    );

    const closeEdit = useCallback(() => {
        setEditOpen(false);
        setEditItem(null);
    }, []);

    const handleUp = useCallback(
        async (id: string) => {
            try {
                if (kind === "cargo") await cargoUp(id);
                else await transportUp(id);

                toast.success(t("shipments.messages.orderRaised"));
                reload();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || t("shipments.messages.orderRaiseError"));
            }
        },
        [kind, reload, t]
    );

    const confirmDelete = useCallback(async () => {
        if (!deleteId) return;

        try {
            if (kind === "cargo") await cargoDelete(deleteId);
            else await transportDelete(deleteId);

            toast.success(t("shipments.messages.orderDeleted"));
            closeDelete();
            reload();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("shipments.messages.orderDeleteError"));
        }
    }, [closeDelete, deleteId, kind, reload, t]);

    const handleCopySubmit = useCallback(
        async (payload: { date_from: string; date_to: string }) => {
            if (!copyId) return;

            try {
                await shipmentCopy(kind, copyId, payload);
                toast.success(t("shipments.messages.orderCopied"));
                closeCopy();
                reload();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || t("shipments.messages.orderCopyError"));
            }
        },
        [closeCopy, copyId, kind, reload, t]
    );

    const copyInitial = useMemo(() => {
        const item = items.find((x) => x.id === copyId);

        return item
            ? {
                dateFrom: item.dates?.from ?? "",
                dateTo: item.dates?.to ?? "",
            }
            : {
                dateFrom: "",
                dateTo: "",
            };
    }, [copyId, items]);

    const editInitial = useMemo(() => {
        if (!editItem) return undefined;

        const rawDateFrom = (editItem as any)?.date_from ?? (editItem as any)?.dateFrom ?? null;

        const normalizedDateFrom =
            Array.isArray(rawDateFrom) && rawDateFrom.length
                ? rawDateFrom
                : editItem?.loadWindow?.from || editItem?.loadWindow?.to
                    ? [editItem?.loadWindow?.from, editItem?.loadWindow?.to].filter(
                        (value): value is string => typeof value === "string" && value.length > 0
                    )
                    : null;

        return {
            id: editItem.id,
            dateFrom: normalizedDateFrom,
            dateTo: (editItem as any)?.date_to ?? editItem?.dates?.to ?? null,
            vehicleType: (editItem as any)?.vehicle_type ?? editItem?.vehicleType ?? "ANY",
            loadType: (editItem as any)?.load_type ?? (editItem as any)?.loadType ?? ["ANY"],
            cargoType: (editItem as any)?.cargo_type ?? (editItem as any)?.cargoType ?? "GENERAL",
            allowPartialLoad:
                (editItem as any)?.allow_partial_load ??
                (editItem as any)?.allowPartialLoad ??
                false,
            palletsCount:
                (editItem as any)?.pallets_count ?? (editItem as any)?.palletsCount ?? null,
            carsCount: (editItem as any)?.cars_count ?? (editItem as any)?.carsCount ?? null,
            bargain: (editItem as any)?.bargain ?? (kind === "transport" ? "ALLOWED" : null),
            weightT: (editItem as any)?.weight_t ?? editItem?.weightT ?? null,
            volumeM3: (editItem as any)?.volume_m3 ?? editItem?.volumeM3 ?? null,
            hasDimensions:
                (editItem as any)?.has_dimensions ?? (editItem as any)?.hasDimensions ?? false,
            lengthM: (editItem as any)?.length_m ?? (editItem as any)?.length ?? null,
            widthM: (editItem as any)?.width_m ?? (editItem as any)?.width ?? null,
            heightM: (editItem as any)?.height_m ?? (editItem as any)?.height ?? null,
            priceCurrency: (editItem as any)?.price_currency ?? "USD",
            priceAmount:
                (editItem as any)?.price_amount ?? parsePriceAmount(editItem?.price ?? "") ?? null,
            note: editItem?.note ?? null,
            points: editItem?.points ?? [],
        };
    }, [editItem, kind]);

    const handleEditSubmit = useCallback(
        async (payload: any) => {
            if (!editItem) return;

            const prune = (obj: any) =>
                Object.fromEntries(
                    Object.entries(obj).filter(([, value]) => value !== undefined)
                );

            try {
                if (kind === "cargo") {
                    await cargoPatch(editItem.id, prune(payload));
                } else {
                    await transportPatch(editItem.id, prune(payload));
                }

                toast.success(t("shipments.messages.orderUpdated"));
                closeEdit();
                reload();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || t("shipments.messages.orderUpdateError"));
            }
        },
        [closeEdit, editItem, kind, reload, t]
    );

    const pagesSafe = Math.max(1, pages || 1);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={1.5}>
                    {items.map((item) => (
                        <Grid key={`${item.id}-${kind}`} size={{ xs: 12 }}>
                            <MyShipmentManageCard
                                data={item}
                                kind={kind}
                                selected={selectedIds.has(item.id)}
                                onSelect={() => onToggleSelect(item.id)}
                                onUp={handleUp}
                                onEdit={openEdit}
                                onDelete={openDelete}
                                onCopy={openCopy}
                                onAutoBump={openAutoBump}
                            />
                        </Grid>
                    ))}

                    {loading && (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("shipments.actions.loading")}
                            </Typography>
                        </Grid>
                    )}

                    {!loading && items.length === 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.noResults")}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mt: 2, gap: 1.5 }}
            >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="shipments-limit-label">
                        {t("shipments.actions.perPage", { defaultValue: "Per page" })}
                    </InputLabel>
                    <Select
                        labelId="shipments-limit-label"
                        value={limit}
                        label={t("shipments.actions.perPage", { defaultValue: "Per page" })}
                        onChange={(event) => setLimit(Number(event.target.value))}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button
                        variant="text"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        {t("shipments.actions.back")}
                    </Button>

                    <Pagination
                        count={pagesSafe}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        siblingCount={1}
                    />

                    <Button
                        variant="text"
                        onClick={() => setPage((p) => Math.min(pagesSafe, p + 1))}
                        disabled={page >= pagesSafe}
                    >
                        {t("shipments.actions.next")}
                    </Button>
                </Stack>
            </Stack>

            <FullEditDialog
                open={editOpen}
                kind={kind}
                onClose={closeEdit}
                onSubmit={handleEditSubmit}
                initial={editInitial}
            />

            <CopyShipmentDialog
                open={copyOpen}
                onClose={closeCopy}
                onSubmit={handleCopySubmit}
                initial={copyInitial}
            />

            <ConfirmDialog
                open={deleteOpen}
                title={t("shipments.deleteDialog.title")}
                message={t("shipments.deleteDialog.message")}
                confirmText={t("shipments.deleteDialog.confirm")}
                cancelText={t("shipments.deleteDialog.cancel")}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />

            <ListingAutoBumpDialog
                open={autoBumpOpen}
                targetType={mapShipmentKindToAutoBumpTarget(kind)}
                targetId={autoBumpTargetId}
                onClose={closeAutoBump}
                onSaved={reload}
            />
        </>
    );
});