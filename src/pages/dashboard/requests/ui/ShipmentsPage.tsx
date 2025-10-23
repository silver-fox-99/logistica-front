import { useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, Button, MenuItem, Select, Pagination
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiSliders } from "react-icons/fi";
import { toast } from "react-toastify";

import { useShipments } from "@/entities/shipment/model/useShipments";
import type { ShipmentsKind, ShipmentRowData } from "@/entities/shipment/model/type";
import ShipmentRow from "@/widgets/shipments/ShipmentRow";
import ShipmentsFilterDrawer from "@/widgets/shipments/ShipmentsFilterDrawer";
import ConfirmDialog from "@/widgets/common/ConfirmDialog";

import {
    cargoUp, cargoPatch, cargoDelete,
    transportUp, transportPatch, transportDelete, shipmentCopy
} from "@/shared/api/shipmentsActions";



import "./MyShipmentsPage.scss";
import type {PublicFilters} from "@/widgets/public/PublicFiltersDrawer.tsx";
import FullEditDialog from "@/widgets/shipments/FullEditDialog.tsx";
import CopyShipmentDialog from "@/widgets/shipments/CopyShipmentDialog.tsx";

/** Helper: parse "1 250 EUR" -> 1250 */
function parsePriceAmount(price?: string | null): number | null {
    if (!price) return null;
    const num = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const val = Number(num);
    return Number.isFinite(val) ? val : null;
}

type Props = { scope: "public" | "my" };

/** Inner list body. Remounted by a key to force refetch */
function ListBody({
                      scope,
                      kind,
                      filters,
                      onRequestReload
                  }: {
    scope: "public" | "my";
    kind: ShipmentsKind;
    filters: Partial<PublicFilters>;
    onRequestReload?: () => void;
}) {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { items, pages, loading } = useShipments(kind, scope, page, limit, filters);
    const list = useMemo(() => items, [items]);

    // Edit
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<ShipmentRowData | null>(null);

    const [copyOpen, setCopyOpen] = useState(false);
    const [copyId, setCopyId] = useState<string | null>(null);

    // Delete confirmation
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const openCopy = (id: string) => {
        setCopyId(id);
        setCopyOpen(true);
    };
    const closeCopy = () => setCopyOpen(false);

    const openDelete = (id: string) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };
    const closeDelete = () => {
        setDeleteOpen(false);
        setDeleteId(null);
    };

    const handleCopySubmit = async (payload: { date_from: string; date_to: string }) => {
        if (!copyId) return;
        try {
            await shipmentCopy(kind, copyId, payload);
            toast.success('Заказ успешно скопирован!');
            setCopyId(null);
            onRequestReload?.();
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при копировании заказа';
            toast.error(message);
        }
    };

    const copyInitial = useMemo(() => {
        const item = list.find(x => x.id === copyId);
        return item
            ? { dateFrom: item.dates?.from ?? "", dateTo: item.dates?.to ?? "" }
            : { dateFrom: "", dateTo: "" };
    }, [copyId, list]);

    const openEdit = (id: string) => {
        const found = list.find((x) => x.id === id) || null;
        setEditItem(found);
        setEditOpen(true);
    };
    const closeEdit = () => setEditOpen(false);

    const reload = () => onRequestReload?.();

    const handleUp = async (id: string) => {
        try {
            if (kind === "cargo") await cargoUp(id);
            else await transportUp(id);
            toast.success('Заказ поднят!');
            reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при поднятии заказа';
            toast.error(message);
        }
    };

    const handleDelete = (id: string) => {
        openDelete(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            if (kind === "cargo") await cargoDelete(deleteId);
            else await transportDelete(deleteId);
            toast.success('Заказ успешно удален!');
            closeDelete();
            reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при удалении заказа';
            toast.error(message);
        }
    };

    const handleEditSubmit = async (payload: any) => {
          if (!editItem) return;

              const prune = (obj: any) =>
                Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

              try {
                  if (kind === "cargo") {
                    await cargoPatch(editItem.id, prune(payload));
                  } else {
                    await transportPatch(editItem.id, prune(payload));
                  }
                  toast.success('Заказ успешно обновлен!');
                  setEditItem(null);
                  reload();
              } catch (error: any) {
                  const message = error?.response?.data?.message || 'Ошибка при обновлении заказа';
                  toast.error(message);
              }
        };

    // Initial values for edit dialog
    const editInitial = useMemo(() => {
        if (!editItem) return undefined;

        const fallbackPrice = parsePriceAmount(editItem.price);

        return {
            dateFrom: editItem.dates?.from ?? null,
            dateTo: editItem.dates?.to ?? null,
            priceAmount: fallbackPrice,
            contactExtraPhone: editItem.contactExtraPhone ?? editItem.contact?.phone2 ?? null,
            note: editItem.note ?? null,
        };
    }, [editItem]);

    return (
        <>
            <Grid container spacing={1.5}>
                {list.map((item) => (
                    <Grid key={item.id} size={{ xs: 12 }}>
                        <ShipmentRow
                            scope={scope}
                            data={item}
                            kind={kind}
                            onBookmark={(id) => console.log("bookmark", id)}
                            onMoreOpen={(id) => console.log("more", id)}
                            onUp={scope === "my" ? handleUp : undefined}
                            onEdit={scope === "my" ? openEdit : undefined}
                            onDelete={scope === "my" ? handleDelete : undefined}
                            onCopy={scope === "my" ? openCopy : undefined}
                        />
                    </Grid>
                ))}
                {loading && (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">Loading...</Typography>
                    </Grid>
                )}
            </Grid>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                <Button variant="text" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Back</Button>
                <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} siblingCount={1} />
                <Button variant="text" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next</Button>
            </Stack>

            <FullEditDialog
                open={editOpen}
                kind={kind}
                onClose={closeEdit}
                onSubmit={handleEditSubmit}
             initial={{
                 id: editItem?.id ?? undefined,
               dateFrom: editInitial?.dateFrom ?? null,
               dateTo: editInitial?.dateTo ?? null,
               vehicleType: editItem?.vehicleType ?? "ANY",
               // cargo-only:
               loadType: (editItem as any)?.loadType ?? "ANY",
               cargoType: (editItem as any)?.cargoType ?? "GENERAL",
               allowPartialLoad: (editItem as any)?.allowPartialLoad ?? false,
               palletsCount: (editItem as any)?.palletsCount ?? null,
               // transport-only:
               carsCount: (editItem as any)?.carsCount ?? (kind === "transport" ? 1 : null),
               bargain: (editItem as any)?.bargain ?? (kind === "transport" ? "ALLOWED" : null),
               weightT: editItem?.weightT ?? (editItem as any)?.weight_t ?? null,
               volumeM3: editItem?.volumeM3 ?? (editItem as any)?.volume_m3 ?? null,
               hasDimensions: (editItem as any)?.hasDimensions ?? (editItem as any)?.has_dimensions ?? false,
               lengthM: (editItem as any)?.length ?? (editItem as any)?.length_m ?? null,
               widthM: (editItem as any)?.width ?? (editItem as any)?.width_m ?? null,
               heightM: (editItem as any)?.height ?? (editItem as any)?.height_m ?? null,
               priceCurrency: (editItem as any)?.price_currency ?? "USD",
               priceAmount: parsePriceAmount(editItem?.price ?? "") ?? (editItem as any)?.price_amount ?? null,
               note: editItem?.note ?? null,
               points: editItem?.points ?? [],
             }}
            />

            <CopyShipmentDialog
                open={copyOpen}
                onClose={closeCopy}
                onSubmit={handleCopySubmit}
                initial={copyInitial}
            />

            <ConfirmDialog
                open={deleteOpen}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </>
    );
}

