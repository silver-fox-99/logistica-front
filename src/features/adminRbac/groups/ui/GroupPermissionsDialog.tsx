import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  MdExpandMore,
  MdOutlineSelectAll,
  MdOutlineRemoveDone,
  MdSearch,
} from "react-icons/md";

import type { AdminGroup } from "@/entities/adminGroup/model/types";
import type { AdminPermission } from "@/entities/adminPermission/model/types";
import { adminRbacApi } from "@/shared/api/adminRbac.api";

type Props = {
  open: boolean;
  group: AdminGroup | null;
  allPermissions: AdminPermission[];
  onClose: () => void;
  onSaved?: () => void;
};

type PermissionGroup = {
  target: string;
  items: AdminPermission[];
};

const PermissionRow = memo(function PermissionRow({
  perm,
  checked,
  onToggle,
}: {
  perm: AdminPermission;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  const handle = useCallback(() => onToggle(perm.id), [onToggle, perm.id]);

  return (
    <FormControlLabel
      sx={{
        m: 0,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
        alignItems: "center",
        display: "flex",
      }}
      control={<Checkbox checked={checked} onChange={handle} />}
      label={
        <Stack>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {perm.code}
          </Typography>
          {perm.description ? (
            <Typography variant="caption" color="text.secondary">
              {perm.description}
            </Typography>
          ) : null}
        </Stack>
      }
    />
  );
});

export const GroupPermissionsDialog = memo(function GroupPermissionsDialog({
  open,
  group,
  allPermissions,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initial, setInitial] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const groupId = group?.id ?? null;

  useEffect(() => {
    if (!open || !groupId) return;

    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const current = await adminRbacApi.getGroupPermissions(groupId);
        const ids = current.map((p) => p.id);
        if (!alive) return;
        setInitial(ids);
        setSelected(new Set(ids));
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ??
            e?.message ??
            "Не удалось загрузить права группы",
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, groupId]);

  const filteredPermissions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allPermissions;
    return allPermissions.filter((p) => {
      const code = p.code.toLowerCase();
      const desc = (p.description ?? "").toLowerCase();
      return code.includes(s) || desc.includes(s);
    });
  }, [allPermissions, q]);

  const groups: PermissionGroup[] = useMemo(() => {
    const map = new Map<string, AdminPermission[]>();

    for (const p of filteredPermissions) {
      const [target] = p.code.split(":");
      const key = target || "OTHER";
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }

    const out: PermissionGroup[] = Array.from(map.entries()).map(
      ([target, items]) => ({
        target,
        items: items.sort((a, b) => a.code.localeCompare(b.code)),
      }),
    );

    out.sort((a, b) => a.target.localeCompare(b.target));
    return out;
  }, [filteredPermissions]);

  const isDirty = useMemo(() => {
    if (initial.length !== selected.size) return true;
    for (const id of initial) if (!selected.has(id)) return true;
    return false;
  }, [initial, selected]);

  const selectedCount = selected.size;

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      filteredPermissions.forEach((p) => next.add(p.id));
      return next;
    });
  }, [filteredPermissions]);

  const clearAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectGroupAll = useCallback((items: AdminPermission[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((p) => next.add(p.id));
      return next;
    });
  }, []);

  const clearGroupAll = useCallback((items: AdminPermission[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((p) => next.delete(p.id));
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!groupId) return;
    setSaving(true);
    setError(null);
    try {
      await adminRbacApi.setGroupPermissions(groupId, Array.from(selected));
      setInitial(Array.from(selected));
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.message ??
          "Не удалось сохранить права",
      );
    } finally {
      setSaving(false);
    }
  }, [groupId, selected, onSaved, onClose]);

  const defaultExpanded = useMemo(() => q.trim().length > 0, [q]);

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Stack>
            <Typography variant="h6">Права группы</Typography>
            <Typography variant="body2" color="text.secondary">
              Группа: <b>{group?.name ?? "-"}</b>
            </Typography>
          </Stack>

          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <Chip size="small" label={`Выбрано: ${selectedCount}`} />
            {group?.is_root ? (
              <Chip size="small" color="warning" label="ROOT" />
            ) : null}
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack gap={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <TextField
              label="Поиск"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mr: 1,
                      color: "text.secondary",
                    }}
                  >
                    <MdSearch />
                  </Box>
                ),
              }}
            />

            <Button
              onClick={selectAllFiltered}
              disabled={loading || saving || filteredPermissions.length === 0}
              startIcon={<MdOutlineSelectAll />}
              variant="outlined"
              size="small"
            >
              Выбрать найденные
            </Button>

            <Button
              onClick={clearAll}
              disabled={loading || saving || selected.size === 0}
              startIcon={<MdOutlineRemoveDone />}
              variant="outlined"
              size="small"
            >
              Снять все
            </Button>
          </Stack>

          <Divider />

          <Box sx={{ maxHeight: 520, overflow: "auto", pr: 1 }}>
            {loading ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                Загрузка...
              </Typography>
            ) : groups.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                Ничего не найдено
              </Typography>
            ) : (
              <Stack gap={1}>
                {groups.map((g) => {
                  const total = g.items.length;
                  const selectedInGroup = g.items.reduce(
                    (acc, p) => acc + (selected.has(p.id) ? 1 : 0),
                    0,
                  );
                  const allSelected = total > 0 && selectedInGroup === total;

                  return (
                    <Accordion
                      key={g.target}
                      defaultExpanded={defaultExpanded}
                      disableGutters
                    >
                      <AccordionSummary expandIcon={<MdExpandMore />}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ width: "100%" }}
                        >
                          <Stack>
                            <Typography sx={{ fontWeight: 600 }}>
                              {g.target}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Выбрано {selectedInGroup} из {total}
                            </Typography>
                          </Stack>

                          <Stack direction="row" gap={1} alignItems="center">
                            <Button
                              size="small"
                              variant="text"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectGroupAll(g.items);
                              }}
                              disabled={loading || saving || allSelected}
                            >
                              Выбрать все
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearGroupAll(g.items);
                              }}
                              disabled={
                                loading || saving || selectedInGroup === 0
                              }
                            >
                              Снять
                            </Button>
                          </Stack>
                        </Stack>
                      </AccordionSummary>

                      <AccordionDetails sx={{ pt: 0.5 }}>
                        <Stack gap={0.5}>
                          {g.items.map((p) => (
                            <PermissionRow
                              key={p.id}
                              perm={p}
                              checked={selected.has(p.id)}
                              onToggle={toggle}
                            />
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || saving || !isDirty}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
});
