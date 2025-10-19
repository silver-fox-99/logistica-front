import {
    Avatar,
    Box,
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
    Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import { FiSearch, FiTrash2, FiMapPin, FiUser } from "react-icons/fi";
import { useAdminCargo } from "@/features/admin/cargo-list/model/useAdminCargo";
import { adminCargoApi, type CargoItem } from "@/shared/api/adminCargoApi.ts";
import { useNavigate } from "react-router-dom";
import React from "react";

const n = (v?: number, d = 0) => (typeof v === "number" ? v : d);
const fmtDT = (d?: string | null) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false }) : "—";
const fmtD = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";

function route(p: CargoItem["points"]): string {
    if (!p?.length) return "—";
    const from = p[0]?.city ?? p[0]?.region ?? p[0]?.country ?? "—";
    const to   = p[p.length - 1]?.city ?? p[p.length - 1]?.region ?? p[p.length - 1]?.country ?? "—";
    return `${from} → ${to}`;
}

export default function AdminCargoPage() {
    const navigate = useNavigate();
    const { items, total, pages, loading, error, params, setPage, setLimit, setSearch, refetch } =
        useAdminCargo({ page: 1, limit: 20 });

    const totalSafe = n(total, 0);
    const pageSafe  = n(params.page, 1);
    const pagesSafe = n(pages, 1);
    const limitSafe = n(params.limit, 20);

    // delete dialog state
    const [toDelete, setToDelete] = React.useState<CargoItem | null>(null);
    const [busy, setBusy] = React.useState(false);

    const confirmDelete = async () => {
        if (!toDelete) return;
        setBusy(true);
        try {
            await adminCargoApi.remove(toDelete.id);
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
                    <Typography variant="h5" fontWeight={700}>Cargo</Typography>
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
                                <TableCell>Type</TableCell>
                                <TableCell>Weight/Vol</TableCell>
                                <TableCell>Cars</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((c) => (
                                <TableRow key={c.id} hover>
                                    <TableCell>{fmtDT(c.created_at)}</TableCell>

                                    {/* Owner */}
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: "pointer" }}
                                               onClick={() => navigate(`/admin/user/${c.user_id}`)}>
                                            <Avatar src={c.user?.avatar ?? undefined} sx={{ width: 26, height: 26 }}>
                                                <FiUser />
                                            </Avatar>
                                            <Stack spacing={0}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {[c.user?.first_name, c.user?.last_name].filter(Boolean).join(" ") || "—"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">{c.user?.phone}</Typography>
                                            </Stack>
                                        </Stack>
                                    </TableCell>

                                    {/* Route */}
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <FiMapPin />
                                            <Typography variant="body2">{route(c.points)}</Typography>
                                        </Stack>
                                    </TableCell>

                                    {/* Dates */}
                                    <TableCell>
                                        <Typography variant="body2">{fmtD(c.date_from)} – {fmtD(c.date_to)}</Typography>
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            <Chip size="small" label={c.cargo_type} />
                                            <Chip size="small" variant="outlined" label={c.load_type} />
                                            <Chip size="small" variant="outlined" label={c.vehicle_type} />
                                            {c.has_dimensions && <Chip size="small" color="primary" label="Dims" />}
                                            {c.allow_partial_load && <Chip size="small" color="secondary" label="Partial" />}
                                        </Stack>
                                    </TableCell>

                                    {/* Weight/Volume */}
                                    <TableCell>
                                        <Typography variant="body2">{parseFloat(c.weight_t)} t / {parseFloat(c.volume_m3)} m³</Typography>
                                        {c.has_dimensions && (
                                            <Typography variant="caption" color="text.secondary">
                                                {c.length_m} × {c.width_m} × {c.height_m} m
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Cars */}
                                    <TableCell>{c.cars_count}</TableCell>

                                    {/* Price */}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {c.price_amount} {c.price_currency}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {c.payment_method.replaceAll("_", " ")}, {c.payment_term.toLowerCase()}
                                        </Typography>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="right">
                                        <Tooltip title="Delete cargo">
                      <span>
                        <IconButton color="error" onClick={() => setToDelete(c)}>
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
                                            {error ?? "No cargo found"}
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

            {/* Delete dialog */}
            <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
                <DialogTitle>Delete cargo</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Are you sure you want to delete cargo <b>{toDelete?.id.slice(0, 8)}…</b>?
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
