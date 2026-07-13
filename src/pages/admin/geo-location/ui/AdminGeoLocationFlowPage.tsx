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
  Grid,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import {
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiEdit3,
  FiDownload,
  FiHome,
  FiChevronRight,
  FiFolder,
} from "react-icons/fi";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";
import { useGeoLocations } from "@/features/admin/geo-locations/model/useGeoLocations";
import GeoLocationDialog from "@/features/admin/geo-locations/ui/GeoLocationDialog";
import GeoTreeFlow, {
  GEO_TYPE_RU,
  LocationIcon,
  nodeColor,
} from "@/features/admin/geo-locations/ui/GeoTreeFlow";
import GeoImportDialog from "@/features/admin/geo-locations/ui/GeoDatasetPanel.tsx";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store.ts";
import { viewCode } from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";

const TYPES: { value: LocationType | ""; label: string }[] = [
  { value: "", label: "Все типы" },
  { value: "COUNTRY", label: "Страны" },
  { value: "REGION", label: "Регионы" },
  { value: "CITY", label: "Города" },
  { value: "DISTRICT", label: "Районы" },
  { value: "OTHER", label: "Другие" },
];

// максимально допустимое количество нод в дереве
const MAX_FLOW_NODES = 400;

type FlowInfo = {
  items: GeoLocation[];
  totalInSubtree: number;
};

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

  const { getLocalizedGeoName } = useLocalizedGeo();

  const canViewGeoLocation = useAdminAccessStore((s) =>
    s.hasPermission(viewCode("GET_LOCATIONS" as any)),
  );

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

  const selectedLocation = useMemo(() => {
    if (!selectedId) return null;
    return byId.get(selectedId) ?? null;
  }, [selectedId, byId]);

  // Хлебные крошки для навигации
  const breadcrumbs = useMemo(() => {
    if (!selectedId) return [];
    const path: GeoLocation[] = [];
    let curr = byId.get(selectedId);
    while (curr) {
      path.unshift(curr);
      curr = curr.parent_id ? byId.get(curr.parent_id) : undefined;
    }
    return path;
  }, [selectedId, byId]);

  // --- поддерево для выбранной локации (для дерева Flow) ---
  const { items: flowItems, totalInSubtree }: FlowInfo = useMemo(() => {
    if (!selectedId) return { items: [], totalInSubtree: 0 };

    const root = byId.get(selectedId);
    if (!root) return { items: [], totalInSubtree: 0 };

    // какие типы считаем корневым элементом для дерева
    const allowedRootTypes: LocationType[] = [
      "COUNTRY",
      "REGION",
      "CITY",
      "DISTRICT",
    ];
    if (!allowedRootTypes.includes(root.type)) {
      return { items: [], totalInSubtree: 0 };
    }

    const byParent = new Map<string | null, GeoLocation[]>();
    for (const it of items) {
      const pid = it.parent_id ?? null;
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid)!.push(it);
    }

    const result: GeoLocation[] = [];
    const visited = new Set<string>();
    const stack: string[] = [root.id];
    let total = 0;

    while (stack.length) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const node = byId.get(id);
      if (!node) continue;

      total += 1;
      if (result.length < MAX_FLOW_NODES) {
        result.push(node);
      }

      const children = byParent.get(id);
      if (children) {
        for (const ch of children) {
          stack.push(ch.id);
        }
      }
    }

    return { items: result, totalInSubtree: total };
  }, [selectedId, byId, items]);

  const flowTooLarge =
    totalInSubtree > 0 &&
    totalInSubtree > MAX_FLOW_NODES &&
    flowItems.length > 0;

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
    if (!confirm(`Вы действительно хотите удалить локацию "${row.name}"?`))
      return;
    const wasSelected = selectedId === row.id;
    await remove(row.id);
    if (wasSelected) setSelectedId(null);
  };

  if (!canViewGeoLocation) return <NoAccess />;

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                color: "primary.main",
                display: "flex",
                p: 1,
                borderRadius: 2,
                bgcolor: "primary.light",
                opacity: 0.8,
              }}
            >
              <FiMapPin size={24} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Гео-локации
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Управление странами, регионами, городами и районами в системе
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<FiPlus />}
            variant="contained"
            onClick={openCreateGeneral}
            sx={{ borderRadius: 2, px: 2.5 }}
          >
            Добавить локацию
          </Button>
          <Button
            startIcon={<FiDownload />}
            variant="outlined"
            onClick={() => setImportOpen(true)}
            sx={{ borderRadius: 2, px: 2.5 }}
          >
            Догрузить данные
          </Button>
          <Tooltip title="Обновить список">
            <IconButton
              onClick={reload}
              sx={{ border: "1px solid #e2e8f0", borderRadius: 2, p: 1 }}
            >
              <FiRefreshCw />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Split Master-Detail Layout */}
      <Grid container spacing={3}>
        {/* Left Pane (Master: Search, Breadcrumbs, Table) */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Stack spacing={2.5}>
            {/* Search & Filters */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                width="100%"
              >
                <TextField
                  size="small"
                  placeholder="Поиск по названию, коду, ISO2 или слагу…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color="#94a3b8" />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <Select
                  size="small"
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as LocationType | "")
                  }
                  sx={{ minWidth: 160, width: { xs: "100%", sm: "auto" } }}
                  displayEmpty
                >
                  {TYPES.map((t) => (
                    <MenuItem key={t.value || "ALL"} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Paper>

            {/* Breadcrumbs Navigation */}
            <Paper
              variant="outlined"
              sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: "#f8fafc" }}
            >
              <Breadcrumbs
                separator={<FiChevronRight size={14} color="#94a3b8" />}
                aria-label="breadcrumb"
              >
                <Link
                  underline="hover"
                  color={!selectedId ? "text.primary" : "inherit"}
                  onClick={() => setSelectedId(null)}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontWeight: !selectedId ? 700 : 500,
                  }}
                >
                  <FiHome size={15} />
                  Все локации
                </Link>
                {breadcrumbs.map((node, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const name = getLocalizedGeoName(node);
                  return (
                    <Link
                      key={node.id}
                      underline={isLast ? "none" : "hover"}
                      color={isLast ? "text.primary" : "inherit"}
                      onClick={() => !isLast && setSelectedId(node.id)}
                      sx={{
                        cursor: isLast ? "default" : "pointer",
                        fontWeight: isLast ? 700 : 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <FiFolder size={14} />
                      {name || node.code || node.type}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </Paper>

            {/* Interactive Hint */}
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                borderRadius: 3,
                py: 0.5,
                borderStyle: "dashed",
                bgcolor: "#f0fdfa",
                borderColor: "#ccfbf1",
                "& .MuiAlert-icon": { color: "#0d9488" },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                💡 <b>Подсказка:</b> дважды кликните на элемент в диаграмме
                дерева справа, чтобы быстро перейти вглубь или открыть форму
                редактирования.
              </Typography>
            </Alert>

            {/* Children List Table */}
            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#fafafa",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedId
                    ? `Дочерние локации для "${getLocalizedGeoName(selectedLocation!)}"`
                    : "Список корневых локаций"}
                </Typography>
                <Chip
                  size="small"
                  label={`Всего: ${rows.length}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Divider />
              <Box sx={{ overflowX: "auto" }}>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Название</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Тип</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Код</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ISO2</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Слаг</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Активен</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Действия
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        selected={row.id === selectedId}
                        onClick={() => setSelectedId(row.id)}
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell
                          sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                          {getLocalizedGeoName(row) || "Без названия"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={GEO_TYPE_RU[row.type] || row.type}
                            sx={{
                              bgcolor: `${nodeColor(row.type)}15`,
                              color: nodeColor(row.type),
                              fontWeight: 600,
                              border: `1px solid ${nodeColor(row.type)}30`,
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>
                        <TableCell>{row.code || "—"}</TableCell>
                        <TableCell>{row.iso2 || "—"}</TableCell>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: 12 }}
                        >
                          {row.slug || "—"}
                        </TableCell>
                        <TableCell>
                          {row.is_active === false ? (
                            <Chip
                              size="small"
                              label="Неактивен"
                              color="default"
                              variant="outlined"
                              sx={{ borderRadius: 1.5 }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="Активен"
                              color="success"
                              variant="outlined"
                              sx={{ borderRadius: 1.5, fontWeight: 600 }}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                onClick={() => openEditCity(row.id)}
                                sx={{
                                  color: "primary.main",
                                  hover: { bgcolor: "primary.light" },
                                }}
                              >
                                <FiEdit3 size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(row)}
                              >
                                <FiTrash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loading && rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography
                            align="center"
                            color="text.secondary"
                            sx={{ py: 6 }}
                          >
                            Локации не найдены
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography
                            align="center"
                            color="text.secondary"
                            sx={{ py: 6 }}
                          >
                            Загрузка…
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {error && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography
                            align="center"
                            color="error"
                            sx={{ py: 6 }}
                          >
                            {error}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Pane (Detail Pane: Details Card, Hierarchy Tree) */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { md: "sticky" }, top: 24 }}>
            {/* Details Card */}
            {selectedLocation ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: nodeColor(selectedLocation.type),
                  }}
                />

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${nodeColor(selectedLocation.type)}12`,
                        color: nodeColor(selectedLocation.type),
                        display: "flex",
                      }}
                    >
                      <LocationIcon type={selectedLocation.type} size={22} />
                    </Box>
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography variant="subtitle1" fontWeight={800} noWrap>
                        {getLocalizedGeoName(selectedLocation) ||
                          "Без названия"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                      >
                        ID: {selectedLocation.id}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack spacing={1.5}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Тип локации:
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          GEO_TYPE_RU[selectedLocation.type] ||
                          selectedLocation.type
                        }
                        sx={{
                          bgcolor: `${nodeColor(selectedLocation.type)}12`,
                          color: nodeColor(selectedLocation.type),
                          fontWeight: 600,
                          border: `1px solid ${nodeColor(selectedLocation.type)}30`,
                        }}
                      />
                    </Box>

                    {selectedLocation.parent_id && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Родительская локация:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            textDecoration: "underline",
                          }}
                          onClick={() =>
                            setSelectedId(selectedLocation.parent_id!)
                          }
                        >
                          {byId.get(selectedLocation.parent_id)?.name ??
                            "Перейти к родителю"}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Код локации:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedLocation.code || "—"}
                      </Typography>
                    </Box>

                    {selectedLocation.type === "COUNTRY" && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Код ISO2:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ fontFamily: "monospace" }}
                        >
                          {selectedLocation.iso2 || "—"}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Слаг в URL:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          wordBreak: "break-all",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {selectedLocation.slug || "—"}
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Статус:
                      </Typography>
                      {selectedLocation.is_active === false ? (
                        <Chip
                          size="small"
                          label="Неактивен"
                          color="default"
                          variant="outlined"
                          sx={{ borderRadius: 1.5 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Активен"
                          color="success"
                          variant="outlined"
                          sx={{ borderRadius: 1.5, fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    {selectedLocation.order !== undefined && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Сортировка (order):
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedLocation.order}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={0.75}
                      sx={{
                        p: 1.5,
                        bgcolor: "#f8fafc",
                        borderRadius: 3,
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={800}
                        sx={{ letterSpacing: 0.5 }}
                      >
                        ЛОКАЛИЗАЦИЯ ИМЕНИ:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.primary" }}
                      >
                        🇬🇧 Английский: <b>{selectedLocation.name}</b>
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.primary" }}
                      >
                        🇷🇺 Русский: <b>{selectedLocation.name_ru || "—"}</b>
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.primary" }}
                      >
                        🇺🇿 Узбекский: <b>{selectedLocation.name_uz || "—"}</b>
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<FiEdit3 />}
                      onClick={() => openEditCity(selectedLocation.id)}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      Изменить
                    </Button>
                    {(selectedLocation.type === "COUNTRY" ||
                      selectedLocation.type === "REGION") && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<FiPlus />}
                        onClick={() => openCreateCity(selectedLocation.id)}
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        Добавить
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<FiTrash2 />}
                      onClick={() => handleDelete(selectedLocation)}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      Удалить
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: "center",
                  bgcolor: "#f8fafc",
                  borderStyle: "dashed",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.secondary"
                  gutterBottom
                >
                  Локация не выбрана
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Выберите любую локацию из списка в таблице слева, чтобы
                  посмотреть её детальную информацию, переводы и получить
                  быстрый доступ к действиям.
                </Typography>
              </Paper>
            )}

            {/* Visual Hierarchy Tree Diagram */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ pl: 0.5 }}>
                Дерево подчиненности локаций
              </Typography>
              {!selectedId ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                    borderStyle: "dashed",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Выберите локацию в таблице слева, чтобы сгенерировать
                    интерактивную схему подчинения элементов (поддерево).
                  </Typography>
                </Paper>
              ) : flowItems.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                    borderStyle: "dashed",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Локация не имеет дочерних элементов (например, городов или
                    районов) для отрисовки дерева.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={1}>
                  {flowTooLarge && (
                    <Alert
                      severity="warning"
                      variant="outlined"
                      sx={{ py: 0.5, borderRadius: 3 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Вложено {totalInSubtree} узлов. На схеме показаны первые{" "}
                        {MAX_FLOW_NODES}.
                      </Typography>
                    </Alert>
                  )}
                  <GeoTreeFlow
                    items={flowItems}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                    onAddCity={openCreateCity}
                    onEditCity={openEditCity}
                  />
                </Stack>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog создать/редактировать */}
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
            ? (editing ?? undefined)
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

      {/* Диалог импорта */}
      <GeoImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        allLocations={items}
        onImported={reload}
      />
    </Stack>
  );
}
