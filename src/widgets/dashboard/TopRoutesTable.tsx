import {
    Card, CardHeader, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from "@mui/material";
import type { TopRoute } from "@/shared/api/dashboardApi";

export default function TopRoutesTable({
                                           title,
                                           rows,
                                       }: {
    title: string;
    rows: TopRoute[];
}) {
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
                title={title}
                titleTypographyProps={{ fontWeight: 800, fontSize: "1.05rem" }}
            />
            <CardContent sx={{ pt: 0, overflowX: "auto" }}>
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" } }}>
                            <TableCell>Откуда</TableCell>
                            <TableCell>Куда</TableCell>
                            <TableCell align="right">Объявлений</TableCell>
                            <TableCell align="right">Общая стоимость</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r, i) => (
                            <TableRow key={i} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                                <TableCell sx={{ py: 1.5, fontWeight: 500 }}>{r.from_loc || "-"}</TableCell>
                                <TableCell sx={{ py: 1.5, fontWeight: 500 }}>{r.to_loc || "-"}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        size="small"
                                        label={r.cnt}
                                        sx={{ fontWeight: 700, bgcolor: "action.selected", color: "text.primary" }}
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    {typeof r.total_price === "number" ? r.total_price.toLocaleString() : (r.total_price || "0")}
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                    Нет данных
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
