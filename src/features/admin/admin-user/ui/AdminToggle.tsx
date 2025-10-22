import { useState } from "react";
import { Card, CardContent, Stack, Switch, FormControlLabel, Button } from "@mui/material";
import { FiShield, FiSave, FiLoader } from "react-icons/fi";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

export function AdminToggle({ user, onUpdated }: { user: AdminUser; onUpdated: (u: AdminUser) => void; }) {
    const [value, setValue] = useState<boolean>(user.is_admin);
    const [busy, setBusy] = useState(false);
    const dirty = value !== user.is_admin;

    const submit = async () => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { is_admin: value });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
        } finally { setBusy(false); }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                        control={<Switch checked={value} onChange={(_, c) => setValue(c)} />}
                        label={<span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FiShield/> Права администратора
            </span>}
                    />
                    <Button onClick={submit} disabled={!dirty || busy} variant="contained" startIcon={busy ? <FiLoader/> : <FiSave/>}>
                        {busy ? "Обновление…" : "Сохранить"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
