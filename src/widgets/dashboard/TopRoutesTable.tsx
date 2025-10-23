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
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell align="right">Ads</TableCell>
                            <TableCell align="right">Total price</TableCell>
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
                            <TableRow><TableCell colSpan={4}>No data</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
