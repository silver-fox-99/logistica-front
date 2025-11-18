// features/admin/geo-locations/pages/AdminGeoLocationFlowPage.tsx
import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
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
import {FiMapPin, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiEdit3, FiDownload} from "react-icons/fi";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";
import { useGeoLocations } from "@/features/admin/geo-locations/model/useGeoLocations";
import GeoLocationDialog from "@/features/admin/geo-locations/ui/GeoLocationDialog";
import GeoTreeFlow from "@/features/admin/geo-locations/ui/GeoTreeFlow";
import GeoImportDialog from "@/features/admin/geo-locations/ui/GeoDatasetPanel.tsx";


const TYPES: (LocationType | "")[] = ["", "COUNTRY", "REGION", "CITY", "DISTRICT", "OTHER"];

export default function AdminGeoLocationFlowPage() {
    const {
        items,
        loading,
        error,
        search,
        setSearch,
        selectedId,
        setSelectedId,
        typeFilter,
        setTypeFilter,
        byId,
        childrenOf,
        treeRoots,
        create,
        update,
        remove,
        reload,
    } = useGeoLocations();

    const [dlgOpen, setDlgOpen] = useState(false);
    const [dlgMode, setDlgMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<GeoLocation | null>(null);
    const [busy, setBusy] = useState(false);
    const [createParentId, setCreateParentId] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const rows = useMemo(() => {
        if (!selectedId) return treeRoots;
        return childrenOf(selectedId);
    }, [selectedId, childrenOf, treeRoots]);

    const openCreateCity = (parentId: string) => {
        setDlgMode("create");
        setEditing(null);
        setCreateParentId(parentId);
        setDlgOpen(true);
    };

    const openEditCity = (cityId: string) => {
        const node = byId.get(cityId);
        if (!node) return;
        setDlgMode("edit");
        setEditing(node);
        setCreateParentId(null);
        setDlgOpen(true);
    };

    const openCreateGeneral = () => {
        setDlgMode("create");
        setEditing(null);
        setCreateParentId(selectedId ?? null);
        setDlgOpen(true);
    };

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
            setCreateParentId(null);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (row: GeoLocation) => {
        if (!confirm(`Delete "${row.name}"?`)) return;
        const wasSelected = selectedId === row.id;
        await remove(row.id);
        if (wasSelected) setSelectedId(null);
    };

    return (
        <Stack spacing={2}>
            {/* Header */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
            >
                <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FiMapPin />
                        <Typography variant="h5" fontWeight={700}>
                            Гео-локации
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {items.length.toLocaleString()} всего
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button
                        startIcon={<FiPlus />}
                        variant="contained"
                        onClick={openCreateGeneral}
                    >
                        Добавить локацию
                    </Button>
                    <Button
                        startIcon={<FiDownload />}
                        variant="outlined"
                        onClick={() => setImportOpen(true)}
                    >
                        Догрузить данные
                    </Button>
                    <Tooltip title="Обновить">
                        <span>
                            <IconButton onClick={reload}>
                                <FiRefreshCw />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* Filters */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    alignItems={{ md: "center" }}
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <TextField
                            size="small"
                            placeholder="Поиск по названию/коду/ISO2…"
                            value={search}
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
                        <Select
                            size="small"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as LocationType | "")}
                            sx={{ minWidth: 180 }}
                            displayEmpty
                        >
                            {TYPES.map((t) => (
                                <MenuItem key={t || "ALL"} value={t}>
                                    {t || "Все типы"}
                                </MenuItem>
                            ))}
                        </Select>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Подсказка: двойной клик по Стране/Региону для добавления Города, двойной клик по Городу для
                        редактирования.
                    </Typography>
                </Stack>
            </Paper>

            {/* Flow */}
            <GeoTreeFlow
                items={items}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onAddCity={openCreateCity}
                onEditCity={openEditCity}
            />

            {/* Children table */}
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ px: 2, py: 1 }}
                    >
                        <Typography variant="subtitle2">Список элементов</Typography>
                        <Button size="small" startIcon={<FiPlus />} onClick={openCreateGeneral}>
                            Добавить
                        </Button>
                    </Stack>
                    <Divider />
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Название</TableCell>
                                <TableCell>Тип</TableCell>
                                <TableCell>Родитель</TableCell>
                                <TableCell>Код</TableCell>
                                <TableCell>ISO2</TableCell>
                                <TableCell>Слаг</TableCell>
                                <TableCell>Активен</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{row.name || "Без названия"}</TableCell>
                                    <TableCell>
                                        <Chip size="small" label={row.type} />
                                    </TableCell>
                                    <TableCell>
                                        {row.parent_id ? byId.get(row.parent_id)?.name ?? row.parent_id : "—"}
                                    </TableCell>
                                    <TableCell>{row.code || "—"}</TableCell>
                                    <TableCell>{row.iso2 || "—"}</TableCell>
                                    <TableCell>{row.slug || "—"}</TableCell>
                                    <TableCell>{row.is_active === false ? "Нет" : "Да"}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="Редактировать">
                                                <span>
                                                    <IconButton size="small" onClick={() => openEditCity(row.id)}>
                                                        <FiEdit3 />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(row)}
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            Локации не найдены
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            Загрузка…
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {error && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="error" sx={{ py: 4 }}>
                                            {error}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>

            {/* Dataset / Import panel (отдельный модуль) */}
            <GeoLocationDialog
                key={`${dlgMode}-${editing?.id ?? "new"}-${createParentId ?? "none"}`}
                open={dlgOpen}
                mode={dlgMode}
                title={
                    dlgMode === "create"
                        ? "Добавить гео-локацию"
                        : `Редактировать: ${editing?.name}`
                }
                all={items}
                initial={
                    dlgMode === "edit"
                        ? editing ?? undefined
                        : {
                            parent_id: createParentId ?? undefined,
                            type: "CITY" as LocationType,
                        }
                }
                onClose={() => {
                    setDlgOpen(false);
                    setEditing(null);
                    setCreateParentId(null);
                }}
                onSubmit={handleSubmit}
                submitting={busy}
            />

            {/* Диалог импорта из датасета */}
            <GeoImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                allLocations={items}
                onImported={reload}
            />
        </Stack>
    );
}
