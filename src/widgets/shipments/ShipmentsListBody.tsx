import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Pagination, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { useShipments } from "@/entities/shipment/model/useShipments";
import type { ShipmentsKind, ShipmentRowData } from "@/entities/shipment/model/type";
import { adaptCargo, adaptTransport } from "@/entities/shipment/lib/adapter";
import ShipmentRow from "@/widgets/shipments/ShipmentRow";

import ConfirmDialog from "@/widgets/common/ConfirmDialog";
import FullEditDialog from "@/widgets/shipments/full-edit-dialog/ui/FullEditDialog.tsx";
import CopyShipmentDialog from "@/widgets/shipments/CopyShipmentDialog";

import {
    cargoUp,
    cargoPatch,
    cargoDelete,
    transportUp,
    transportPatch,
    transportDelete,
    shipmentCopy,
} from "@/shared/api/shipmentsActions";

import type { PublicFilters } from "@/widgets/shipments/ShipmentsFilterDrawer";

function parsePriceAmount(price?: string | null): number | null {
    if (!price) return null;
    const num = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const val = Number(num);
    return Number.isFinite(val) ? val : null;
}

type Props = {
    scope: "public" | "my";
    kind: ShipmentsKind;
    filters: Partial<PublicFilters>;
    onRequestReload?: () => void;
    onTotalChange?: (count: number) => void;
    reloadKey?: number;
};

