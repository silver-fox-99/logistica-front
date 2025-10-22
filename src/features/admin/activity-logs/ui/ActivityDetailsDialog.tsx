import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Paper } from "@mui/material";
import type { ActivityItem } from "@/shared/api/adminActivityApi";

function Block({ title, data }: { title: string; data?: unknown }) {
    const pretty = data ? JSON.stringify(data, null, 2) : "—";
    return (
        <Stack spacing={1}>
            <Typography variant="subtitle2">{title}</Typography>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "background.default" }}>
                <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.4, overflowX: "auto" }}>{pretty}</pre>
            </Paper>
        </Stack>
    );
}

export default function ActivityDetailsDialog({
                                                  open, onClose, item,
                                              }: { open: boolean; onClose: () => void; item?: ActivityItem | null }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Детали запроса</DialogTitle>
            <DialogContent dividers sx={{ display: "grid", gap: 2 }}>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Typography variant="body2"><b>Метод:</b> {item?.method}</Typography>
                    <Typography variant="body2"><b>Маршрут:</b> {item?.endpoint}</Typography>
                    <Typography variant="body2"><b>Статус:</b> {item?.statusCode}</Typography>
                    <Typography variant="body2"><b>Продолжительность:</b> {item?.durationMs} мс</Typography>
                    <Typography variant="body2"><b>IP:</b> {item?.ip}</Typography>
                    <Typography variant="body2"><b>Время:</b> {item?.time ? new Date(item.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "medium", hour12: false }) : "—"}</Typography>
                    <Typography variant="body2"><b>Пользователь:</b> {item?.user ?? "—"}</Typography>
                </Stack>

                <Block title="Тело запроса" data={item?.body} />  
                <Block title="Параметры запроса" data={item?.query} />
                <Block title="Параметры" data={item?.params} />
                <Block title="User-Agent" data={item?.userAgent ? { userAgent: item.userAgent } : undefined} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
