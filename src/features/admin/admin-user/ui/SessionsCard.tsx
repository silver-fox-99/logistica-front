import { Card, CardContent, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import type { AdminUserSessionsItem } from "@/shared/api/adminUserApi";

const fmt = (d?: string | null) => d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false }) : "—";

export function SessionsCard({ sessions }: { sessions: AdminUserSessionsItem[] }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={700}>Сессии</Typography>
                    <Chip size="small" label={sessions.length}/>
                </Stack>
                <Divider sx={{ mb: 2 }}/>
                <Stack spacing={1.25}>
                    {sessions.map(s => (
                        <Stack key={s.id} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}
                               justifyContent="space-between" sx={{ p: 1, borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                            <Stack spacing={0.5}>
                                <Typography variant="body2" fontWeight={600}>{s.userAgent?.slice(0, 100) || "—"}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    IP: {s.ip || "—"} • Создано: {fmt(s.createdAt)} • Истекает: {fmt(s.expiresAt)}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip size="small" label={s.status} color={s.status === "ACTIVE" ? "success" : "default"}/>
                                <IconButton size="small" onClick={() => navigator.clipboard?.writeText(s.id)} title="Скопировать ID сессии">#</IconButton>
                            </Stack>
                        </Stack>
                    ))}
                    {!sessions.length && <Typography variant="body2" color="text.secondary">Сессий нет</Typography>}
                </Stack>
            </CardContent>
        </Card>
    );
}
