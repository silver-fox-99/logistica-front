import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import type { Company } from "@/entities/company/model/types";

type Props = {
    items: Company[];
    isLoading?: boolean;
    onOpen: (id: string) => void;
};

const statusColorMap: Record<
    Company["status"],
    "default" | "success" | "warning" | "error"
> = {
    UNVERIFIED: "default",
    PENDING_REVIEW: "warning",
    VERIFIED: "success",
    REJECTED: "error",
    BLOCKED: "error",
};

export function AdminCompaniesTable({ items, isLoading, onOpen }: Props) {
    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!items.length) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography>Компании не найдены</Typography>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>Legal name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Лимит участников</TableCell>
                        <TableCell align="right">Действия</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} hover>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.legal_name || "—"}</TableCell>
                            <TableCell>{item.email || "—"}</TableCell>
                            <TableCell>{item.phone || "—"}</TableCell>
                            <TableCell>
                                <Chip
                                    label={item.status}
                                    size="small"
                                    color={statusColorMap[item.status]}
                                />
                            </TableCell>
                            <TableCell>{item.members_limit ?? "—"}</TableCell>
                            <TableCell align="right">
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => onOpen(item.id)}
                                    sx={{ textTransform: "none", fontWeight: 700 }}
                                >
                                    Открыть
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}