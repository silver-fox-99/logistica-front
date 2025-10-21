import { Dialog, DialogTitle, DialogContent, Stack, TextField, DialogActions, Button } from "@mui/material";
import { useEffect, useState } from "react";

export function GroupDialog({
                                open, onClose, initial, onSubmit,
                            }: {
    open: boolean;
    onClose: () => void;
    initial?: { code?: string; title?: string; description?: string | null };
    onSubmit: (v: { code: string; title: string; description?: string | null }) => Promise<void> | void;
}) {
    const [code, setCode] = useState(initial?.code ?? "");
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setCode(initial?.code ?? ""); setTitle(initial?.title ?? ""); setDescription(initial?.description ?? "");
    }, [initial, open]);

    const submit = async () => {
        setBusy(true);
        try {
            await onSubmit({ code: code.trim().toLowerCase(), title: title.trim(), description: description || null });
            onClose();
        } finally { setBusy(false); }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initial ? "Edit group" : "Create group"}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField label="Code (lower_snake)" value={code} onChange={(e) => setCode(e.target.value)} disabled={!!initial}/>
                    <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField label="Description" value={description ?? ""} onChange={(e) => setDescription(e.target.value)} multiline minRows={2} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="text">Cancel</Button>
                <Button onClick={submit} variant="contained" disabled={busy || !title || (!initial && !code)}>
                    {initial ? "Save" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
