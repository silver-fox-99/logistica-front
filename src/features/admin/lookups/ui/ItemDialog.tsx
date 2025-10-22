import { Dialog, DialogTitle, DialogContent, Stack, TextField, DialogActions, Button, FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";

export function ItemDialog({
                               open, onClose, initial, onSubmit,
                           }: {
    open: boolean;
    onClose: () => void;
    initial?: { slug?: string; label?: string; sort_order?: number; active?: boolean; meta?: any };
    onSubmit: (v: { slug: string; label: string; sort_order: number; active: boolean; meta?: any }) => Promise<void> | void;
}) {
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [label, setLabel] = useState(initial?.label ?? "");
    const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);
    const [active, setActive] = useState(initial?.active ?? true);
    const [meta, setMeta] = useState<string>(initial?.meta ? JSON.stringify(initial.meta, null, 2) : "");

    useEffect(() => {
        setSlug(initial?.slug ?? ""); setLabel(initial?.label ?? "");
        setSortOrder(initial?.sort_order ?? 0); setActive(initial?.active ?? true);
        setMeta(initial?.meta ? JSON.stringify(initial.meta, null, 2) : "");
    }, [initial, open]);

    const onSave = async () => {
        let metaObj: any = undefined;
        if (meta.trim().length) {
            try { metaObj = JSON.parse(meta); } catch { alert("Мета должен быть валидным JSON"); return; }
        }
        await onSubmit({
            slug: slug.trim().toUpperCase(),
            label: label.trim(),
            sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
            active,
            meta: metaObj,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initial ? "Редактировать элемент" : "Создать элемент"}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField label="Слаг (UPPER_SNAKE)" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!!initial}/>
                    <TextField label="Название" value={label} onChange={(e) => setLabel(e.target.value)} />
                    <TextField label="Порядок сортировки" type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value || "0", 10))} />
                    <FormControlLabel control={<Switch checked={active} onChange={(_, v) => setActive(v)} />} label="Активен" />
                    <TextField label="Мета (JSON)" value={meta} onChange={(e) => setMeta(e.target.value)} multiline minRows={4} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="text">Отмена</Button>
                <Button onClick={onSave} variant="contained" disabled={!label || (!initial && !slug)}>Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
}
