
import { useState } from "react";
import { Card, CardContent, Stack, Button } from "@mui/material";
import { FiSlash, FiTrash2 } from "react-icons/fi";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

export function DangerZoneCard({
                                   user, onBanned, onDeleted,
                               }: { user: AdminUser; onBanned: (u: AdminUser) => void; onDeleted: () => void; }) {
    const [busy, setBusy] = useState(false);

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "warning.main" }}>
            <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Button
                        color="warning"
                        variant="outlined"
                        startIcon={<FiSlash/>}
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            try {
                                await adminUserApi.ban(user.id);
                                const res = await adminUserApi.get(user.id);
                                onBanned(res.data.user);
                            } finally { setBusy(false); }
                        }}
                    >
                        Ban user
                    </Button>

                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<FiTrash2/>}
                        disabled={busy}
                        onClick={async () => {
                            if (!confirm("Delete this user? This action cannot be undone.")) return;
                            setBusy(true);
                            try {
                                await adminUserApi.remove(user.id);
                                onDeleted();
                            } finally { setBusy(false); }
                        }}
                    >
                        Delete user
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
