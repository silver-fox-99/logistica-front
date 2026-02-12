import { memo, useCallback, useMemo, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Switch,
    FormControlLabel,
} from "@mui/material";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (dto: { code: string; name: string; description?: string | null; rank?: number; is_root?: boolean }) => Promise<void>;
    allowRootToggle: boolean;
};

export const CreateGroupDialog = memo(function CreateGroupDialog({
                                                                     open,
                                                                     onClose,
                                                                     onCreate,
                                                                     allowRootToggle,
                                                                 }: Props) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rank, setRank] = useState<number>(0);
    const [isRoot, setIsRoot] = useState(false);
    const [saving, setSaving] = useState(false);

    const canSubmit = useMemo(() => code.trim().length > 0 && name.trim().length > 0, [code, name]);

    const handleCreate = useCallback(async () => {
        if (!canSubmit) return;
        setSaving(true);
        try {
            await onCreate({
                code: code.trim(),
                name: name.trim(),
                description: description.trim() ? description.trim() : null,
                rank,
                is_root: allowRootToggle ? isRoot : false,
            });
            onClose();
            setCode("");
            setName("");
            setDescription("");
            setRank(0);
            setIsRoot(false);
        } finally {
            setSaving(false);
        }
    }, [allowRootToggle, canSubmit, code, name, description, rank, isRoot, onCreate, onClose]);

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Создание группы</DialogTitle>

            <DialogContent>
                <Stack gap={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Код"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoComplete="off"
                    />
                    <TextField
                        label="Название"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="off"
                    />
                    <TextField
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        autoComplete="off"
                        multiline
                        minRows={2}
                    />
                    <TextField
                        label="Ранг"
                        type="number"
                        value={rank}
                        onChange={(e) => setRank(Number(e.target.value))}
                        inputProps={{ min: 0 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isRoot}
                                onChange={(e) => setIsRoot(e.target.checked)}
                                disabled={!allowRootToggle}
                            />
                        }
                        label="Root-группа"
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Отмена
                </Button>
                <Button onClick={handleCreate} disabled={!canSubmit || saving} variant="contained">
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
});
