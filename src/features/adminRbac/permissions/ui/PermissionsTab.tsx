import { memo, useCallback } from "react";
import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import type { AdminPermission } from "@/entities/adminPermission/model/types";

type Props = {
    permissions: AdminPermission[];
    onDelete: (id: string) => void;
};

export const PermissionsTab = memo(function PermissionsTab({ permissions, onDelete }: Props) {
    const handleDelete = useCallback((id: string) => () => onDelete(id), [onDelete]);

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6">Permissions</Typography>
            </Stack>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {permissions.map((p) => (
                        <TableRow key={p.id} hover>
                            <TableCell>{p.code}</TableCell>
                            <TableCell>{p.description ?? "-"}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={handleDelete(p.id)} aria-label="Delete permission">
                                    <MdDeleteOutline />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {permissions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3}>No permissions found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
});
