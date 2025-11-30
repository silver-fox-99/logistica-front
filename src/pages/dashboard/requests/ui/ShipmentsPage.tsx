import { useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, Button, MenuItem, Select, Pagination
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiSliders } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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

function parsePriceAmount(price?: string | null): number | null {
    if (!price) return null;
    const num = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const val = Number(num);
    return Number.isFinite(val) ? val : null;
}

type Props = { scope: "public" | "my" };

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
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { items, pages, total, loading } = useShipments(kind, scope, page, limit, filters);
    const list = useMemo(() => items, [items]);

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
            if (kind === "cargo") {
                await shipmentCopy(kind, copyId, payload);
            } else if (kind === "transport") {
                await shipmentCopy(kind, copyId, payload);
            } else {
                toast.error(t('shipments.messages.invalidOrderType'));
                return;
            }
            toast.success(t('shipments.messages.orderCopied'));
            setCopyId(null);
            onRequestReload?.();
        } catch (error: any) {
            const message = error?.response?.data?.message || t('shipments.messages.orderCopyError');
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
            if (kind === "cargo") {
                await cargoUp(id);
            } else if (kind === "transport") {
                await transportUp(id);
            } else {
                toast.error(t('shipments.messages.invalidOrderType'));
                return;
            }
            toast.success(t('shipments.messages.orderRaised'));
            reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || t('shipments.messages.orderRaiseError');
            toast.error(message);
        }
    };

    const handleDelete = (id: string) => {
        openDelete(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        
        try {
            if (kind === "cargo") {
                await cargoDelete(deleteId);
            } else if (kind === "transport") {
                await transportDelete(deleteId);
            } else {
                toast.error(t('shipments.messages.invalidOrderType'));
                closeDelete();
                return;
            }
            toast.success(t('shipments.messages.orderDeleted'));
            closeDelete();
            reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || t('shipments.messages.orderDeleteError');
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
            } else if (kind === "transport") {
                await transportPatch(editItem.id, prune(payload));
            } else {
                toast.error(t('shipments.messages.invalidOrderType'));
                return;
            }
            toast.success(t('shipments.messages.orderUpdated'));
            setEditItem(null);
            reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || t('shipments.messages.orderUpdateError');
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
            <Box sx={{ width: "100%", maxWidth: { xs: "100vw", md: "100%" }, overflow: "hidden", boxSizing: "border-box" }}>
                <Grid container spacing={{ xs: 0, md: 1.5 }} sx={{ width: "100%", maxWidth: { xs: "100vw", md: "100%" }, margin: { xs: "0 !important", md: 0 }, marginLeft: { xs: "0 !important", md: 0 }, marginRight: { xs: "0 !important", md: 0 } }}>
                    {list.map((item) => (
                        <Grid key={item.id} size={{ xs: 12 }} sx={{ padding: { xs: "0 0 12px 0", md: 0 }, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
                        <ShipmentRow
                            scope={scope}
                            data={item}
                            kind={kind}
                            onMoreOpen={(id) => console.log("more", id)}
                            onUp={scope === "my" ? handleUp : undefined}
                            onEdit={scope === "my" ? openEdit : undefined}
                            onDelete={scope === "my" ? handleDelete : undefined}
                            onCopy={scope === "my" ? openCopy : undefined}
                        />
                    </Grid>
                ))}
                {loading && (
                    <Grid size={{ xs: 12 }} sx={{ padding: { xs: "0 0 12px 0", md: "0 0 12px 0" } }}>
                        <Typography variant="body2" color="text.secondary">{t('shipments.actions.loading')}</Typography>
                    </Grid>
                )}
            </Grid>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {t('shipments.total', { count: total })}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button variant="text" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>{t('shipments.actions.back')}</Button>
                    <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} siblingCount={1} />
                    <Button variant="text" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>{t('shipments.actions.next')}</Button>
                </Stack>
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
               loadType: (editItem as any)?.loadType ?? ["ANY"],
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
                title={t('shipments.deleteDialog.title')}
                message={t('shipments.deleteDialog.message')}
                confirmText={t('shipments.deleteDialog.confirm')}
                cancelText={t('shipments.deleteDialog.cancel')}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </>
    );
}

export default function ShipmentsListPage({ scope }: Props) {
    const { t } = useTranslation();
    const [period, setPeriod] = useState("all");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const getDefaultFilters = (): PublicFilters => {
        const today = new Date();
        const datePlus30 = new Date();
        datePlus30.setDate(datePlus30.getDate() + 30);
        return {
            pickup_date_from: today.toISOString().split('T')[0],
            pickup_date_to: datePlus30.toISOString().split('T')[0]
        };
    };

    // kind: draft/applied
    const [draftKind, setDraftKind] = useState<ShipmentsKind>("cargo");
    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>("cargo");

    // filters: draft/applied
    const [draftFilters, setDraftFilters] = useState<PublicFilters>(getDefaultFilters());
    const [appliedFilters, setAppliedFilters] = useState<PublicFilters>(getDefaultFilters());

    /** Key to remount ListBody -> guaranteed refetch */
    const [reloadKey, setReloadKey] = useState(0);
    const requestReload = () => setReloadKey((k) => k + 1);

    return (
        <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "divider", mb: 2, width: "100%", boxSizing: "border-box" }}>
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
                            {scope === "my" ? t('shipments.myShipments.title') : t('shipments.myShipments.searchTitle')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="shipments-page__subtitle">
                            {scope === "my"
                                ? t('shipments.myShipments.description')
                                : t('shipments.myShipments.searchDescription')}
                        </Typography>
                    </Box>
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
                    {t('shipments.filter.button')}
                </Button>

                <Stack 
                    direction={{ xs: "column", sm: "row" }} 
                    alignItems={{ xs: "stretch", sm: "center" }} 
                    spacing={1} 
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>{t('shipments.filter.period')}</Typography>
                    <Select
                        variant="outlined"
                        size="small"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        sx={{ minWidth: { xs: "100%", sm: 160 }, width: { xs: "100%", sm: "auto" } }}
                    >
                        <MenuItem value="all">{t('shipments.filter.allTime')}</MenuItem>
                        <MenuItem value="7d">{t('shipments.filter.last7Days')}</MenuItem>
                        <MenuItem value="30d">{t('shipments.filter.last30Days')}</MenuItem>
                        <MenuItem value="ytd">{t('shipments.filter.yearToDate')}</MenuItem>
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
                onReset={() => { setDraftKind("cargo"); setDraftFilters(getDefaultFilters()); }}
                onApply={() => {
                    setDrawerOpen(false);
                    setAppliedKind(draftKind);
                    setAppliedFilters(draftFilters);
                    setReloadKey((k) => k + 1); // also reload when type changes or filters applied
                }}
            />
        </>
    );
}
