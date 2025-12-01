import { useEffect, useMemo, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
    MenuItem, Select, InputLabel, FormControl, FormHelperText, Autocomplete
} from "@mui/material";
import type { GeoLocation, LocationType, CreateLocationDto, UpdateLocationDto } from "@/shared/api/adminGeoApi";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";

const TYPES: LocationType[] = ["COUNTRY", "REGION", "CITY", "DISTRICT", "OTHER"];

type Props = {
    open: boolean;
    mode: "create" | "edit";
    title: string;
    all: GeoLocation[];
    initial?: Partial<GeoLocation>;
    onClose: () => void;
    onSubmit: (dto: CreateLocationDto | UpdateLocationDto) => Promise<void> | void;
    submitting?: boolean;
};

export default function GeoLocationDialog({
                                              open, mode, title, all, initial, onClose, onSubmit, submitting
                                          }: Props) {
    const { getLocalizedGeoName } = useLocalizedGeo();
    const [type, setType] = useState<LocationType>("CITY");
    const [name, setName] = useState("");
    const [nameRu, setNameRu] = useState<string>("");
    const [nameUz, setNameUz] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [iso2, setIso2] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [parent, setParent] = useState<GeoLocation | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [order, setOrder] = useState<number | "">(0);

    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        setType((initial?.type as LocationType) ?? "CITY");
        setName(initial?.name ?? "");
        setNameRu(initial?.name_ru ?? "");
        setNameUz(initial?.name_uz ?? "");
        setCode((initial?.code as string) ?? "");
        setIso2((initial?.iso2 as string) ?? "");
        setSlug((initial?.slug as string) ?? "");
        setIsActive((initial?.is_active as boolean) ?? true);
        setOrder(initial?.order ?? "");
        const p = initial?.parent_id ? all.find(i => i.id === initial!.parent_id) ?? null : null;
        setParent(p);
        setErrors({});
    }, [initial, open, all]);

    // запрещаем выбирать самого себя и своих потомков
    const unavailableIds = useMemo(() => {
        if (!initial?.id) return new Set<string>();
        const set = new Set<string>([initial.id]);
        const walk = (id: string) => {
            all.filter(i => i.parent_id === id).forEach(ch => { set.add(ch.id); walk(ch.id); });
        };
        walk(initial.id);
        return set;
    }, [all, initial?.id]);

    const parentOptions = useMemo(() => {
        let opts = all.filter(i => !unavailableIds.has(i.id));
        if (type === "COUNTRY") {
            opts = []; // без родителя
        }
        if (type === "REGION") {
            opts = opts.filter(i => i.type === "COUNTRY" || i.parent_id === null);
        }
        return opts;
    }, [all, unavailableIds, type]);

    const validate = () => {
        const e: Record<string, string | undefined> = {};
        if (!name.trim()) e.name = "Name is required";
        if (!type) e.type = "Type is required";
        if (type === "COUNTRY" && iso2 && !/^[A-Za-z]{2}$/.test(iso2)) e.iso2 = "ISO2 must be 2 letters";
        if (type === "COUNTRY" && parent) e.type = "Country can't have a parent";
        if (code && code.length > 32) e.code = "Max length is 32";
        if (slug && slug.length > 200) e.slug = "Max length is 200";
        setErrors(e);
        return Object.values(e).every(v => !v);
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (mode === "create") {
            const dto: CreateLocationDto = {
                type,
                name: name.trim(),
                name_ru: nameRu.trim() || null,
                name_uz: nameUz.trim() || null,
                parent_id: parent?.id || undefined,
                code: code || undefined,
                iso2: iso2 || undefined,
                slug: slug || undefined,
                order: order === "" ? undefined : (typeof order === "number" ? order : undefined),
            };
            await onSubmit(dto);
        } else {
            const dto: UpdateLocationDto = {
                type,
                name: name.trim(),
                name_ru: nameRu.trim() || null,
                name_uz: nameUz.trim() || null,
                parent_id: parent ? parent.id : null,
                code: code || null,
                iso2: iso2 || null,
                slug: slug || null,
                is_active: isActive,
                order: order === "" ? undefined : (typeof order === "number" ? order : undefined),
            };
            await onSubmit(dto);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <FormControl size="small" error={!!errors.type}>
                        <InputLabel>Тип</InputLabel>
                        <Select label="Type" value={type} onChange={(e) => setType(e.target.value as LocationType)}>
                            {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                        {!!errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                    </FormControl>

                    <TextField
                        size="small" label="Название (английский)" value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name} helperText={errors.name}
                    />

                    <TextField
                        size="small" label="Название (русский)" value={nameRu}
                        onChange={(e) => setNameRu(e.target.value)}
                    />

                    <TextField
                        size="small" label="Название (узбекский)" value={nameUz}
                        onChange={(e) => setNameUz(e.target.value)}
                    />

                    <Autocomplete
                        options={parentOptions}
                        getOptionLabel={(o) => `${getLocalizedGeoName(o)} (${o.type})`}
                        value={parent}
                        onChange={(_, v) => setParent(v)}
                        renderInput={(p) => <TextField {...p} size="small" label="Локация (опционально)" />}
                        disabled={type === "COUNTRY"}
                    />

                    <TextField
                        size="small" label="Код (опционально)" value={code}
                        onChange={(e) => setCode(e.target.value)}
                        error={!!errors.code} helperText={errors.code}
                    />

                    <TextField
                        size="small" label="ISO2 (только для стран)" value={iso2}
                        onChange={(e) => setIso2(e.target.value)}
                        error={!!errors.iso2} helperText={errors.iso2}
                        placeholder="US, UA, PL…"
                    />

                    <TextField
                        size="small" label="Слаг (опционально)" value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        error={!!errors.slug} helperText={errors.slug}
                    />

                    {mode === "edit" && (
                        <>
                            <TextField
                                size="small"
                                label="Порядок сортировки"
                                type="number"
                                value={order}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setOrder(val === "" ? "" : parseInt(val, 10));
                                }}
                                inputProps={{ min: 0 }}
                                helperText="Меньшее значение = выше в списке (например, 0 для Узбекистана)"
                            />
                            <FormControl size="small">
                                <InputLabel shrink>Активен</InputLabel>
                                <Select
                                    notched
                                    value={String(isActive)}
                                    onChange={(e) => setIsActive(e.target.value === "true")}
                                    label="Активен"
                                >
                                    <MenuItem value="true">Активен</MenuItem>
                                    <MenuItem value="false">Неактивен</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSave} disabled={submitting}>
                    {submitting ? "Сохранение…" : "Сохранить"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
