import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    Stack,
    Switch,
    FormControlLabel,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Chip,
    Typography,
    Divider,
    CircularProgress,
} from "@mui/material";
import { FiShield, FiSave, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";

import type { AdminUser } from "@/shared/api/adminUsersApi";
import type { AdminGroup } from "@/entities/adminGroup/model/types";
import { adminUserApi } from "@/shared/api/adminUserApi";
import { adminRbacApi } from "@/shared/api/adminRbac.api";

type Props = {
    user: AdminUser;
    userGroups: AdminGroup[];
    onUserUpdated: (u: AdminUser) => void;
    onGroupsUpdated: (g: AdminGroup[]) => void;
};

function sameIdSet(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    const s = new Set(a);
    for (const x of b) if (!s.has(x)) return false;
    return true;
}

export const AdminToggle = memo(function AdminToggle({
                                                         user,
                                                         userGroups,
                                                         onUserUpdated,
                                                         onGroupsUpdated,
                                                     }: Props) {
    const [enabled, setEnabled] = useState<boolean>(user.is_admin);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(userGroups.map((g) => g.id));

    const [allGroups, setAllGroups] = useState<AdminGroup[]>([]);
    const [access, setAccess] = useState<{ isRoot: boolean; rank: number } | null>(null);

    const [busy, setBusy] = useState(false);
    const [loadingMeta, setLoadingMeta] = useState(false);

    useEffect(() => {
        setEnabled(user.is_admin);
    }, [user.id, user.is_admin]);

    useEffect(() => {
        setSelectedGroupIds(userGroups.map((g) => g.id));
    }, [user.id, userGroups]);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoadingMeta(true);
            try {
                const [g, a] = await Promise.all([
                    adminRbacApi.getGroups(),
                    adminRbacApi.getAccessMe().catch(() => null),
                ]);
                if (!alive) return;
                setAllGroups(g);
                setAccess(a);
            } finally {
                if (alive) setLoadingMeta(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const groupsOptions = useMemo(() => {
        const isRoot = access?.isRoot === true;
        const filtered = isRoot ? allGroups : allGroups.filter((g) => !g.is_root);
        return [...filtered].sort((a, b) => b.rank - a.rank);
    }, [allGroups, access?.isRoot]);

    const initialGroupIds = useMemo(() => userGroups.map((g) => g.id), [userGroups]);

    const dirty = useMemo(() => {
        const adminDirty = enabled !== user.is_admin;
        const groupsDirty = !sameIdSet(selectedGroupIds, initialGroupIds);
        return adminDirty || groupsDirty;
    }, [enabled, user.is_admin, selectedGroupIds, initialGroupIds]);

    const submit = useCallback(async () => {
        if (busy) return;

        if (enabled && selectedGroupIds.length === 0) {
            toast.error("Выберите хотя бы одну группу для администратора");
            return;
        }

        setBusy(true);
        try {
            await adminRbacApi.setUserGroups(user.id, enabled ? selectedGroupIds : []);

            const res = await adminUserApi.get(user.id);
            onUserUpdated(res.data.user);
            onGroupsUpdated(res.data.groups ?? []);

            toast.success("Доступ администратора обновлён");
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка при обновлении доступа";
            toast.error(message);
        } finally {
            setBusy(false);
        }
    }, [busy, enabled, selectedGroupIds, user.id, onUserUpdated, onGroupsUpdated]);

    const handleToggle = useCallback((next: boolean) => {
        setEnabled(next);
        if (!next) {
            setSelectedGroupIds([]);
        }
    }, []);

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                        <FormControlLabel
                            control={<Switch checked={enabled} onChange={(_, c) => handleToggle(c)} />}
                            label={
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <FiShield /> Доступ администратора
                                </span>
                            }
                        />

                        <Button
                            onClick={submit}
                            disabled={!dirty || busy}
                            variant="contained"
                            startIcon={busy ? <FiLoader /> : <FiSave />}
                        >
                            {busy ? "Сохранение…" : "Сохранить"}
                        </Button>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        Права администратора определяются назначенными группами.
                    </Typography>

                    <Divider />

                    <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">Группы администратора</Typography>
                            {loadingMeta && <CircularProgress size={16} />}
                        </Stack>

                        <FormControl fullWidth disabled={!enabled || busy || loadingMeta}>
                            <InputLabel>Группы</InputLabel>
                            <Select
                                multiple
                                label="Группы"
                                value={selectedGroupIds}
                                onChange={(e) => setSelectedGroupIds(e.target.value as string[])}
                                renderValue={(selected) => (
                                    <Stack direction="row" gap={1} flexWrap="wrap">
                                        {(selected as string[]).map((id) => {
                                            const g = groupsOptions.find((x) => x.id === id);
                                            const label = g ? `${g.name} (${g.code})` : id;
                                            return <Chip key={id} label={label} size="small" />;
                                        })}
                                    </Stack>
                                )}
                            >
                                {groupsOptions.map((g) => (
                                    <MenuItem key={g.id} value={g.id}>
                                        <Checkbox checked={selectedGroupIds.includes(g.id)} />
                                        <ListItemText
                                            primary={`${g.name} (${g.code})`}
                                            secondary={`Ранг: ${g.rank}${g.is_root ? " · ROOT" : ""}`}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {!enabled && (
                            <Typography variant="caption" color="text.secondary">
                                Включите доступ администратора, чтобы выбрать группы.
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
});
