import Grid from "@mui/material/Grid";
import {
  Alert,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { FiDatabase, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { useLookups } from "@/features/admin/lookups/model/useLookups";
import { GroupList } from "@/features/admin/lookups/ui/GroupList";
import { ItemTable } from "@/features/admin/lookups/ui/ItemTable";
import { GroupDialog } from "@/features/admin/lookups/ui/GroupDialog";
import { ItemDialog } from "@/features/admin/lookups/ui/ItemDialog";
import {
  lookupsApi,
  type LookupGroup,
  type LookupItem,
} from "@/shared/api/lookupsApi";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store.ts";
import { viewCode } from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

export default function AdminLookupsPage() {
  const {
    groups,
    current,
    setCurrent,
    items,
    setItems,
    loading,
    error,
    reloadGroups,
    reloadItems,
  } = useLookups();

  const [openGroup, setOpenGroup] = useState<null | {
    mode: "create" | "edit";
    group?: LookupGroup;
  }>(null);
  const [openItem, setOpenItem] = useState<null | {
    mode: "create" | "edit";
    item?: LookupItem;
  }>(null);
  const canViewLookups = useAdminAccessStore((s) =>
    s.hasPermission(viewCode("LOOKUPS" as any)),
  );
  const headerRight = useMemo(
    () => (
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<FiPlus />}
          onClick={() => setOpenGroup({ mode: "create" })}
        >
          Новая группа
        </Button>
      </Stack>
    ),
    [],
  );

  // reorder helpers
  const moveItem = async (id: string, dir: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const otherIdx = dir === "up" ? idx - 1 : idx + 1;
    if (otherIdx < 0 || otherIdx >= items.length) return;

    const copy = [...items];
    const a = copy[idx],
      b = copy[otherIdx];
    // swap sort_order locally
    const tmp = a.sort_order;
    a.sort_order = b.sort_order;
    b.sort_order = tmp;
    // swap rows
    [copy[idx], copy[otherIdx]] = [copy[otherIdx], copy[idx]];
    setItems(copy);
    if (current)
      await lookupsApi.reorderItems(
        current.code,
        copy.map((it) => ({ id: it.id, sort_order: it.sort_order })),
      );
  };

  const onQuickFilter = (text: string) => {
    const t = text.trim().toLowerCase();
    if (!t) {
      void reloadItems();
      return;
    }
    const filtered = items.filter(
      (i) =>
        i.label.toLowerCase().includes(t) || i.slug.toLowerCase().includes(t),
    );
    setItems(filtered);
  };

  useEffect(() => {
    if (current) void reloadItems();
  }, [current]); // ensure reload when current changes

  if (loading)
    return (
      <Container>
        <Typography color="text.secondary">Загрузка…</Typography>
      </Container>
    );
  if (error)
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!canViewLookups) return <NoAccess />;
  return (
    <Container disableGutters>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FiDatabase />
            <Typography variant="h5" fontWeight={600}>
              Справочник
            </Typography>
            <Chip size="small" label={groups.length} />
            {current && (
              <Chip size="small" color="primary" label={current.title} />
            )}
          </Stack>
          {headerRight}
        </Stack>

        <Grid container spacing={2}>
          {/* Left: groups */}
          <Grid size={{ xs: 12, md: 4 }}>
            <GroupList
              groups={groups}
              currentId={current?.id}
              onSelect={(g) => setCurrent(g)}
              onCreate={() => setOpenGroup({ mode: "create" })}
              onEdit={(g) => setOpenGroup({ mode: "edit", group: g })}
              onDelete={async (g) => {
                if (
                  !confirm(
                    `Удалить группу "${g.title}"? Элементы будут удалены тоже.`,
                  )
                )
                  return;
                try {
                  await lookupsApi.deleteGroup(g.id);
                  toast.success("Группа удалена");
                  await reloadGroups();
                  if (current?.id === g.id) setCurrent(null);
                } catch (error: any) {
                  const message =
                    error?.response?.data?.message ||
                    "Ошибка при удалении группы";
                  toast.error(message);
                }
              }}
            />
          </Grid>

          {/* Right: items of selected group */}
          <Grid size={{ xs: 12, md: 8 }}>
            <ItemTable
              groupTitle={current?.title}
              items={items}
              onCreate={() => setOpenItem({ mode: "create" })}
              onEdit={(it) => setOpenItem({ mode: "edit", item: it })}
              onDelete={async (it) => {
                if (!current) return;
                if (!confirm(`Удалить элемент "${it.label}"?`)) return;
                try {
                  await lookupsApi.deleteItem(current.code, it.id);
                  toast.success("Элемент удален");
                  await reloadItems();
                } catch (error: any) {
                  const message =
                    error?.response?.data?.message ||
                    "Ошибка при удалении элемента";
                  toast.error(message);
                }
              }}
              onMove={moveItem}
              onReload={() => reloadItems()}
              onQuickFilter={onQuickFilter}
            />
          </Grid>
        </Grid>
      </Stack>

      {/* Group dialog */}
      {openGroup && (
        <GroupDialog
          open={!!openGroup}
          onClose={() => setOpenGroup(null)}
          initial={openGroup.mode === "edit" ? openGroup.group : undefined}
          onSubmit={async (v) => {
            try {
              if (openGroup.mode === "create") {
                await lookupsApi.createGroup(v);
                toast.success("Группа создана");
              } else if (openGroup.mode === "edit" && openGroup.group) {
                await lookupsApi.updateGroup(openGroup.group.id, {
                  title: v.title,
                  description: v.description ?? null,
                });
                toast.success("Группа обновлена");
              }
              await reloadGroups();
            } catch (error: any) {
              const message =
                error?.response?.data?.message ||
                "Ошибка при сохранении группы";
              toast.error(message);
              throw error;
            }
          }}
        />
      )}

      {/* Item dialog */}
      {openItem && current && (
        <ItemDialog
          open={!!openItem}
          onClose={() => setOpenItem(null)}
          initial={openItem.mode === "edit" ? openItem.item : undefined}
          onSubmit={async (v) => {
            try {
              if (openItem.mode === "create") {
                await lookupsApi.createItem(current.code, v);
                toast.success("Элемент создан");
              } else if (openItem.mode === "edit" && openItem.item) {
                const { slug, ...rest } = v;
                await lookupsApi.updateItem(
                  current.code,
                  openItem.item.id,
                  rest,
                );
                toast.success("Элемент обновлен");
              }
              await reloadItems();
            } catch (error: any) {
              const message =
                error?.response?.data?.message ||
                "Ошибка при сохранении элемента";
              toast.error(message);
              throw error;
            }
          }}
        />
      )}
    </Container>
  );
}
