import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, MenuItem, Select, InputLabel, FormControl, FormHelperText, Autocomplete } from "@mui/material";
import type { GeoLocation, LocationType, CreateLocationDto, UpdateLocationDto } from "@/shared/api/adminGeoApi";

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
    const [type, setType] = useState<LocationType>("CITY");
    const [name, setName] = useState("");
    const [code, setCode] = useState<string>("");
    const [iso2, setIso2] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [parent, setParent] = useState<GeoLocation | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);

    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        setType((initial?.type as LocationType) ?? "CITY");
        setName(initial?.name ?? "");
        setCode((initial?.code as string) ?? "");
        setIso2((initial?.iso2 as string) ?? "");
        setSlug((initial?.slug as string) ?? "");
        setIsActive((initial?.is_active as boolean) ?? true);
        const p = initial?.parent_id ? all.find(i => i.id === initial!.parent_id) ?? null : null;
        setParent(p);
        setErrors({});
    }, [initial, open, all]);

    // Родителя нельзя выбирать самого себя и его прямых/косвенных детей (простейшая защита от циклов)
    const unavailableIds = useMemo(() => {
        if (!initial?.id) return new Set<string>();
        const set = new Set<string>([initial.id]);
        const walk = (id: string) => {
            all.filter(i => i.parent_id === id).forEach(ch => { set.add(ch.id); walk(ch.id); });
        };
        walk(initial.id);
        return set;
    }, [all, initial?.id]);

    const parentOptions = useMemo(
        () => all.filter(i => !unavailableIds.has(i.id)),
        [all, unavailableIds]
    );

    const validate = () => {
        const e: Record<string, string | undefined> = {};
        if (!name.trim()) e.name = "Name is required";
        if (!type) e.type = "Type is required";
        if (type === "COUNTRY" && iso2 && !/^[A-Za-z]{2}$/.test(iso2)) e.iso2 = "ISO2 must be 2 letters";
        if (code && code.length > 32) e.code = "Max length is 32";
        if (slug && slug.length > 200) e.slug = "Max length is 200";
        setErrors(e);
        return Object.values(e).every(v => !v);
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (mode === "create") {
            const dto: CreateLocationDto = {
                type, name: name.trim(),
                parent_id: parent?.id || undefined,
                code: code || undefined,
                iso2: iso2 || undefined,
                slug: slug || undefined,
            };
            await onSubmit(dto);
        } else {
            const dto: UpdateLocationDto = {
                type,
                name: name.trim(),
                parent_id: parent ? parent.id : null,
                code: code || null,
                iso2: iso2 || null,
                slug: slug || null,
                is_active: isActive,
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
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={type} onChange={(e) => setType(e.target.value as LocationType)}>
                            {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                        {!!errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                    </FormControl>

                    <TextField
                        size="small" label="Name" value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name} helperText={errors.name}
                    />

                    <Autocomplete
                        options={parentOptions}
                        getOptionLabel={(o) => `${o.name} (${o.type})`}
                        value={parent}
                        onChange={(_, v) => setParent(v)}
                        renderInput={(p) => <TextField {...p} size="small" label="Parent (optional)" />}
                    />

                    <TextField
                        size="small" label="Code (optional)" value={code}
                        onChange={(e) => setCode(e.target.value)}
                        error={!!errors.code} helperText={errors.code}
                    />

                    <TextField
                        size="small" label="ISO2 (countries only)" value={iso2}
                        onChange={(e) => setIso2(e.target.value)}
                        error={!!errors.iso2} helperText={errors.iso2}
                        placeholder="US, UA, PL…"
                    />

                    <TextField
                        size="small" label="Slug (optional)" value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        error={!!errors.slug} helperText={errors.slug}
                    />

                    {mode === "edit" && (
                        <FormControl size="small">
                            <InputLabel shrink>Active</InputLabel>
                            <Select
                                notched
                                value={String(isActive)}
                                onChange={(e) => setIsActive(e.target.value === "true")}
                                label="Active"
                            >
                                <MenuItem value="true">Active</MenuItem>
                                <MenuItem value="false">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={submitting}>
                    {submitting ? "Saving…" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
