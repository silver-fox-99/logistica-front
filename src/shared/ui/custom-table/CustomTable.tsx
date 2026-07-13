import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

import type { CustomTableColumn, SortDir, SortState } from "./types";

type UiText = {
  searchPlaceholder: string;
  rowsPerPageLabel: string;
  pageLabel: (page: number, pages: number) => string;
  loadingText: string;
  emptyText: string;
};

type Props<T> = {
  /** Used to persist column widths in localStorage */
  tableId?: string;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  total?: number;

  columns: CustomTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => React.Key;

  loading?: boolean;
  error?: string | null;

  /** 1-based page index */
  page: number;
  pages: number;
  limit: number;
  limitOptions?: number[];

  /** Toolbar */
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchDebounceMs?: number;
  toolbarRight?: React.ReactNode;

  /** Sort (server-side friendly) */
  sort?: SortState | null;
  onSortChange?: (next: SortState) => void;

  /** Row click */
  onRowClick?: (row: T) => void;

  /** Layout */
  dense?: boolean;
  stickyHeader?: boolean;
  showPagination?: boolean;
  enableColumnResize?: boolean;

  /** UI strings */
  uiText?: Partial<UiText>;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function storageKey(tableId: string) {
  return `customTable:${tableId}:widths`;
}

function safeParseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function CustomTable<T>(props: Props<T>) {
  const {
    tableId,
    title,
    subtitle,
    total,

    columns,
    rows,
    rowKey,

    loading = false,
    error = null,

    page,
    pages,
    limit,
    limitOptions = [10, 20, 50, 100],

    showSearch = true,
    searchValue = "",
    onSearchChange,
    searchDebounceMs = 300,
    toolbarRight,

    sort,
    onSortChange,

    onRowClick,

    dense = true,
    stickyHeader = false,
    showPagination = true,
    enableColumnResize = true,

    uiText,
  } = props;

  const text: UiText = useMemo(
    () => ({
      searchPlaceholder: "Search…",
      rowsPerPageLabel: "Rows per page",
      pageLabel: (p, ps) => `Page ${p} of ${ps}`,
      loadingText: "Loading…",
      emptyText: "No records found.",
      ...(uiText ?? {}),
    }),
    [uiText],
  );

  // -------- debounced search (controlled by parent) --------
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (!onSearchChange) return;
    const t = window.setTimeout(
      () => onSearchChange(localSearch),
      searchDebounceMs,
    );
    return () => window.clearTimeout(t);
  }, [localSearch, onSearchChange, searchDebounceMs]);

  // -------- column widths (resizable + persistent) --------
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    if (!tableId) return {};
    const saved = safeParseJson<Record<string, number>>(
      localStorage.getItem(storageKey(tableId)),
    );
    return saved ?? {};
  });

  useEffect(() => {
    if (!tableId) return;
    localStorage.setItem(storageKey(tableId), JSON.stringify(colWidths));
  }, [colWidths, tableId]);

  // Keep refs to header cells to calculate width when needed
  const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const resizingRef = useRef<{
    colId: string;
    startX: number;
    startWidth: number;
    min: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const r = resizingRef.current;
      if (!r) return;
      const dx = e.clientX - r.startX;
      const next = clamp(r.startWidth + dx, r.min, r.max);
      setColWidths((prev) => ({ ...prev, [r.colId]: next }));
    }

    function onUp() {
      resizingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const getColWidth = (c: CustomTableColumn<T>) => colWidths[c.id] ?? c.width;

  const startResize = (col: CustomTableColumn<T>) => (e: React.MouseEvent) => {
    if (!enableColumnResize) return;
    if (!tableId) return;

    e.preventDefault();
    e.stopPropagation();

    const cell = headerRefs.current[col.id];
    const measured = cell?.getBoundingClientRect().width ?? col.width ?? 160;

    const min = col.minWidth ?? 80;
    const max = col.maxWidth ?? 800;

    resizingRef.current = {
      colId: col.id,
      startX: e.clientX,
      startWidth: measured,
      min,
      max,
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // -------- sort handling --------
  const sortFieldOf = (c: CustomTableColumn<T>) => c.sortField ?? c.id;

  const handleSortClick = (c: CustomTableColumn<T>) => () => {
    if (!c.sortable || !onSortChange) return;

    const field = sortFieldOf(c);
    const isSame = sort?.field === field;

    let nextDir: SortDir;
    if (isSame) {
      nextDir = sort?.dir === "asc" ? "desc" : "asc";
    } else {
      nextDir = c.defaultSortDir ?? "asc";
    }

    onSortChange({ field, dir: nextDir });
  };

  const renderSortIcon = (c: CustomTableColumn<T>) => {
    if (!c.sortable) return null;
    const field = sortFieldOf(c);
    if (sort?.field !== field) return null;
    return sort.dir === "asc" ? (
      <Box
        component="span"
        sx={{ ml: 0.75, display: "inline-flex", verticalAlign: "middle" }}
      >
        <FiChevronUp />
      </Box>
    ) : (
      <Box
        component="span"
        sx={{ ml: 0.75, display: "inline-flex", verticalAlign: "middle" }}
      >
        <FiChevronDown />
      </Box>
    );
  };

  const emptyStateText = error ? error : text.emptyText;

  return (
    <Stack spacing={2}>
      {/* Header + toolbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0.25}>
          {title ? (
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
          ) : null}

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            {typeof total === "number" ? (
              <Typography variant="body2" color="text.secondary">
                {total.toLocaleString()} item{total === 1 ? "" : "s"}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          {showSearch ? (
            <TextField
              size="small"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={text.searchPlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />
          ) : null}

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {text.rowsPerPageLabel}
            </Typography>
            <Select
              size="small"
              value={String(limit)}
              onChange={(e) => props.onLimitChange?.(Number(e.target.value))}
              sx={{ minWidth: 90 }}
            >
              {limitOptions.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          {toolbarRight}
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Divider />
        <TableContainer sx={{ maxWidth: "100%" }}>
          <Table
            size={dense ? "small" : "medium"}
            stickyHeader={stickyHeader}
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-head": {
                fontWeight: 600,
                bgcolor: "background.default",
                borderBottomColor: "divider",
                userSelect: "none",
              },
              "& .MuiTableRow-hover:hover": {
                cursor: onRowClick ? "pointer" : "default",
              },
            }}
          >
            <TableHead>
              <TableRow>
                {columns.map((c) => {
                  const w = getColWidth(c);
                  const isSortable = Boolean(c.sortable && onSortChange);

                  return (
                    <TableCell
                      key={c.id}
                      ref={(el: HTMLTableCellElement | null) => {
                        headerRefs.current[c.id] = el;
                      }}
                      align={c.align}
                      onClick={isSortable ? handleSortClick(c) : undefined}
                      sx={{
                        position: "relative",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        ...(typeof w === "number" ? { width: `${w}px` } : null),
                        ...(typeof c.minWidth === "number"
                          ? { minWidth: `${c.minWidth}px` }
                          : null),
                        ...(typeof c.maxWidth === "number"
                          ? { maxWidth: `${c.maxWidth}px` }
                          : null),
                        cursor: isSortable ? "pointer" : "default",
                        pr: enableColumnResize && tableId ? 2.5 : 2,
                        ...(c.headerSx ?? {}),
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {c.header}
                        {renderSortIcon(c)}
                      </Box>

                      {/* resize handle */}
                      {enableColumnResize && tableId ? (
                        <Box
                          onMouseDown={startResize(c)}
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: 10,
                            height: "100%",
                            cursor: "col-resize",
                            zIndex: 2,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        />
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((c) => {
                    const w = getColWidth(c);

                    return (
                      <TableCell
                        key={c.id}
                        align={c.align}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: c.nowrap ? "nowrap" : "normal",
                          ...(typeof w === "number"
                            ? { width: `${w}px` }
                            : null),
                          ...(typeof c.minWidth === "number"
                            ? { minWidth: `${c.minWidth}px` }
                            : null),
                          ...(typeof c.maxWidth === "number"
                            ? { maxWidth: `${c.maxWidth}px` }
                            : null),
                          ...(c.cellSx ?? {}),
                        }}
                      >
                        {c.cell(row)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ py: 4 }}
                    >
                      {emptyStateText}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}

              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ py: 4 }}
                    >
                      {text.loadingText}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {showPagination ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="caption" color="text.secondary">
            {text.pageLabel(page, pages)}
          </Typography>

          <Pagination
            count={Math.max(1, pages)}
            page={Math.max(1, page)}
            onChange={(_, p) => props.onPageChange?.(p)}
            siblingCount={1}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
