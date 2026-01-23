import { useMemo } from "react";
import {
    Paper,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Stack,
    Chip,
} from "@mui/material";
import type { InfoViewer } from "@/shared/api/dashboardApi";

function formatName(v: InfoViewer) {
    const fn = (v.first_name ?? "").trim();
    const ln = (v.last_name ?? "").trim();
    const full = `${fn} ${ln}`.trim();
    return full || "—";
}

function formatIdentity(v: InfoViewer) {
    return v.phone || v.email || (v.user_id ? v.user_id.slice(0, 8) + "…" : "—");
}

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

export default function TopInfoViewersTable({
                                                title = "Топ просмотров деталей",
                                                rows,
                                            }: {
    title?: string;
    rows: InfoViewer[];
}) {
    const sorted = useMemo(() => rows ?? [], [rows]);

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h6" fontWeight={700}>
                    {title}
                </Typography>
                <Chip size="small" label={`Top ${sorted.length}`} />
            </Stack>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 64 }}>#</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Контакт</TableCell>
                        <TableCell align="right">Cargo</TableCell>
                        <TableCell align="right">Transport</TableCell>
                        <TableCell align="right">Всего</TableCell>
                        <TableCell>Последний просмотр</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {sorted.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} sx={{ color: "text.secondary" }}>
                                Нет данных за выбранный период
                            </TableCell>
                        </TableRow>
                    ) : (
                        sorted.map((r, idx) => (
                            <TableRow key={`${r.user_id ?? r.phone ?? r.email ?? idx}`}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        {formatName(r)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {r.user_id ? `id: ${r.user_id}` : "id: —"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{formatIdentity(r)}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {r.email ?? ""}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">{r.cargo_views ?? 0}</TableCell>
                                <TableCell align="right">{r.transport_views ?? 0}</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight={700}>
                                        {r.total_views ?? 0}
                                    </Typography>
                                </TableCell>
                                <TableCell>{formatDate(r.last_view_at)}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
}
