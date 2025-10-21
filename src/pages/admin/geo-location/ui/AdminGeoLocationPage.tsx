import { useMemo, useState } from "react";
import {
    Avatar, Box, Button, Chip, Divider, IconButton, InputAdornment, MenuItem, Paper, Select, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { FiMapPin, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiEdit3, FiChevronRight } from "react-icons/fi";
import { useGeoLocations } from "@/features/admin/geo-locations/model/useGeoLocations";
import GeoLocationDialog from "@/features/admin/geo-locations/ui/GeoLocationDialog";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";

const TYPES: (LocationType | "")[] = ["", "COUNTRY", "REGION", "CITY", "DISTRICT", "OTHER"];

/** Сбор цепочки предков для любого узла */
function buildChain(node: GeoLocation | null, byId: Map<string, GeoLocation>) {
    if (!node) return [] as GeoLocation[];
    const chain: GeoLocation[] = [];
    let p: GeoLocation | undefined | null = node;
    while (p) { chain.unshift(p); p = p.parent_id ? byId.get(p.parent_id) : null; }
    return chain;
}
const getAncestorName = (row: GeoLocation, byId: Map<string, GeoLocation>, t: LocationType) =>
    buildChain(row, byId).find(n => n.type === t)?.name ?? "—";

type FlatRow = { node: GeoLocation; depth: number };

export default function AdminGeoLocationsPage() {
    const {
        items, loading, error,
        search, setSearch,
        selectedId, setSelectedId,
        typeFilter, setTypeFilter,
        byId, treeRoots,
        create, update, remove, reload,
    } = useGeoLocations();

    const [dlgOpen, setDlgOpen] = useState(false);
    const [dlgMode, setDlgMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<GeoLocation | null>(null);
    const [busy, setBusy] = useState(false);
    const [scope, setScope] = useState<"direct" | "all">("all"); // NEW

    const current = selectedId ? byId.get(selectedId) ?? null : null;

    // Индекс детей по parent_id, чтобы быстро ходить в глубину
    const childrenIndex = useMemo(() => {
        const map = new Map<string | null, GeoLocation[]>();
        for (const it of items) {
            const key = (it.parent_id ?? null) as string | null;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(it);
        }
        return map;
    }, [items]);

    // Прямые дети
    const direct = useMemo(
        () => (current ? (childrenIndex.get(current.id) ?? []) : treeRoots),
        [current, childrenIndex, treeRoots]
    );

    // Плоский список всех потомков с глубиной
    const allDescendants: FlatRow[] = useMemo(() => {
        if (!current) return treeRoots.map(n => ({ node: n, depth: 0 }));
        const res: FlatRow[] = [];
        const stack: FlatRow[] = (childrenIndex.get(current.id) ?? []).map(n => ({ node: n, depth: 0 }));
        while (stack.length) {
            const item = stack.shift()!;
            res.push(item);
            const kids = childrenIndex.get(item.node.id) ?? [];
            for (const k of kids) stack.push({ node: k, depth: item.depth + 1 });
        }
        return res;
    }, [current, treeRoots, childrenIndex]);

    // Итоговые строки для таблицы
    const rows: FlatRow[] = useMemo(() => {
        const base = scope === "direct"
            ? direct.map(n => ({ node: n, depth: 0 }))
            : allDescendants;
        // Фильтры (поисковый и по типу)
        const q = search.trim().toLowerCase();
        return base.filter(({ node }) => {
            const typeOk = !typeFilter || node.type === typeFilter;
            const text = [node.name, node.code, node.slug, node.iso2].filter(Boolean).join(" ").toLowerCase();
            const searchOk = !q || text.includes(q);
            return typeOk && searchOk;
        });
    }, [scope, direct, allDescendants, search, typeFilter]);

    const openCreate = () => { setDlgMode("create"); setEditing(null); setDlgOpen(true); };
    const openEdit   = (row: GeoLocation) => { setDlgMode("edit"); setEditing(row); setDlgOpen(true); };

    const handleSubmit = async (dto: any) => {
        setBusy(true);
        try {
            if (dlgMode === "create") {
                await create(dto);
                if (dto?.parent_id !== undefined) setSelectedId(dto.parent_id ?? null);
            } else if (editing) {
                await update(editing.id, dto);
                if (dto?.parent_id !== undefined) setSelectedId(dto.parent_id ?? null);
            }
            setDlgOpen(false);
            setEditing(null);
        } finally { setBusy(false); }
    };

    const handleDelete = async (row: GeoLocation) => {
        if (!confirm(`Delete "${row.name}"?`)) return;
        const wasSelected = selectedId === row.id;
        await remove(row.id);
        if (wasSelected) setSelectedId(null);
    };

    return (
        <Stack spacing={2}>
            {/* header */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FiMapPin /><Typography variant="h5" fontWeight={700}>Geo locations</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{items.length.toLocaleString()} total</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<FiPlus />} variant="contained" onClick={openCreate}>Add location</Button>
                    <Tooltip title="Reload"><span><IconButton onClick={reload}><FiRefreshCw /></IconButton></span></Tooltip>
                </Stack>
            </Stack>

            {/* filters */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <TextField
                            size="small" placeholder="Search by name/code/slug/ISO2…" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                            sx={{ minWidth: 280 }}
                        />
                        <Select size="small" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as LocationType | "")}
                                sx={{ minWidth: 180 }} displayEmpty>
                            {TYPES.map(t => <MenuItem key={t || "ALL"} value={t}>{t || "All types"}</MenuItem>)}
                        </Select>
                    </Stack>

                    {/* NEW: режим выборки */}
                    <ToggleButtonGroup size="small" value={scope} exclusive onChange={(_, v) => v && setScope(v)}>
                        <ToggleButton value="direct">Direct children</ToggleButton>
                        <ToggleButton value="all">All descendants</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Paper>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                {/* left: hierarchy roots */}
                <Paper variant="outlined" sx={{ width: { md: 360 }, flexShrink: 0, borderRadius: 2, p: 1, maxHeight: 560, overflow: "auto" }}>
                    <Typography variant="subtitle2" sx={{ px: 1, py: 0.5 }}>Hierarchy</Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Stack spacing={0.5}>
                        {treeRoots.map(root => {
                            const childCount = (childrenIndex.get(root.id) ?? []).length;
                            return (
                                <Stack key={root.id}
                                       sx={{ p: 1, borderRadius: 1, bgcolor: selectedId === root.id ? "action.selected" : "transparent", cursor: "pointer" }}
                                       onClick={() => setSelectedId(root.id)}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Avatar sx={{ width: 24, height: 24 }}>{(root.name?.[0] ?? "?").toUpperCase()}</Avatar>
                                        <Typography variant="body2" fontWeight={600}>{root.name || "Unnamed"}</Typography>
                                        <Chip size="small" label={root.type} variant="outlined" />
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ pl: 4 }}>
                                        {childCount} {childCount === 1 ? "child" : "children"}
                                    </Typography>
                                </Stack>
                            );
                        })}
                        {!loading && treeRoots.length === 0 && <Typography align="center" color="text.secondary" sx={{ py: 2 }}>No roots found</Typography>}
                        {loading && <Typography align="center" color="text.secondary" sx={{ py: 2 }}>Loading…</Typography>}
                        {error && <Typography align="center" color="error" sx={{ py: 2 }}>{error}</Typography>}
                    </Stack>
                </Paper>

                {/* right: table */}
                <Paper variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
                    <Box sx={{ overflowX: "auto" }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                            <Stack spacing={0}>
                                <Typography variant="subtitle2">Children list</Typography>
                                {current && (
                                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                        {buildChain(current, byId).map((n, i) => (
                                            <Stack key={n.id} direction="row" spacing={0.5} alignItems="center">
                                                {i > 0 && <FiChevronRight size={14} />}<Chip size="small" label={`${n.name} (${n.type})`} />
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                            <Button size="small" startIcon={<FiPlus />} onClick={openCreate}>Add</Button>
                        </Stack>
                        <Divider />
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Country</TableCell>
                                    <TableCell>Region</TableCell>
                                    <TableCell>Parent</TableCell>
                                    <TableCell>Code</TableCell>
                                    <TableCell>ISO2</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map(({ node, depth }) => (
                                    <TableRow key={node.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box sx={{ width: depth * 16 }} />
                                                <span>{node.name || "Unnamed"}</span>
                                            </Stack>
                                        </TableCell>
                                        <TableCell><Chip size="small" label={node.type} /></TableCell>
                                        <TableCell>{getAncestorName(node, byId, "COUNTRY")}</TableCell>
                                        <TableCell>{getAncestorName(node, byId, "REGION")}</TableCell>
                                        <TableCell>{node.parent_id ? (byId.get(node.parent_id)?.name ?? node.parent_id) : "—"}</TableCell>
                                        <TableCell>{node.code || "—"}</TableCell>
                                        <TableCell>{node.iso2 || "—"}</TableCell>
                                        <TableCell>{node.slug || "—"}</TableCell>
                                        <TableCell>{node.is_active === false ? "No" : "Yes"}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="Edit"><span><IconButton size="small" onClick={() => openEdit(node)}><FiEdit3 /></IconButton></span></Tooltip>
                                                <Tooltip title="Delete"><span><IconButton size="small" color="error" onClick={() => handleDelete(node)}><FiTrash2 /></IconButton></span></Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && rows.length === 0 && (
                                    <TableRow><TableCell colSpan={10}><Typography align="center" color="text.secondary" sx={{ py: 4 }}>No locations</Typography></TableCell></TableRow>
                                )}
                                {loading && (
                                    <TableRow><TableCell colSpan={10}><Typography align="center" color="text.secondary" sx={{ py: 4 }}>Loading…</Typography></TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>
            </Stack>

            <GeoLocationDialog
                key={`${dlgMode}-${editing?.id ?? "new"}`}
                open={dlgOpen}
                mode={dlgMode}
                title={dlgMode === "create" ? "Add geo location" : `Edit: ${editing?.name}`}
                all={items}
                initial={dlgMode === "edit" ? editing ?? undefined : { parent_id: selectedId ?? undefined }}
                onClose={() => { setDlgOpen(false); setEditing(null); }}
                onSubmit={handleSubmit}
                submitting={busy}
            />
        </Stack>
    );
}
