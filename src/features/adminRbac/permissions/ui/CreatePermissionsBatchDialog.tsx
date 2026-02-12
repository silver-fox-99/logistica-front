import { memo, useCallback, useMemo, useState } from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Chip,
} from "@mui/material";
import { AdminPermissionAction, AdminPermissionTarget } from "@/entities/adminPermission/model/types";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreateBatch: (items: Array<{ target: AdminPermissionTarget; action: AdminPermissionAction; description?: string | null }>) => Promise<void>;
};

const ALL_TARGETS = Object.values(AdminPermissionTarget);
const ALL_ACTIONS = Object.values(AdminPermissionAction);

export const CreatePermissionsBatchDialog = memo(function CreatePermissionsBatchDialog({
                                                                                           open,
                                                                                           onClose,
                                                                                           onCreateBatch,
                                                                                       }: Props) {
    const [targets, setTargets] = useState<AdminPermissionTarget[]>([]);
    const [actions, setActions] = useState<AdminPermissionAction[]>([]);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const items = useMemo(() => {
        const desc = description.trim() ? description.trim() : null;
        const out: Array<{ target: AdminPermissionTarget; action: AdminPermissionAction; description?: string | null }> = [];
        for (const t of targets) {
            for (const a of actions) {
                out.push({ target: t, action: a, description: desc });
            }
        }
        return out;
    }, [targets, actions, description]);

    const canSubmit = useMemo(() => targets.length > 0 && actions.length > 0, [targets.length, actions.length]);

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) return;
        setSaving(true);
        try {
            await onCreateBatch(items);
            onClose();
            setTargets([]);
            setActions([]);
            setDescription("");
        } finally {
            setSaving(false);
        }
    }, [canSubmit, items, onClose, onCreateBatch]);

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>Создание прав (пакетно)</DialogTitle>

            <DialogContent>
                <Stack gap={2} sx={{ mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Сущности</InputLabel>
                        <Select
                            multiple
                            label="Сущности"
                            value={targets}
                            onChange={(e) => setTargets(e.target.value as AdminPermissionTarget[])}
                            renderValue={(selected) => (
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    {(selected as string[]).map((v) => (
                                        <Chip key={v} label={v} size="small" />
                                    ))}
                                </Stack>
                            )}
                        >
                            {ALL_TARGETS.map((t) => (
                                <MenuItem key={t} value={t}>
                                    <Checkbox checked={targets.includes(t)} />
                                    <ListItemText primary={t} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Действия</InputLabel>
                        <Select
                            multiple
                            label="Действия"
                            value={actions}
                            onChange={(e) => setActions(e.target.value as AdminPermissionAction[])}
                            renderValue={(selected) => (
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    {(selected as string[]).map((v) => (
                                        <Chip key={v} label={v} size="small" />
                                    ))}
                                </Stack>
                            )}
                        >
                            {ALL_ACTIONS.map((a) => (
                                <MenuItem key={a} value={a}>
                                    <Checkbox checked={actions.includes(a)} />
                                    <ListItemText primary={a} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Описание (необязательно)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        minRows={2}
                    />

                    <Typography variant="body2" color="text.secondary">
                        Будет создано: <b>{items.length}</b> прав
                    </Typography>

                    {items.length > 0 && (
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            {items.slice(0, 12).map((x) => (
                                <Chip key={`${x.target}:${x.action}`} label={`${x.target}:${x.action}`} size="small" />
                            ))}
                            {items.length > 12 && <Chip label={`+ ещё ${items.length - 12}`} size="small" />}
                        </Stack>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Отмена
                </Button>
                <Button onClick={handleSubmit} disabled={!canSubmit || saving} variant="contained">
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
});
