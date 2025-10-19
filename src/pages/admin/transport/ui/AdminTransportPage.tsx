// src/pages/admin/transport/ui/AdminTransportPage.tsx
import {
    Avatar,
    Box,
    Chip,
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField,
    Tooltip,
    Typography,
    Button,
} from "@mui/material";
import { FiSearch, FiTrash2, FiMapPin, FiUser } from "react-icons/fi";
import { useAdminTransport } from "@/features/admin/transport-list/model/useAdminTransport";
import { adminTransportApi, type TransportItem } from "@/shared/api/adminTransportApi";
import { useNavigate } from "react-router-dom";
import React from "react";

const n = (v?: number, d = 0) => (typeof v === "number" ? v : d);
const fmtDT = (d?: string | null) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false }) : "—";
const fmtD = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";

function route(p: TransportItem["points"]): string {
    if (!p?.length) return "—";
    const from = p[0]?.city ?? p[0]?.region ?? p[0]?.country ?? "—";
    const to   = p[p.length - 1]?.city ?? p[p.length - 1]?.region ?? p[p.length - 1]?.country ?? "—";
    return `${from} → ${to}`;
}

export default function AdminTransportPage() {
    const navigate = useNavigate();
    const { items, total, pages, loading, error, params, setPage, setLimit, setSearch, refetch } =
        useAdminTransport({ page: 1, limit: 20 });

    const totalSafe = n(total, 0);
    const pageSafe  = n(params.page, 1);
    const pagesSafe = n(pages, 1);
    const limitSafe = n(params.limit, 20);

    const [toDelete, setToDelete] = React.useState<TransportItem | null>(null);
    const [busy, setBusy] = React.useState(false);

    const confirmDelete = async () => {
        if (!toDelete) return;
        setBusy(true);
        try {
            await adminTransportApi.remove(toDelete.id);
            setToDelete(null);
            refetch();
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Stack spacing={0}>
                    <Typography variant="h5" fontWeight={700}>Transport</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {totalSafe.toLocaleString()} record{totalSafe === 1 ? "" : "s"}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                    <TextField
                        size="small"
                        placeholder="Search by route, note, phone, etc…"
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                        sx={{ minWidth: 280 }}
                    />
                    <Select size="small" value={String(limitSafe)} onChange={(e) => setLimit(Number(e.target.value))}>
                        {[10, 20, 50, 100].map(n => <MenuItem key={n} value={n}>{n}/page</MenuItem>)}
                    </Select>
                </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Created</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Route</TableCell>
                                <TableCell>Dates</TableCell>
                                <TableCell>Vehicle</TableCell>
                                <TableCell>Weight/Vol</TableCell>
                                <TableCell>Cars</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((t) => (
                                <TableRow key={t.id} hover>
                                    <TableCell>{fmtDT(t.created_at)}</TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: "pointer" }}
                                               onClick={() => navigate(`/admin/user/${t.user_id}`)}>
                                            <Avatar src={t.user?.avatar ?? undefined} sx={{ width: 26, height: 26 }}>
                                                <FiUser />
                                            </Avatar>
                                            <Stack spacing={0}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {[t.user?.first_name, t.user?.last_name].filter(Boolean).join(" ") || "—"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">{t.user?.phone}</Typography>
                                            </Stack>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <FiMapPin />
                                            <Typography variant="body2">{route(t.points)}</Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">{fmtD(t.date_from)} – {fmtD(t.date_to)}</Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip size="small" label={t.vehicle_type} />
                                        {t.has_dimensions && (
                                            <Chip size="small" color="primary" label="Dims" sx={{ ml: .5 }} />
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {parseFloat(t.weight_t)} t / {parseFloat(t.volume_m3)} m³
                                        </Typography>
                                        {t.has_dimensions && (
                                            <Typography variant="caption" color="text.secondary">
                                                {t.length_m} × {t.width_m} × {t.height_m} m
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>{t.cars_count}</TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {t.price_amount} {t.price_currency}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {t.payment_method.replaceAll("_", " ")}, {t.payment_term.toLowerCase()}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title="Delete transport">
                      <span>
                        <IconButton color="error" onClick={() => setToDelete(t)}>
                          <FiTrash2 />
                        </IconButton>
                      </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            {error ?? "No transport found"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            Loading…
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
                    Page {pageSafe} of {pagesSafe}
                </Typography>
                <Pagination count={pagesSafe} page={pageSafe} onChange={(_, p) => setPage(p)} siblingCount={1} />
            </Stack>

            <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
                <DialogTitle>Delete transport</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Are you sure you want to delete transport <b>{toDelete?.id.slice(0, 8)}…</b>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setToDelete(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={busy}>
                        {busy ? "Deleting…" : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
