import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import type { TelegramNotificationConfig } from "@/entities/telegram-notification/model/types";

type Props = {
    items: TelegramNotificationConfig[];
    loading?: boolean;
    onEdit: (item: TelegramNotificationConfig) => void;
    onToggle: (id: string) => void;
    onDelete: (item: TelegramNotificationConfig) => void;
};

export function TelegramConfigsTable(props: Props) {
    const { items, loading, onEdit, onToggle, onDelete } = props;

    return (
        <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Channels</TableCell>
                            <TableCell>Cargo</TableCell>
                            <TableCell>Transport</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{ py: 4 }}
                                    >
                                        <CircularProgress size={20} />
                                        <Typography variant="body2" color="text.secondary">
                                            Loading...
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography sx={{ py: 4 }} align="center" color="text.secondary">
                                        No telegram configs found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Typography fontWeight={600}>{item.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Updated: {new Date(item.updated_at).toLocaleString()}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Tooltip title={item.chat_ids.join(", ")}>
                                            <Chip label={`${item.chat_ids.length} channels`} size="small" />
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={item.send_cargo ? "Enabled" : "Disabled"}
                                            size="small"
                                            color={item.send_cargo ? "success" : "default"}
                                            variant={item.send_cargo ? "filled" : "outlined"}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={item.send_transport ? "Enabled" : "Disabled"}
                                            size="small"
                                            color={item.send_transport ? "success" : "default"}
                                            variant={item.send_transport ? "filled" : "outlined"}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Switch
                                            checked={item.is_active}
                                            onChange={() => onToggle(item.id)}
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <IconButton onClick={() => onEdit(item)}>
                                                <FiEdit2 />
                                            </IconButton>
                                            <IconButton onClick={() => onDelete(item)}>
                                                <FiTrash2 />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    );
}