import { useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, Button, MenuItem, Select, Pagination
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiSliders } from "react-icons/fi";

import { useShipments } from "@/entities/shipment/model/useShipments";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import ShipmentRow, { type ShipmentRowData } from "@/widgets/shipments/ShipmentRow";
import ShipmentsFilterDrawer from "@/widgets/shipments/ShipmentsFilterDrawer";

import QuickEditDialog from "@/widgets/shipments/QuickEditDialog";
import {
    cargoUp, cargoPatch, cargoDelete,
    transportUp, transportPatch, transportDelete
} from "@/shared/api/shipmentsActions";

/** Вспомогалка: парсим число из строки цены "1 250 EUR" → 1250 */
function parsePriceAmount(price?: string | null): number | null {
    if (!price) return null;
    // вытащим число с точкой/запятой
    const num = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const val = Number(num);
    return Number.isFinite(val) ? val : null;
}

type Props = { scope: "public" | "my" };

/** Внутреннее тело списка. Перемонтируем по ключу, чтобы форсить рефетч */
function ListBody({
                      scope,
                      kind,
                      onRequestReload
                  }: {
    scope: "public" | "my";
    kind: ShipmentsKind;
    onRequestReload?: () => void;
}) {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { items, pages, loading } = useShipments(kind, scope, page, limit);
    const list = useMemo(() => items, [items]);

    // Редактирование
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<ShipmentRowData | null>(null);

    const openEdit = (id: string) => {
        const found = list.find((x) => x.id === id) || null;
        setEditItem(found);
        setEditOpen(true);
    };
    const closeEdit = () => setEditOpen(false);

    const reload = () => {
        // самый деликатный способ — отдать наверх, где пересоздадим компонент по ключу
        onRequestReload?.();
    };

    const handleUp = async (id: string) => {
        if (kind === "cargo") await cargoUp(id);
        else await transportUp(id);
        reload();
    };

    const handleDelete = async (id: string) => {
        if (kind === "cargo") await cargoDelete(id);
        else await transportDelete(id);
        reload();
    };

    const handleEditSubmit = async (payload: {
        date_from: string | null;
        date_to: string | null;
        price_amount: number | null;
        contact_extra_phone: string | null;
        note: string | null;
    }) => {
        if (!editItem) return;
        if (kind === "cargo") {
            await cargoPatch(editItem.id, {
                date_from: payload.date_from ?? undefined,
                date_to: payload.date_to ?? undefined,
                price_amount: payload.price_amount ?? undefined,
                contact_extra_phone: payload.contact_extra_phone ?? undefined,
                note: payload.note ?? undefined,
            });
        } else {
            await transportPatch(editItem.id, {
                date_from: payload.date_from ?? undefined,
                date_to: payload.date_to ?? undefined,
                price_amount: payload.price_amount ?? undefined,
                contact_extra_phone: payload.contact_extra_phone ?? undefined,
                note: payload.note ?? undefined,
            });
        }
        setEditItem(null);
        reload();
    };

    // Вычисляем initial для модалки из выбранного элемента
    const editInitial = useMemo(() => {
        if (!editItem) return undefined;

        // сначала пробуем structured `edit` если адаптер его наполняет,
        // иначе — собираем из доступных полей
        const fromEdit = editItem.edit;
        const fallbackPrice = parsePriceAmount(editItem.price);
        return {
            dateFrom: fromEdit?.dateFrom ?? editItem.dates?.from ?? null,
            dateTo: fromEdit?.dateTo ?? editItem.dates?.to ?? null,
            priceAmount: fromEdit?.priceAmount ?? fallbackPrice,
            contactExtraPhone: fromEdit?.contactExtraPhone ?? editItem.contact?.phone2 ?? null,
            note: fromEdit?.note ?? null,
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
                            onBookmark={(id) => console.log("bookmark", id)}
                            onMoreOpen={(id) => console.log("more", id)}
                            onUp={scope === "my" ? handleUp : undefined}
                            onEdit={scope === "my" ? openEdit : undefined}
                            onDelete={scope === "my" ? handleDelete : undefined}
                            onCopy={scope === "my" ? (id) => console.log("copy", id) : undefined}
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

            <QuickEditDialog
                open={editOpen}
                kind={kind}
                initial={editInitial}
                onClose={closeEdit}
                onSubmit={handleEditSubmit}
            />
        </>
    );
}

export default function ShipmentsListPage({ scope }: Props) {
    const [period, setPeriod] = useState("all");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [draftKind, setDraftKind] = useState<ShipmentsKind>("cargo");
    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>("cargo");

    /** Ключ для пересоздания ListBody → гарантированный рефетч */
    const [reloadKey, setReloadKey] = useState(0);
    const requestReload = () => setReloadKey((k) => k + 1);

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "divider", mb: 2 }}>
                <Typography variant="h6">
                    {scope === "my" ? "My shipments" : "Search shipments"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {scope === "my"
                        ? "Your created orders with transport and cargo."
                        : "Browse available cargo and transport offers."}
                </Typography>
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

            {/* Сам список вынес внутрь, чтобы можно было пересоздавать по ключу */}
            <div key={`${appliedKind}-${reloadKey}`}>
                <ListBody scope={scope} kind={appliedKind} onRequestReload={requestReload} />
            </div>

            <ShipmentsFilterDrawer
                open={drawerOpen}
                value={draftKind}
                onChange={setDraftKind}
                onClose={() => setDrawerOpen(false)}
                onReset={() => setDraftKind("cargo")}
                onApply={() => {
                    setDrawerOpen(false);
                    setAppliedKind(draftKind);
                    setReloadKey((k) => k + 1); // при смене типа тоже перезагружаем
                }}
            />
        </Box>
    );
}
