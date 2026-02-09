import React from "react";
import { IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { DocumentEntity } from "@/entities/document/model/types";
import { DocumentStatus } from "@/entities/document/model/types";

type Props = {
    items: DocumentEntity[];
    onEdit: (doc: DocumentEntity) => void;
    onDelete: (doc: DocumentEntity) => void;
};

const STATUS_RU: Record<string, string> = {
    [DocumentStatus.DRAFT]: "Черновик",
    [DocumentStatus.ARCHIVED]: "Архив",
    [DocumentStatus.PUBLISHED]: "Опубликован",
};

export const DocumentsTable = React.memo(function DocumentsTable({ items, onEdit, onDelete }: Props) {
    if (!items.length) {
        return <Typography sx={{ opacity: 0.75 }}>Версии не найдены.</Typography>;
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Версия</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Опубликовано</TableCell>
                    <TableCell>Обновлено</TableCell>
                    <TableCell align="right">Действия</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {items.map((d) => (
                    <TableRow key={d.id} hover>
                        <TableCell>v{d.version}</TableCell>
                        <TableCell>{STATUS_RU[d.status] ?? d.status}</TableCell>
                        <TableCell>{d.published_at ? new Date(d.published_at).toLocaleString("ru-RU") : "—"}</TableCell>
                        <TableCell>{new Date(d.updated_at).toLocaleString("ru-RU")}</TableCell>
                        <TableCell align="right">
                            <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                                <Tooltip title="Редактировать">
                                    <IconButton size="small" onClick={() => onEdit(d)}>
                                        <FiEdit2 />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Удалить">
                                    <IconButton size="small" onClick={() => onDelete(d)}>
                                        <FiTrash2 />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
});
