
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    TablePagination,
    Chip,
    Tooltip,
    Typography,
    Link,
    Paper,
    Box,
    CircularProgress,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { AdminBroadcast } from "@/shared/api/userNotificationsAdminApi.ts";

interface BroadcastsTableProps {
    broadcasts: AdminBroadcast[];
    total: number;
    loading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export default function BroadcastsTable({
    broadcasts,
    total,
    loading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: BroadcastsTableProps) {
    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    };

    const getTypeChipColor = (type: string) => {
        switch (type) {
            case "SYSTEM_UPDATE":
                return "info";
            case "PROMOTION":
                return "success";
            case "NEWS":
                return "secondary";
            default:
                return "default";
        }
    };

    const getTypeChipLabel = (type: string) => {
        switch (type) {
            case "SYSTEM_UPDATE":
                return "Обновление системы";
            case "PROMOTION":
                return "Акция / Скидка";
            case "NEWS":
                return "Новость";
            default:
                return type;
        }
    };

    if (loading) {
        return (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                    <CircularProgress size={40} />
                </Box>
            </TableContainer>
        );
    }

    if (broadcasts.length === 0) {
        return (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                    <Typography color="text.secondary">История рассылок пуста. Создайте свою первую рассылку!</Typography>
                </Box>
            </TableContainer>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: "160px" }}>Дата</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: "180px" }}>Тип</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: "220px" }}>Заголовок</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Сообщение</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: "200px" }}>Создатель</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: "160px" }}>Метаданные (JSON)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {broadcasts.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>{formatTime(row.created_at)}</TableCell>
                            <TableCell>
                                <Chip
                                    label={getTypeChipLabel(row.type)}
                                    color={getTypeChipColor(row.type)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{row.title || "—"}</TableCell>
                            <TableCell sx={{ whiteSpace: "pre-line" }}>{row.message}</TableCell>
                            <TableCell>
                                {row.creator ? (
                                    <Link
                                        component={RouterLink}
                                        to={`/admin/user/${row.creator.id}`}
                                        sx={{ fontWeight: 600, textDecoration: "none", color: "primary.main", "&:hover": { textDecoration: "underline" } }}
                                    >
                                        {[row.creator.first_name, row.creator.last_name].filter(Boolean).join(" ") || row.creator.id}
                                    </Link>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {row.metadata && Object.keys(row.metadata).length > 0 ? (
                                    <Tooltip title={<pre style={{ margin: 0, padding: 4 }}>{JSON.stringify(row.metadata, null, 2)}</pre>} arrow>
                                        <Chip
                                            label="Показать JSON"
                                            size="small"
                                            clickable
                                            sx={{ borderRadius: 1.5 }}
                                        />
                                    </Tooltip>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => onPageChange(newPage)}
                onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                labelRowsPerPage="Строк на странице:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
            />
        </TableContainer>
    );
}
