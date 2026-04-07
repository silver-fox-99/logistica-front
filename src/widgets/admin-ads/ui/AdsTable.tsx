import {
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { AdPlacement } from "@/entities/ads/model/types";

type Props = {
    data: AdPlacement[];
    loading: boolean;
    onDelete: (item: AdPlacement) => void;
};

export function AdsTable(props: Props) {
    const { data, onDelete } = props;
    const navigate = useNavigate();

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Страница</TableCell>
                    <TableCell>Ключ placement</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Ротация</TableCell>
                    <TableCell>Баннеры</TableCell>
                    <TableCell align="right">Действия</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {data.length > 0 ? (
                    data.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>{row.page}</TableCell>
                            <TableCell>{row.placement_key}</TableCell>
                            <TableCell>{row.title || "—"}</TableCell>
                            <TableCell>
                                <Chip
                                    size="small"
                                    label={row.is_active ? "Активен" : "Выключен"}
                                    color={row.is_active ? "success" : "default"}
                                />
                            </TableCell>
                            <TableCell>
                                {row.rotation_enabled
                                    ? `Включена (${row.rotation_interval_sec} сек.)`
                                    : "Выключена"}
                            </TableCell>
                            <TableCell>
                                {row.banners_count ?? row.banners?.length ?? 0}
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title="Открыть и редактировать">
                                    <IconButton
                                        onClick={() =>
                                            navigate(`/admin/ads/${row.id}`)
                                        }
                                    >
                                        <FiEdit2 />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Удалить placement">
                                    <IconButton
                                        color="error"
                                        onClick={() => onDelete(row)}
                                    >
                                        <FiTrash2 />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7}>
                            <Typography color="text.secondary">
                                Ничего не найдено. Попробуйте изменить фильтры или создайте новый placement.
                            </Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}