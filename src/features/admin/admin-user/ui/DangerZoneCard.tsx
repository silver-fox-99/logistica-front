
import { useState } from "react";
import { Card, CardContent, Stack, Button } from "@mui/material";
import { FiSlash, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
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
                                toast.success('Пользователь заблокирован');
                            } catch (error: any) {
                                const message = error?.response?.data?.message || 'Ошибка при блокировке пользователя';
                                toast.error(message);
                            } finally { setBusy(false); }
                        }}
                    >
                        Заблокировать пользователя
                    </Button>

                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<FiTrash2/>}
                        disabled={busy}
                        onClick={async () => {
                            if (!confirm("Удалить этого пользователя? Это действие не может быть отменено.")) return;
                            setBusy(true);
                            try {
                                await adminUserApi.remove(user.id);
                                toast.success('Пользователь удален');
                                onDeleted();
                            } catch (error: any) {
                                const message = error?.response?.data?.message || 'Ошибка при удалении пользователя';
                                toast.error(message);
                            } finally { setBusy(false); }
                        }}
                    >
                        Удалить пользователя
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
