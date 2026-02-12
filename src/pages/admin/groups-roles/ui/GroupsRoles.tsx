import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import { MdAdminPanelSettings, MdGroups, MdKey, MdAdd } from "react-icons/md";

import { runLimited } from "@/entities/adminRbac/model/runLimited";

import type { AdminGroup } from "@/entities/adminGroup/model/types";
import type { AdminPermission } from "@/entities/adminPermission/model/types";
import type { AdminPermissionAction, AdminPermissionTarget } from "@/entities/adminPermission/model/types";

import { GroupsTab } from "@/features/adminRbac/groups/ui/GroupsTab";

import { CreateGroupDialog } from "@/features/adminRbac/groups/ui/CreateGroupDialog";
import { CreatePermissionsBatchDialog } from "@/features/adminRbac/permissions/ui/CreatePermissionsBatchDialog";
import { adminRbacApi } from "@/shared/api/adminRbac.api.ts";
import { PermissionsTab } from "@/features/adminRbac/permissions/ui/PermissionsTab";
import { GroupPermissionsDialog } from "@/features/adminRbac/groups/ui/GroupPermissionsDialog.tsx";
import {useAdminAccessStore} from "@/entities/adminAccess/model/adminAccess.store.ts";
import {viewCode} from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

type TabKey = "groups" | "permissions";

export default function GroupsRolesPage() {
    const [tab, setTab] = useState<TabKey>("groups");

    const [groups, setGroups] = useState<AdminGroup[]>([]);
    const [permissions, setPermissions] = useState<AdminPermission[]>([]);
    const canViewGoups = useAdminAccessStore((s) => s.hasAll([viewCode('ADMIN_GROUPS' as any), viewCode('ADMIN_PERMISSIONS' as any)]));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [access, setAccess] = useState<{ isRoot: boolean; rank: number } | null>(null);

    const [openCreateGroup, setOpenCreateGroup] = useState(false);
    const [openCreatePerms, setOpenCreatePerms] = useState(false);

    const [openGroupPerms, setOpenGroupPerms] = useState(false);
    const [activeGroup, setActiveGroup] = useState<AdminGroup | null>(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [g, p, a] = await Promise.all([
                adminRbacApi.getGroups(),
                adminRbacApi.getPermissions(),
                adminRbacApi.getAccessMe().catch(() => null),
            ]);
            setGroups(g);
            setPermissions(p);
            setAccess(a);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить данные");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const sortedGroups = useMemo(() => {
        return [...groups].sort((a, b) => b.rank - a.rank);
    }, [groups]);

    const sortedPermissions = useMemo(() => {
        return [...permissions].sort((a, b) => a.code.localeCompare(b.code));
    }, [permissions]);

    const handleDeleteGroup = useCallback(async (id: string) => {
        try {
            await adminRbacApi.deleteGroup(id);
            setGroups((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Не удалось удалить группу");
        }
    }, []);

    const handleCreateGroup = useCallback(
        async (dto: { code: string; name: string; description?: string | null; rank?: number; is_root?: boolean }) => {
            try {
                const created = await adminRbacApi.createGroup(dto);
                setGroups((prev) => [created, ...prev]);
            } catch (e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? "Не удалось создать группу");
                throw e;
            }
        },
        []
    );

    const handleDeletePermission = useCallback(async (id: string) => {
        try {
            await adminRbacApi.deletePermission(id);
            setPermissions((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Не удалось удалить право");
        }
    }, []);

    const handleCreatePermissionsBatch = useCallback(
        async (items: Array<{ target: AdminPermissionTarget; action: AdminPermissionAction; description?: string | null }>) => {
            setError(null);

            const tasks = items.map((x) => () => adminRbacApi.createPermission(x));
            const results = await runLimited(tasks, 5);

            const created: AdminPermission[] = [];
            const failed: Array<{ code: string; message: string }> = [];

            results.forEach((r, idx) => {
                const code = `${items[idx].target}:${items[idx].action}`;
                if (r.status === "fulfilled") created.push(r.value);
                else failed.push({ code, message: (r.reason as any)?.response?.data?.message ?? (r.reason as any)?.message ?? "Ошибка" });
            });

            if (created.length) {
                setPermissions((prev) => [...created, ...prev]);
            }

            if (failed.length) {
                setError(`Создано: ${created.length}. Ошибок: ${failed.length}. Первая ошибка: ${failed[0].code} – ${failed[0].message}`);
            }
        },
        []
    );

    const openPerms = useCallback((g: AdminGroup) => {
        setActiveGroup(g);
        setOpenGroupPerms(true);
    }, []);

    const allowRootToggle = access?.isRoot === true;

    if (!canViewGoups) return <NoAccess />

    return (
        <Stack gap={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={1.25}>
                    <MdAdminPanelSettings size={22} />
                    <Typography variant="h5">Роли и группы</Typography>
                </Stack>

                <Stack direction="row" gap={1}>
                    <Button variant="outlined" onClick={loadAll} disabled={loading}>
                        Обновить
                    </Button>

                    {tab === "groups" ? (
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setOpenCreateGroup(true)}>
                            Новая группа
                        </Button>
                    ) : (
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setOpenCreatePerms(true)}>
                            Новые права (пакетно)
                        </Button>
                    )}
                </Stack>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab value="groups" label="Группы" icon={<MdGroups />} iconPosition="start" />
                    <Tab value="permissions" label="Права" icon={<MdKey />} iconPosition="start" />
                </Tabs>

                {loading ? (
                    <Stack alignItems="center" sx={{ py: 6 }}>
                        <CircularProgress />
                    </Stack>
                ) : tab === "groups" ? (
                    <GroupsTab groups={sortedGroups} onEditPermissions={openPerms} onDelete={handleDeleteGroup} />
                ) : (
                    <PermissionsTab permissions={sortedPermissions} onDelete={handleDeletePermission} />
                )}
            </Box>

            <CreateGroupDialog
                open={openCreateGroup}
                onClose={() => setOpenCreateGroup(false)}
                onCreate={handleCreateGroup}
                allowRootToggle={allowRootToggle}
            />

            <CreatePermissionsBatchDialog
                open={openCreatePerms}
                onClose={() => setOpenCreatePerms(false)}
                onCreateBatch={handleCreatePermissionsBatch}
            />

            <GroupPermissionsDialog
                open={openGroupPerms}
                group={activeGroup}
                allPermissions={sortedPermissions}
                onClose={() => setOpenGroupPerms(false)}
            />
        </Stack>
    );
}
