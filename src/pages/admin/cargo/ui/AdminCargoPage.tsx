import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { FiMapPin, FiRotateCcw, FiSearch, FiTrash2, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import React from "react";

import { useAdminCargo } from "@/features/admin/cargo-list/model/useAdminCargo";
import {
    adminCargoApi,
    type CargoAdminStatus,
    type CargoItem,
} from "@/shared/api/adminCargoApi.ts";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store.ts";
import { viewCode } from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

const n = (v?: number, d = 0) => (typeof v === "number" ? v : d);

const fmtDT = (d?: string | null) =>
    d
        ? new Date(d).toLocaleString("ru-RU", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false,
        })
        : "—";

const fmtD = (d?: string | string[] | null) => {
    if (Array.isArray(d)) {
        const first = d[0];
        return first
            ? new Date(first).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
            : "—";
    }

    return d
        ? new Date(d).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        : "—";
};

const fmtNum = (v?: string | number | null, suffix = "") => {
    if (v === null || v === undefined || v === "") return "—";
    const num = Number(v);
    if (Number.isNaN(num)) return "—";
    return `${num}${suffix}`;
};

function pickLabel(
    p?: { country?: string | null; region?: string | null; city?: string | null } | null,
) {
    return p?.city ?? p?.region ?? p?.country ?? "—";
}

function route(points: CargoItem["points"]): string {
    if (!points?.length) return "—";

    const pickups = points.filter((x) => x?.type === "PICKUP");
    const dropoffs = points.filter((x) => x?.type === "DROPOFF");

    const fromPoint = pickups[0] ?? points[0];
    const toPoint = dropoffs[dropoffs.length - 1] ?? points[points.length - 1];

    return `${pickLabel(fromPoint)} → ${pickLabel(toPoint)}`;
}