export default function ShipmentsListPage({ scope }: Props) {
    const [period, setPeriod] = useState("all");
    const [drawerOpen, setDrawerOpen] = useState(false);

    // kind: draft/applied
    const [draftKind, setDraftKind] = useState<ShipmentsKind>("cargo");
    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>("cargo");

    // filters: draft/applied
    const [draftFilters, setDraftFilters] = useState<PublicFilters>({});
    const [appliedFilters, setAppliedFilters] = useState<PublicFilters>({});

    /** Key to remount ListBody -> guaranteed refetch */
    const [reloadKey, setReloadKey] = useState(0);
    const requestReload = () => setReloadKey((k) => k + 1);

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "divider", mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box className="shipments-page__icon">
                        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7"/>
                            <circle cx="18" cy="18" r="6" stroke="#4472B8" strokeWidth="2.5" fill="none"/>
                            <path d="M24 24L28 28" stroke="#4472B8" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="shipments-page__title">
                            {scope === "my" ? "My shipments" : "Search orders"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="shipments-page__subtitle">
                            {scope === "my"
                                ? "Your created orders with transport and cargo."
                                : "Find suitable orders from other users."}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<FiSliders />}
                    sx={{ textTransform: "none" }}
                    onClick={() => setDrawerOpen(true)}
                >
                    Filter
                </Button>

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="text.secondary">Period:</Typography>
                    <Select
                        variant="outlined"
                        size="small"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="all">All time</MenuItem>
                        <MenuItem value="7d">Last 7 days</MenuItem>
                        <MenuItem value="30d">Last 30 days</MenuItem>
                        <MenuItem value="ytd">Year to date</MenuItem>
                    </Select>
                </Stack>
            </Stack>

            {/* Remount list body on kind/filters/reloadKey changes */}
            <div key={`${appliedKind}-${JSON.stringify(appliedFilters)}-${reloadKey}`}>
                <ListBody
                    scope={scope}
                    kind={appliedKind}
                    filters={appliedFilters}
                    onRequestReload={requestReload}
                />
            </div>

            <ShipmentsFilterDrawer
                open={drawerOpen}
                value={draftKind}
                onChange={setDraftKind}
                filters={draftFilters}
                onFiltersChange={setDraftFilters}
                onClose={() => setDrawerOpen(false)}
                onReset={() => { setDraftKind("cargo"); setDraftFilters({}); }}
                onApply={() => {
                    setDrawerOpen(false);
                    setAppliedKind(draftKind);
                    setAppliedFilters(draftFilters);
                    setReloadKey((k) => k + 1); // also reload when type changes or filters applied
                }}
            />

        </Box>
    );
}
