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

// Russian pluralization helper for channels
const getChannelsLabel = (count: number) => {
    const remainder10 = count % 10;
    const remainder100 = count % 100;

    if (remainder10 === 1 && remainder100 !== 11) {
        return `${count} канал`;
    }
    if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 10 || remainder100 >= 20)) {
        return `${count} канала`;
    }
    return `${count} каналов`;
};

export function TelegramConfigsTable(props: Props) {
    const { items, loading, onEdit, onToggle, onDelete } = props;

    return (
        <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Каналы</TableCell>
                            <TableCell>Грузы</TableCell>
                            <TableCell>Транспорт</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="right">Действия</TableCell>
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
                                            Загрузка...
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography sx={{ py: 4 }} align="center" color="text.secondary">
                                        Конфигурации ботов не найдены
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
                                                Обновлено: {new Date(item.updated_at).toLocaleString("ru-RU")}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Tooltip title={item.chat_ids.join(", ")}>
                                            <Chip label={getChannelsLabel(item.chat_ids.length)} size="small" />
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={item.send_cargo ? "Включено" : "Выключено"}
                                            size="small"
                                            color={item.send_cargo ? "success" : "default"}
                                            variant={item.send_cargo ? "filled" : "outlined"}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={item.send_transport ? "Включено" : "Выключено"}
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