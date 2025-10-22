import { useState } from "react";
import { Card, CardContent, Stack, TextField, Button } from "@mui/material";
import { FiCpu, FiSave, FiLoader } from "react-icons/fi";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

export function MetaForm({ user, onUpdated }: { user: AdminUser; onUpdated: (u: AdminUser) => void; }) {
    const [text, setText] = useState<string>(JSON.stringify(user.meta ?? {}, null, 2));
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        let meta: Record<string, any>;
        try { meta = JSON.parse(text); } catch { alert("Мета должен быть валидным JSON объектом"); return; }
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { meta });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
            setText(JSON.stringify(res.data.user.meta ?? {}, null, 2));
        } finally { setBusy(false); }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label="Мета (JSON)"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        multiline minRows={8}
                        InputProps={{ startAdornment: <FiCpu style={{ marginRight: 8 }} /> as any }}
                    />
                    <Button onClick={submit} variant="contained" startIcon={busy ? <FiLoader/> : <FiSave/>} disabled={busy}>
                        {busy ? "Сохранение…" : "Сохранить метаданные"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
