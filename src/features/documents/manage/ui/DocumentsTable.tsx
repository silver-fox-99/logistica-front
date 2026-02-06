import React from "react";
import { IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { DocumentEntity } from "@/entities/document/model/types";

type Props = {
    items: DocumentEntity[];
    onEdit: (doc: DocumentEntity) => void;
    onDelete: (doc: DocumentEntity) => void;
};

export const DocumentsTable = React.memo(function DocumentsTable({ items, onEdit, onDelete }: Props) {
    if (!items.length) {
        return <Typography sx={{ opacity: 0.75 }}>No versions found.</Typography>;
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Published</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {items.map((d) => (
                    <TableRow key={d.id} hover>
                        <TableCell>v{d.version}</TableCell>
                        <TableCell>{d.status}</TableCell>
                        <TableCell>{d.published_at ? new Date(d.published_at).toLocaleString() : "-"}</TableCell>
                        <TableCell>{new Date(d.updated_at).toLocaleString()}</TableCell>
                        <TableCell align="right">
                            <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => onEdit(d)}>
                                        <FiEdit2 />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
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
