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
import {
    FiArrowDown,
    FiArrowUp,
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";
import type { AdBanner } from "@/entities/ads/model/types";

type Props = {
    banners: AdBanner[];
    loading: boolean;
    onEdit: (banner: AdBanner) => void;
    onDelete: (banner: AdBanner) => void;
    onMoveUp: (banner: AdBanner) => void;
    onMoveDown: (banner: AdBanner) => void;
};

export function AdBannersTable(props: Props) {
    const { banners, loading, onEdit, onDelete, onMoveUp, onMoveDown } = props;

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Порядок</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Изображение</TableCell>
                    <TableCell>Ссылка</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="right">Действия</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {banners.length > 0 ? (
                    banners.map((banner, index) => (
                        <TableRow key={banner.id} hover>
                            <TableCell>{banner.sort_order}</TableCell>
                            <TableCell>{banner.title}</TableCell>

                            <TableCell>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        maxWidth: 240,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                    title={banner.image_url}
                                >
                                    {banner.image_url}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        maxWidth: 240,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                    title={banner.target_url || ""}
                                >
                                    {banner.target_url || "—"}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Chip
                                    size="small"
                                    label={banner.is_active ? "Активен" : "Выключен"}
                                    color={banner.is_active ? "success" : "default"}
                                />
                            </TableCell>

                            <TableCell align="right">
                                <Tooltip title="Поднять выше">
                                    <span>
                                        <IconButton
                                            disabled={loading || index === 0}
                                            onClick={() => onMoveUp(banner)}
                                        >
                                            <FiArrowUp />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Опустить ниже">
                                    <span>
                                        <IconButton
                                            disabled={loading || index === banners.length - 1}
                                            onClick={() => onMoveDown(banner)}
                                        >
                                            <FiArrowDown />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Редактировать">
                                    <IconButton onClick={() => onEdit(banner)}>
                                        <FiEdit2 />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Удалить">
                                    <IconButton
                                        color="error"
                                        onClick={() => onDelete(banner)}
                                    >
                                        <FiTrash2 />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6}>
                            <Typography color="text.secondary">
                                Баннеры пока не добавлены
                            </Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}