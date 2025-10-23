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
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title={title} />
            <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Откуда</TableCell>
                            <TableCell>Куда</TableCell>
                            <TableCell align="right">Объявлений</TableCell>
                            <TableCell align="right">Общая цена</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r, i) => (
                            <TableRow key={i} hover>
                                <TableCell>{r.from_loc || "-"}</TableCell>
                                <TableCell>{r.to_loc || "-"}</TableCell>
                                <TableCell align="right">
                                    <Chip size="small" label={r.cnt} />
                                </TableCell>
                                <TableCell align="right">
                                    {typeof r.total_price === "string" ? r.total_price : r.total_price?.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow><TableCell colSpan={4}>Нет данных</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