export default function AdminCargoPage() {
    const navigate = useNavigate();

    const {
        items,
        total,
        pages,
        loading,
        error,
        params,
        setPage,
        setLimit,
        setSearch,
        setStatus,
        refetch,
    } = useAdminCargo({ page: 1, limit: 20, status: "all" });

    const totalSafe = n(total, 0);
    const pageSafe = n(params.page, 1);
    const pagesSafe = n(pages, 1);
    const limitSafe = n(params.limit, 20);
    const statusSafe = (params.status ?? "all") as CargoAdminStatus;

    const [toDelete, setToDelete] = React.useState<CargoItem | null>(null);
    const [toRestore, setToRestore] = React.useState<CargoItem | null>(null);
    const [busy, setBusy] = React.useState(false);

    const canViewCargo = useAdminAccessStore((s) => s.hasPermission(viewCode("CARGO" as any)));

    const confirmDelete = async () => {
        if (!toDelete) return;

        setBusy(true);
        try {
            await adminCargoApi.remove(toDelete.id);
            toast.success("Груз удалён");
            setToDelete(null);
            refetch();
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при удалении груза";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    const confirmRestore = async () => {
        if (!toRestore) return;

        setBusy(true);
        try {
            await adminCargoApi.restore(toRestore.id);
            toast.success("Груз восстановлен");
            setToRestore(null);
            refetch();
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при восстановлении груза";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    if (!canViewCargo) return <NoAccess />;

    return (
        <Stack spacing={2}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
            >
                <Stack spacing={0}>
                    <Typography variant="h5" fontWeight={700}>
                        Грузы
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Всего записей: {totalSafe.toLocaleString()}
                    </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                        size="small"
                        placeholder="Поиск по маршруту, заметке, телефону и т.д."
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 280 }}
                    />

                    <Select<CargoAdminStatus>
                        size="small"
                        value={statusSafe}
                        onChange={(e) => setStatus(e.target.value as CargoAdminStatus)}
                        sx={{ minWidth: 190 }}
                    >
                        <MenuItem value="all">Все заявки</MenuItem>
                        <MenuItem value="active">Только активные</MenuItem>
                        <MenuItem value="deleted">Только удалённые</MenuItem>
                    </Select>

                    <Select
                        size="small"
                        value={String(limitSafe)}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        {[10, 20, 50, 100].map((value) => (
                            <MenuItem key={value} value={value}>
                                {value} / страница
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>
            </Stack>

            <Alert severity="info" sx={{ borderRadius: 2 }}>
                Удалённые заявки подсвечены и могут быть восстановлены из этой таблицы.
            </Alert>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Статус</TableCell>
                                <TableCell>Создан</TableCell>
                                <TableCell>Владелец</TableCell>
                                <TableCell>Маршрут</TableCell>
                                <TableCell>Дата</TableCell>
                                <TableCell>Тип</TableCell>
                                <TableCell>Вес / Объём</TableCell>
                                <TableCell>Автомобили</TableCell>
                                <TableCell>Цена</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((c) => {
                                const isDeleted = Boolean(c.deleted_at);

                                return (
                                    <TableRow
                                        key={c.id}
                                        hover
                                        sx={{
                                            opacity: isDeleted ? 0.68 : 1,
                                            backgroundColor: isDeleted
                                                ? "rgba(244, 67, 54, 0.06)"
                                                : "inherit",
                                            "& td": {
                                                verticalAlign: "top",
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                {isDeleted ? (
                                                    <>
                                                        <Chip
                                                            size="small"
                                                            color="error"
                                                            label="Удалён"
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {fmtDT(c.deleted_at)}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                        label="Активен"
                                                    />
                                                )}
                                            </Stack>
                                        </TableCell>

                                        <TableCell>{fmtDT(c.created_at)}</TableCell>

                                        <TableCell>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/admin/user/${c.user_id}`)}
                                            >
                                                <Avatar
                                                    src={c.user?.avatar ?? undefined}
                                                    sx={{ width: 26, height: 26 }}
                                                >
                                                    <FiUser />
                                                </Avatar>

                                                <Stack spacing={0}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {[c.user?.first_name, c.user?.last_name]
                                                            .filter(Boolean)
                                                            .join(" ") || "—"}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {c.user?.phone || "—"}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <FiMapPin />
                                                <Typography variant="body2">{route(c.points)}</Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {fmtD(c.date_from)} – {fmtD(c.date_to)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                <Chip size="small" label={c.cargo_type || "—"} />
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={
                                                        Array.isArray(c.load_type) && c.load_type.length
                                                            ? c.load_type.join(", ")
                                                            : "—"
                                                    }
                                                />
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={c.vehicle_type || "—"}
                                                />
                                                {c.has_dimensions && (
                                                    <Chip
                                                        size="small"
                                                        color="primary"
                                                        label="Размеры"
                                                    />
                                                )}
                                                {c.allow_partial_load && (
                                                    <Chip
                                                        size="small"
                                                        color="secondary"
                                                        label="Частичная"
                                                    />
                                                )}
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {fmtNum(c.weight_t, " т")} / {fmtNum(c.volume_m3, " м³")}
                                            </Typography>

                                            {c.has_dimensions && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {fmtNum(c.length_m)} × {fmtNum(c.width_m)} ×{" "}
                                                    {fmtNum(c.height_m)} м
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>{c.cars_count ?? "—"}</TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {c.price_amount ?? "—"} {c.price_currency || ""}
                                            </Typography>

                                            <Typography variant="caption" color="text.secondary">
                                                {c.payment_method
                                                    ? c.payment_method.replaceAll("_", " ")
                                                    : "—"}
                                                {c.payment_term
                                                    ? `, ${c.payment_term.toLowerCase()}`
                                                    : ""}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                justifyContent="flex-end"
                                            >
                                                {isDeleted ? (
                                                    <Tooltip title="Восстановить груз">
                                                        <span>
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => setToRestore(c)}
                                                            >
                                                                <FiRotateCcw />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Удалить груз">
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => setToDelete(c)}
                                                            >
                                                                <FiTrash2 />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10}>
                                        <Typography
                                            align="center"
                                            color="text.secondary"
                                            sx={{ py: 4 }}
                                        >
                                            {error ?? "Грузы не найдены"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={10}>
                                        <Typography
                                            align="center"
                                            color="text.secondary"
                                            sx={{ py: 4 }}
                                        >
                                            Загрузка…
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                    Страница {pageSafe} из {pagesSafe}
                </Typography>

                <Pagination
                    count={pagesSafe}
                    page={pageSafe}
                    onChange={(_, p) => setPage(p)}
                    siblingCount={1}
                />
            </Stack>

            <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
                <DialogTitle>Удалить груз</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Вы уверены, что хотите удалить груз{" "}
                        <b>{toDelete?.id.slice(0, 8)}…</b>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setToDelete(null)}>Отмена</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={busy}
                    >
                        {busy ? "Удаление…" : "Удалить"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!toRestore} onClose={() => setToRestore(null)}>
                <DialogTitle>Восстановить груз</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Вы уверены, что хотите восстановить груз{" "}
                        <b>{toRestore?.id.slice(0, 8)}…</b>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setToRestore(null)}>Отмена</Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={confirmRestore}
                        disabled={busy}
                    >
                        {busy ? "Восстановление…" : "Восстановить"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}