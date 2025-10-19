// src/pages/admin/blacklist/ui/AdminBlacklistPage.tsx
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
    Switch,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField,
    Tooltip,
    Typography,
    Button,
} from "@mui/material";
import { FiSearch, FiTrash2, FiUser } from "react-icons/fi";
import { useIpBlacklist } from "@/features/admin/ip-blacklist/model/useIpBlacklist";
import { adminIpBlacklistApi, type IpBan } from "@/shared/api/adminIpBlackListApi.ts";
import IpBanDialog, { type IpBanFormValues } from "@/features/admin/ip-blacklist/ui/IpBanDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {FaBan} from "react-icons/fa";

const n = (v?: number, d = 0) => (typeof v === "number" ? v : d);
const fmtDT = (d?: string | null) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false }) : "—";

export default function AdminBlacklistPage() {
    const navigate = useNavigate();
    const { items, total, pages, loading, error, params, setPage, setLimit, setSearch, refetch } =
        useIpBlacklist({ page: 1, limit: 20 });

    const totalSafe = n(total, 0);
    const pageSafe  = n(params.page, 1);
    const pagesSafe = n(pages, 1);
    const limitSafe = n(params.limit, 20);

    // dialogs
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<IpBan | null>(null);
    const [delItem, setDelItem]     = useState<IpBan | null>(null);
    const [busy, setBusy] = useState(false);

    const createSubmit = async (v: IpBanFormValues) => {
        setBusy(true);
        try {
            await adminIpBlacklistApi.create({
                network: v.network,
                reason: v.reason || undefined,
                is_active: v.is_active,
                expiresAt: v.expiresAt || undefined,
            });
            setCreateOpen(false);
            refetch();
        } finally { setBusy(false); }
    };

    const editSubmit = async (v: IpBanFormValues) => {
        if (!editItem) return;
        setBusy(true);
        try {
            await adminIpBlacklistApi.patch(editItem.id, {
                network: v.network,
                reason: v.reason || undefined,
                is_active: v.is_active,
                expiresAt: v.expiresAt ? v.expiresAt : undefined,
            });
            setEditItem(null);
            refetch();
        } finally { setBusy(false); }
    };

    const toggleActive = async (row: IpBan, next: boolean) => {
        setBusy(true);
        try {
            await adminIpBlacklistApi.patch(row.id, { is_active: next });
            refetch();
        } finally { setBusy(false); }
    };

    const remove = async () => {
        if (!delItem) return;
        setBusy(true);
        try {
            await adminIpBlacklistApi.remove(delItem.id);
            setDelItem(null);
            refetch();
        } finally { setBusy(false); }
    };

    return (
        <Stack spacing={2}>
            {/* header */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Stack spacing={0}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FaBan /><Typography variant="h5" fontWeight={700}>IP Blacklist</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {totalSafe.toLocaleString()} record{totalSafe === 1 ? "" : "s"}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                    <TextField
                        size="small"
                        placeholder="Search by IP, CIDR or reason…"
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                        sx={{ minWidth: 280 }}
                    />
                    <Select size="small" value={String(limitSafe)} onChange={(e) => setLimit(Number(e.target.value))}>
                        {[10, 20, 50, 100].map(n => <MenuItem key={n} value={n}>{n}/page</MenuItem>)}
                    </Select>
                    <Button variant="contained" onClick={() => setCreateOpen(true)}>Add entry</Button>
                </Stack>
            </Stack>

            {/* table */}
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Created</TableCell>
                                <TableCell>Network</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell>Hits</TableCell>
                                <TableCell>Created by</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{fmtDT(row.created_at)}</TableCell>
                                    <TableCell><Chip size="small" label={row.network} /></TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.reason || "—"}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={row.is_active}
                                            onChange={(_, next) => toggleActive(row, next)}
                                        />
                                    </TableCell>
                                    <TableCell>{fmtDT(row.expires_at)}</TableCell>
                                    <TableCell>{row.hits}</TableCell>
                                    <TableCell>
                                        {row.created_by ? (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: "pointer" }}
                                                   onClick={() => navigate(`/admin/user/${row.created_by!.id}`)}>
                                                <Avatar src={row.created_by.avatar ?? undefined} sx={{ width: 24, height: 24 }}>
                                                    <FiUser />
                                                </Avatar>
                                                <Typography variant="body2">
                                                    {[row.created_by.first_name, row.created_by.last_name].filter(Boolean).join(" ") || row.created_by.phone}
                                                </Typography>
                                            </Stack>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button size="small" variant="outlined" onClick={() => setEditItem(row)}>Edit</Button>
                                            <Tooltip title="Delete">
                        <span>
                          <IconButton color="error" onClick={() => setDelItem(row)}>
                            <FiTrash2 />
                          </IconButton>
                        </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            {error ?? "No entries found"}
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
                    Page {pageSafe} of {pagesSafe}
                </Typography>
                <Pagination count={pagesSafe} page={pageSafe} onChange={(_, p) => setPage(p)} siblingCount={1} />
            </Stack>

            {/* create */}
            <IpBanDialog
                open={createOpen}
                title="Add IP or CIDR to blacklist"
                onClose={() => setCreateOpen(false)}
                onSubmit={createSubmit}
                submitting={busy}
            />

            {/* edit */}
            <IpBanDialog
                open={!!editItem}
                title="Edit blacklist entry"
                defaultValues={editItem ? {
                    network: editItem.network,
                    reason: editItem.reason ?? "",
                    is_active: editItem.is_active,
                    expiresAt: editItem.expires_at ?? "",
                } : undefined}
                onClose={() => setEditItem(null)}
                onSubmit={editSubmit}
                submitting={busy}
            />

            {/* delete confirm */}
            <Dialog open={!!delItem} onClose={() => setDelItem(null)}>
                <DialogTitle>Delete entry</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Are you sure you want to delete <b>{delItem?.network}</b>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDelItem(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={remove} disabled={busy}>
                        {busy ? "Deleting…" : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
