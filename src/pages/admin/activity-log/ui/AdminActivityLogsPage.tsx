import {
    Box, Chip, InputAdornment, MenuItem, Pagination, Paper, Select, Stack, Switch,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, IconButton
} from "@mui/material";
import { FiSearch, FiInfo, FiClock } from "react-icons/fi";
import { useActivityLogs } from "@/features/admin/activity-logs/model/useActivityLogs";
import ActivityDetailsDialog from "@/features/admin/activity-logs/ui/ActivityDetailsDialog";
import { useState } from "react";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;

const fmtDT = (d?: string) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false }) : "—";

function statusColor(code: number) {
    if (code >= 500) return "error";
    if (code >= 400) return "warning";
    if (code >= 300) return "info";
    return "success";
}

export default function AdminActivityLogsPage() {
    const { items, total, pages, loading, error, page, setPage, limit, setLimit, filters, setFilters } =
        useActivityLogs({ page: 1, limit: 10 });

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<typeof items[number] | null>(null);

    const openDetails = (row: typeof items[number]) => { setSelected(row); setOpen(true); };

    return (
        <Stack spacing={2}>
            {/* header + controls */}
            <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ lg: "center" }} justifyContent="space-between">
                <Stack spacing={0}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FiClock />
                        <Typography variant="h5" fontWeight={700}>Activity logs</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {total.toLocaleString()} record{total === 1 ? "" : "s"}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <TextField
                        size="small"
                        placeholder="Search (user, description, IP)…"
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                        sx={{ minWidth: 240 }}
                    />

                    <Select
                        size="small"
                        value={filters.method}
                        displayEmpty
                        onChange={(e) => setFilters((f) => ({ ...f, method: String(e.target.value) }))}
                        sx={{ minWidth: 130 }}
                    >
                        <MenuItem value=""><em>All methods</em></MenuItem>
                        {METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>

                    <TextField
                        size="small"
                        placeholder="Endpoint (e.g. /auth/login)"
                        value={filters.endpoint}
                        onChange={(e) => setFilters((f) => ({ ...f, endpoint: e.target.value }))}
                        sx={{ minWidth: 220 }}
                    />

                    <TextField
                        size="small"
                        placeholder="Status"
                        type="number"
                        value={filters.statusCode ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            setFilters((f) => ({ ...f, statusCode: v === "" ? "" : Number(v) }));
                        }}
                        sx={{ width: 120 }}
                    />

                    <TextField
                        size="small"
                        type="datetime-local"
                        label="From"
                        InputLabelProps={{ shrink: true }}
                        value={filters.dateFrom ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                    />
                    <TextField
                        size="small"
                        type="datetime-local"
                        label="To"
                        InputLabelProps={{ shrink: true }}
                        value={filters.dateTo ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                    />

                    <TextField
                        size="small"
                        placeholder="User ID (UUID)"
                        value={filters.userId ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
                        sx={{ minWidth: 240 }}
                    />

                    <Stack direction="row" alignItems="center">
                        <Switch
                            checked={filters.includeAnonymous}
                            onChange={(_, v) => setFilters((f) => ({ ...f, includeAnonymous: v }))}
                        />
                        <Typography variant="body2">Include anonymous</Typography>
                    </Stack>

                    <Select size="small" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
                        {[10, 20, 50, 100].map(n => <MenuItem key={n} value={n}>{n}/page</MenuItem>)}
                    </Select>
                </Stack>
            </Stack>

            {/* table */}
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Method</TableCell>
                                <TableCell>Endpoint</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{fmtDT(row.time)}</TableCell>
                                    <TableCell>{row.user}</TableCell>
                                    <TableCell><Chip size="small" label={row.method} /></TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.endpoint}</Typography>
                                        {row.description && (
                                            <Typography variant="caption" color="text.secondary">{row.description}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            color={statusColor(row.statusCode) as any}
                                            variant="outlined"
                                            label={row.statusCode}
                                        />
                                    </TableCell>
                                    <TableCell>{row.durationMs} ms</TableCell>
                                    <TableCell>{row.ip}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View details">
                      <span>
                        <IconButton onClick={() => openDetails(row)}><FiInfo /></IconButton>
                      </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            {error ?? "No logs found"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={8}>
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

            {/* pagination */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                    Page {page} of {pages}
                </Typography>
                <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} siblingCount={1} />
            </Stack>

            <ActivityDetailsDialog open={open} onClose={() => setOpen(false)} item={selected} />
        </Stack>
    );
}
