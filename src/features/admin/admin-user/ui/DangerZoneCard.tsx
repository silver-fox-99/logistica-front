import { useState } from "react";
import { Card, CardContent, Stack, Button } from "@mui/material";
import { FiSlash, FiTrash2, FiPlay } from "react-icons/fi";
import { toast } from "react-toastify";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

export function DangerZoneCard({
                                   user, onBanned, onDeleted,
                               }: { user: AdminUser; onBanned: (u: AdminUser) => void; onDeleted: () => void; }) {
    const [busy, setBusy] = useState(false);
    const isBlocked = user.status === "BLOCKED";

    const handleBanToggle = async () => {
        setBusy(true);
        try {
            if (isBlocked) {
                // Unblock user
                await adminUserApi.patch(user.id, { status: "ACTIVE" });
                const res = await adminUserApi.get(user.id);
                onBanned(res.data.user);
                toast.success('Пользователь успешно разблокирован');
            } else {
                // Block user
                await adminUserApi.ban(user.id);
                const res = await adminUserApi.get(user.id);
                onBanned(res.data.user);
                toast.success('Пользователь заблокирован');
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Ошибка при изменении статуса пользователя';
            toast.error(message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: isBlocked ? "success.main" : "warning.main" }}>
            <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                    <Button
                        color={isBlocked ? "success" : "warning"}
                        variant="outlined"
                        startIcon={isBlocked ? <FiPlay/> : <FiSlash/>}
                        disabled={busy}
                        onClick={handleBanToggle}
                    >
                        {isBlocked ? "Разблокировать пользователя" : "Заблокировать пользователя"}
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
