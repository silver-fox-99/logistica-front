import { Dialog, DialogTitle, DialogContent, Stack, TextField, DialogActions, Button, FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";

export function ItemDialog({
                               open, onClose, initial, onSubmit,
                           }: {
    open: boolean;
    onClose: () => void;
    initial?: { slug?: string; label?: string; label_ru?: string | null; label_uz?: string | null; sort_order?: number; active?: boolean; meta?: any };
    onSubmit: (v: { slug: string; label: string; label_ru?: string | null; label_uz?: string | null; sort_order: number; active: boolean; meta?: any }) => Promise<void> | void;
}) {
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [label, setLabel] = useState(initial?.label ?? "");
    const [labelRu, setLabelRu] = useState(initial?.label_ru ?? "");
    const [labelUz, setLabelUz] = useState(initial?.label_uz ?? "");
    const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);
    const [active, setActive] = useState(initial?.active ?? true);
    const [meta, setMeta] = useState<string>(initial?.meta ? JSON.stringify(initial.meta, null, 2) : "");

    useEffect(() => {
        setSlug(initial?.slug ?? ""); 
        setLabel(initial?.label ?? "");
        setLabelRu(initial?.label_ru ?? "");
        setLabelUz(initial?.label_uz ?? "");
        setSortOrder(initial?.sort_order ?? 0); 
        setActive(initial?.active ?? true);
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
            label_ru: labelRu.trim() || null,
            label_uz: labelUz.trim() || null,
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
                    <TextField label="Код (Введите в верхнем регистре)" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!!initial}/>
                    <TextField label="Название (английский) *" value={label} onChange={(e) => setLabel(e.target.value)} required />
                    <TextField label="Название (русский)" value={labelRu} onChange={(e) => setLabelRu(e.target.value)} placeholder="Опционально" />
                    <TextField label="Название (узбекский)" value={labelUz} onChange={(e) => setLabelUz(e.target.value)} placeholder="Опционально" />
                    <TextField
                        label="Порядок сортировки"
                        type="text"
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        value={sortOrder}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            setSortOrder(raw === "" ? 0 : parseInt(raw, 10));
                        }}
                    />
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