export const ShipmentsListBody = React.memo(function ShipmentsListBody({
                                                                           scope,
                                                                           kind,
                                                                           filters,
                                                                           onRequestReload,
                                                                           onTotalChange,
                                                                           reloadKey,
                                                                       }: Props) {
    const { t } = useTranslation();

    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        setPage(1);
    }, [kind, scope, filters]);

    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    const { items, pages, total, loading } = useShipments(kind, scope, page, limit, filters, reloadKey);

    const adaptedItems = useMemo(() => {
        return items.map((item) =>
            kind === "cargo" ? adaptCargo(item) : adaptTransport(item)
        );
    }, [items, kind]);

    useEffect(() => {
        onTotalChange?.(total || 0);
    }, [onTotalChange, total]);

    useEffect(() => {
        if (scope === "public" && items?.length) {
            const favs = items
                .filter((i) => (i as any).isFavorite || (i as any).is_favorite)
                .map((i) => i.id);
            setFavoriteIds(new Set(favs));
        } else {
            setFavoriteIds(new Set());
        }
    }, [scope, kind, items]);

    const reload = useCallback(() => onRequestReload?.(), [onRequestReload]);

    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<ShipmentRowData | null>(null);

    const [copyOpen, setCopyOpen] = useState(false);
    const [copyId, setCopyId] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const openCopy = useCallback((id: string) => {
        setCopyId(id);
        setCopyOpen(true);
    }, []);
    const closeCopy = useCallback(() => setCopyOpen(false), []);

    const openDelete = useCallback((id: string) => {
        setDeleteId(id);
        setDeleteOpen(true);
    }, []);
    const closeDelete = useCallback(() => {
        setDeleteOpen(false);
        setDeleteId(null);
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

    const handleFavoriteChange = useCallback((id: string, isFav: boolean) => {
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (isFav) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const editInitial = useMemo(() => {
        if (!editItem) return undefined;
        const adaptedEditItem = adaptedItems.find((x) => x.id === editItem.id);
        if (!adaptedEditItem) return undefined;

        const rawDateFrom =
            (adaptedEditItem as any)?.date_from ??
            (adaptedEditItem as any)?.dateFrom ??
            null;

        const normalizedDateFrom =
            Array.isArray(rawDateFrom) && rawDateFrom.length
                ? rawDateFrom
                : adaptedEditItem?.loadWindow?.from || adaptedEditItem?.loadWindow?.to
                    ? [adaptedEditItem?.loadWindow?.from, adaptedEditItem?.loadWindow?.to].filter(
                        (v): v is string => typeof v === "string" && v.length > 0
                    )
                    : null;

        return {
            id: adaptedEditItem.id,
            dateFrom: normalizedDateFrom,
            dateTo:
                (adaptedEditItem as any)?.date_to ??
                adaptedEditItem?.dates?.to ??
                null,

            vehicleType:
                (adaptedEditItem as any)?.vehicle_type ??
                adaptedEditItem?.vehicleType ??
                "ANY",

            loadType:
                (adaptedEditItem as any)?.load_type ??
                (adaptedEditItem as any)?.loadType ??
                ["ANY"],

            cargoType:
                (adaptedEditItem as any)?.cargo_type ??
                (adaptedEditItem as any)?.cargoType ??
                "GENERAL",

            allowPartialLoad:
                (adaptedEditItem as any)?.allow_partial_load ??
                (adaptedEditItem as any)?.allowPartialLoad ??
                false,

            palletsCount:
                (adaptedEditItem as any)?.pallets_count ??
                (adaptedEditItem as any)?.palletsCount ??
                null,

            carsCount:
                (adaptedEditItem as any)?.cars_count ??
                (adaptedEditItem as any)?.carsCount ??
                null,

            bargain:
                (adaptedEditItem as any)?.bargain ??
                (kind === "transport" ? "ALLOWED" : null),

            weightT:
                (adaptedEditItem as any)?.weight_t ??
                adaptedEditItem?.weightT ??
                null,

            volumeM3:
                (adaptedEditItem as any)?.volume_m3 ??
                adaptedEditItem?.volumeM3 ??
                null,

            hasDimensions:
                (adaptedEditItem as any)?.has_dimensions ??
                (adaptedEditItem as any)?.hasDimensions ??
                false,

            lengthM:
                (adaptedEditItem as any)?.length_m ??
                (adaptedEditItem as any)?.length ??
                null,

            widthM:
                (adaptedEditItem as any)?.width_m ??
                (adaptedEditItem as any)?.width ??
                null,

            heightM:
                (adaptedEditItem as any)?.height_m ??
                (adaptedEditItem as any)?.height ??
                null,

            priceCurrency:
                (adaptedEditItem as any)?.price_currency ??
                "USD",

            priceAmount:
                (adaptedEditItem as any)?.price_amount ??
                parsePriceAmount(adaptedEditItem?.price ?? "") ??
                null,

            note: adaptedEditItem?.note ?? null,
            points: adaptedEditItem?.points ?? [],
        };
    }, [editItem, adaptedItems, kind]);

    const handleUp = useCallback(
        async (id: string) => {
            try {
                if (kind === "cargo") await cargoUp(id);
                else if (kind === "transport") await transportUp(id);
                else {
                    toast.error(t("shipments.messages.invalidOrderType"));
                    return;
                }

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
            else if (kind === "transport") await transportDelete(deleteId);
            else {
                toast.error(t("shipments.messages.invalidOrderType"));
                closeDelete();
                return;
            }

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
                if (kind === "cargo" || kind === "transport") {
                    await shipmentCopy(kind, copyId, payload);
                } else {
                    toast.error(t("shipments.messages.invalidOrderType"));
                    return;
                }

                toast.success(t("shipments.messages.orderCopied"));
                setCopyId(null);
                reload();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || t("shipments.messages.orderCopyError"));
            }
        },
        [copyId, kind, reload, t]
    );

    const copyInitial = useMemo(() => {
        const item = adaptedItems.find((x) => x.id === copyId);
        return item ? { dateFrom: item.dates?.from ?? "", dateTo: item.dates?.to ?? "" } : { dateFrom: "", dateTo: "" };
    }, [copyId, adaptedItems]);

    const handleEditSubmit = useCallback(
        async (payload: any) => {
            if (!editItem) return;

            const prune = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

            try {
                if (kind === "cargo") await cargoPatch(editItem.id, prune(payload));
                else if (kind === "transport") await transportPatch(editItem.id, prune(payload));
                else {
                    toast.error(t("shipments.messages.invalidOrderType"));
                    return;
                }

                toast.success(t("shipments.messages.orderUpdated"));
                setEditItem(null);
                reload();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || t("shipments.messages.orderUpdateError"));
            }
        },
        [editItem, kind, reload, t]
    );

    const pagesSafe = Math.max(1, pages || 1);

    return (
        <>
            <Box sx={{ width: "100%", maxWidth: { xs: "100vw", md: "100%" }, overflow: "hidden", boxSizing: "border-box" }}>
                <Grid
                    container
                    spacing={{ xs: 0, md: 1.5 }}
                    sx={{
                        width: "100%",
                        maxWidth: { xs: "100vw", md: "100%" },
                        margin: { xs: "0 !important", md: 0 },
                        marginLeft: { xs: "0 !important", md: 0 },
                        marginRight: { xs: "0 !important", md: 0 },
                    }}
                >
                    {items.map((item) => (
                        <Grid
                            key={`${item.id}-${kind}`}
                            size={{ xs: 12 }}
                            sx={{ padding: { xs: "0 0 12px 0", md: 0 }, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
                        >
                            <ShipmentRow
                                scope={scope}
                                data={item}
                                kind={kind}
                                favoriteIds={scope === "public" ? favoriteIds : undefined}
                                onFavoriteChange={
                                    scope === "public"
                                        ? (id: string, isFav: boolean) => {
                                            handleFavoriteChange(id, isFav);
                                        }
                                        : undefined
                                }
                                onMoreOpen={(id) => console.log("more", id)}
                                onUp={scope === "my" ? handleUp : undefined}
                                onEdit={scope === "my" ? openEdit : undefined}
                                onDelete={scope === "my" ? openDelete : undefined}
                                onCopy={scope === "my" ? openCopy : undefined}
                            />
                        </Grid>
                    ))}

                    {loading && (
                        <Grid size={{ xs: 12 }} sx={{ padding: { xs: "0 0 12px 0", md: "0 0 12px 0" } }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("shipments.actions.loading")}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button variant="text" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        {t("shipments.actions.back")}
                    </Button>

                    <Pagination count={pagesSafe} page={page} onChange={(_, v) => setPage(v)} siblingCount={1} />

                    <Button variant="text" onClick={() => setPage((p) => Math.min(pagesSafe, p + 1))} disabled={page >= pagesSafe}>
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

            <CopyShipmentDialog open={copyOpen} onClose={closeCopy} onSubmit={handleCopySubmit} initial={copyInitial} />

            <ConfirmDialog
                open={deleteOpen}
                title={t("shipments.deleteDialog.title")}
                message={t("shipments.deleteDialog.message")}
                confirmText={t("shipments.deleteDialog.confirm")}
                cancelText={t("shipments.deleteDialog.cancel")}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </>
    );
});
