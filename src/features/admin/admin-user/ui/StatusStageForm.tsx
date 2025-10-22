import { useState } from "react";
import { Card, CardContent, Stack, TextField, MenuItem, Button } from "@mui/material";
import { FiSave, FiLoader } from "react-icons/fi";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";
import type { RegistrationStage, UserStatus } from "@/entities/user/model/user.types";

const STAGES: RegistrationStage[] = ["PENDING","PHONE_VERIFIED","PROFILE","COMPLETED"];
const STATUSES: UserStatus[] = ["ACTIVE","INACTIVE","BLOCKED"];

export function StatusStageForm({ user, onUpdated }: { user: AdminUser; onUpdated: (u: AdminUser) => void; }) {
    const [stage, setStage]   = useState<RegistrationStage>(user.registration_stage);
    const [status, setStatus] = useState<UserStatus>(user.status);
    const [busy, setBusy] = useState(false);
    const dirty = stage !== user.registration_stage || status !== user.status;

    const submit = async () => {
        setBusy(true);
        try {
            await adminUserApi.patch(user.id, { registration_stage: stage, status });
            const res = await adminUserApi.get(user.id);
            onUpdated(res.data.user);
        } finally { setBusy(false); }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={2} direction={{ xs: "column" }}>
                    <TextField select label="Этап регистрации" value={stage} onChange={(e) => setStage(e.target.value as RegistrationStage)} sx={{ minWidth: 220 }}>
                        {STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <TextField select label="Статус" value={status} onChange={(e) => setStatus(e.target.value as UserStatus)} sx={{ minWidth: 220 }}>
                        {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <Button onClick={submit} disabled={!dirty || busy} variant="contained" startIcon={busy ? <FiLoader/> : <FiSave/>}>
                        {busy ? "Сохранение…" : "Сохранить"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
