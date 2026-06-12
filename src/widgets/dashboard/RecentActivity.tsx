import {
    Card, CardHeader, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from "@mui/material";
import { adminActivityApi, type ActivityItem } from "@/shared/api/adminActivityApi";
import { useEffect, useState } from "react";

const getMethodColor = (method: string): "primary" | "success" | "warning" | "error" | "default" => {
    switch (method.toUpperCase()) {
        case "GET":
            return "primary";
        case "POST":
            return "success";
        case "PUT":
        case "PATCH":
            return "warning";
        case "DELETE":
            return "error";
        default:
            return "default";
    }
};

export default function RecentActivity() {
    const [rows, setRows] = useState<ActivityItem[]>([]);

    useEffect(() => {
        adminActivityApi
            .list({ limit: 10, page: 1, includeAnonymous: "true" })
            .then((d) => setRows(d.data))
            .catch(() => setRows([]));
    }, []);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                transition: "all 0.3s ease",
                height: "100%",
                "&:hover": {
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.03)",
                },
            }}
        >
            <CardHeader
                title="Последняя API активность"
                subheader="Логирование запросов в режиме реального времени"
                titleTypographyProps={{ fontWeight: 800, fontSize: "1.1rem" }}
                subheaderTypographyProps={{ fontSize: "0.85rem", color: "text.secondary" }}
            />
            <CardContent sx={{ pt: 0, overflowX: "auto" }}>
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" } }}>
                            <TableCell>Время</TableCell>
                            <TableCell>Метод</TableCell>
                            <TableCell>Маршрут</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="right">Ответ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow
                                key={r.id}
                                sx={{ "&:hover": { bgcolor: "action.hover" } }}
                            >
                                <TableCell sx={{ py: 1.5, fontSize: "13px" }}>
                                    {new Date(r.time).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        color={getMethodColor(r.method)}
                                        label={r.method}
                                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: "11px" }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontSize: "13px", fontFamily: "monospace", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {r.endpoint}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={r.statusCode >= 400 ? "error" : "success"}
                                        label={r.statusCode}
                                        sx={{ fontWeight: 600, fontSize: "12px" }}
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, fontSize: "13px", color: r.durationMs > 500 ? "warning.main" : "text.secondary" }}>
                                    {r.durationMs} мс
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                    Нет активности
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
