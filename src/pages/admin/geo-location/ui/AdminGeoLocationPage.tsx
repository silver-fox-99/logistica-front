import { useMemo, useState } from "react";
import {
    Avatar, Box, Button, Chip, Divider, IconButton, InputAdornment, MenuItem, Paper, Select, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography
} from "@mui/material";
import { FiMapPin, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiEdit3, FiChevronRight } from "react-icons/fi";
import { useGeoLocations } from "@/features/admin/geo-locations/model/useGeoLocations";
import GeoLocationDialog from "@/features/admin/geo-locations/ui/GeoLocationDialog";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";

const TYPES: (LocationType | "")[] = ["", "COUNTRY", "REGION", "CITY", "DISTRICT", "OTHER"];

function BreadcrumbsPath({ current, byId }: { current: GeoLocation | null; byId: Map<string, GeoLocation> }) {
    if (!current) return null;
    const chain: GeoLocation[] = [];
    let p: GeoLocation | undefined | null = current;
    while (p) {
        chain.unshift(p);
        p = p.parent_id ? byId.get(p.parent_id) : null;
    }
    return (
        <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
            {chain.map((n, idx) => (
                <Stack key={n.id} direction="row" spacing={0.5} alignItems="center">
                    {idx > 0 && <FiChevronRight size={14} />}
                    <Chip size="small" label={`${n.name} (${n.type})`} />
                </Stack>
            ))}
        </Stack>
    );
}

export default function AdminGeoLocationsPage() {
    const {
        items, loading, error,
        search, setSearch,
        selectedId, setSelectedId,
        typeFilter, setTypeFilter,
        byId, treeRoots, childrenOf,
        create, update, remove, reload,
    } = useGeoLocations();

    const [dlgOpen, setDlgOpen] = useState(false);
    const [dlgMode, setDlgMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<GeoLocation | null>(null);
    const [busy, setBusy] = useState(false);

    const current = selectedId ? byId.get(selectedId) ?? null : null;
    const siblings = useMemo(
        () => childrenOf(current ? current.id : null),
        [childrenOf, current]
    );

    const openCreate = () => { setDlgMode("create"); setEditing(null); setDlgOpen(true); };
    const openEdit   = (row: GeoLocation) => { setDlgMode("edit"); setEditing(row); setDlgOpen(true); };

    const handleSubmit = async (dto: any) => {
        setBusy(true);
        try {
            if (dlgMode === "create") {
                await create(dto);
            } else if (editing) {
                await update(editing.id, dto);
            }
            setDlgOpen(false);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (row: GeoLocation) => {
        if (!confirm(`Delete "${row.name}"?`)) return;
        await remove(row.id);
    };

    return (
        <Stack spacing={2}>
            {/* header */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FiMapPin />
                        <Typography variant="h5" fontWeight={700}>Geo locations</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {items.length.toLocaleString()} total
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<FiPlus />} variant="contained" onClick={openCreate}>Add location</Button>
                    <Tooltip title="Reload">
                        <span><IconButton onClick={reload}><FiRefreshCw /></IconButton></span>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* filters */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <TextField
                            size="small"
                            placeholder="Search by name/code/slug/ISO2…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                            sx={{ minWidth: 280 }}
                        />
                        <Select
                            size="small"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as LocationType | "")}
                            sx={{ minWidth: 180 }}
                            displayEmpty
                        >
                            {TYPES.map(t => <MenuItem key={t || "ALL"} value={t}>{t || "All types"}</MenuItem>)}
                        </Select>
                    </Stack>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Tip: select a parent on the left to manage its children on the right.
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                {/* left: tree-ish list */}
                <Paper variant="outlined" sx={{ width: { md: 360 }, flexShrink: 0, borderRadius: 2, p: 1, maxHeight: 560, overflow: "auto" }}>
                    <Typography variant="subtitle2" sx={{ px: 1, py: 0.5 }}>Hierarchy</Typography>
                    <Divider sx={{ mb: 1 }} />
                    {/* Простой список с вложенностью 1 уровень + кнопки разворачивания можно допилить при желании */}
                    <Stack spacing={0.5}>
                        {treeRoots.map(root => (
                            <Stack key={root.id} sx={{ p: 1, borderRadius: 1, bgcolor: selectedId === root.id ? "action.selected" : "transparent", cursor: "pointer" }}
                                   onClick={() => setSelectedId(root.id)}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Avatar sx={{ width: 24, height: 24 }}>{root.name.slice(0,1).toUpperCase()}</Avatar>
                                    <Typography variant="body2" fontWeight={600}>{root.name}</Typography>
                                    <Chip size="small" label={root.type} variant="outlined" />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ pl: 4 }}>
                                    {items.filter(i => i.parent_id === root.id).length} children
                                </Typography>
                            </Stack>
                        ))}
                        {!loading && treeRoots.length === 0 && (
                            <Typography align="center" color="text.secondary" sx={{ py: 2 }}>No roots found</Typography>
                        )}
                        {loading && (
                            <Typography align="center" color="text.secondary" sx={{ py: 2 }}>Loading…</Typography>
                        )}
                        {error && (
                            <Typography align="center" color="error" sx={{ py: 2 }}>{error}</Typography>
                        )}
                    </Stack>
                </Paper>

                {/* right: table of children (or roots if nothing selected) */}
                <Paper variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
                    <Box sx={{ overflowX: "auto" }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                            <Stack spacing={0}>
                                <Typography variant="subtitle2">Children list</Typography>
                                <BreadcrumbsPath current={current} byId={byId} />
                            </Stack>
                            <Button size="small" startIcon={<FiPlus />} onClick={openCreate}>Add</Button>
                        </Stack>
                        <Divider />
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Code</TableCell>
                                    <TableCell>ISO2</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell>Parent</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(current ? siblings : treeRoots).map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell><Chip size="small" label={row.type} /></TableCell>
                                        <TableCell>{row.code || "—"}</TableCell>
                                        <TableCell>{row.iso2 || "—"}</TableCell>
                                        <TableCell>{row.slug || "—"}</TableCell>
                                        <TableCell>{row.is_active === false ? "No" : "Yes"}</TableCell>
                                        <TableCell>
                                            {row.parent_id ? byId.get(row.parent_id)?.name ?? row.parent_id : "—"}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="Edit">
                          <span>
                            <IconButton size="small" onClick={() => openEdit(row)}>
                              <FiEdit3 />
                            </IconButton>
                          </span>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                          <span>
                            <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                              <FiTrash2 />
                            </IconButton>
                          </span>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && (current ? siblings : treeRoots).length === 0 && (
                                    <TableRow><TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No locations</Typography>
                                    </TableCell></TableRow>
                                )}
                                {loading && (
                                    <TableRow><TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Loading…</Typography>
                                    </TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>
            </Stack>

            <GeoLocationDialog
                open={dlgOpen}
                mode={dlgMode}
                title={dlgMode === "create" ? "Add geo location" : `Edit: ${editing?.name}`}
                all={items}
                initial={dlgMode === "edit" ? editing ?? undefined : { parent_id: selectedId ?? undefined }}
                onClose={() => setDlgOpen(false)}
                onSubmit={handleSubmit}
                submitting={busy}
            />
        </Stack>
    );
}
