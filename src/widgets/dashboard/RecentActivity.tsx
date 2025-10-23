import {
    Card, CardHeader, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from "@mui/material";
import { adminActivityApi, type ActivityItem } from "@/shared/api/adminActivityApi";
import { useEffect, useState } from "react";

export default function RecentActivity() {
    const [rows, setRows] = useState<ActivityItem[]>([]);
    useEffect(() => {
        adminActivityApi
            .list({ limit: 10, page: 1, includeAnonymous: "true" })
            .then((d) => setRows(d.data))
            .catch(() => setRows([]));
    }, []);
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Последние API активности" />
            <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Время</TableCell>
                            <TableCell>Метод</TableCell>
                            <TableCell>Маршрут</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="right">Время выполнения</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{new Date(r.time).toLocaleString()}</TableCell>
                                <TableCell>{r.method}</TableCell>
                                <TableCell>{r.endpoint}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        color={r.statusCode >= 400 ? "error" : "success"}
                                        label={r.statusCode}
                                    />
                                </TableCell>
                                <TableCell align="right">{r.durationMs} мс</TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow><TableCell colSpan={5}>Нет активности</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
