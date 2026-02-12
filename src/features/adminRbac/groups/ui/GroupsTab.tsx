import { memo, useCallback } from "react";
import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import {MdDeleteOutline, MdKey} from "react-icons/md";
import type { AdminGroup } from "@/entities/adminGroup/model/types";

type Props = {
    groups: AdminGroup[];
    onDelete: (id: string) => void;
    onEditPermissions: (g: AdminGroup) => void
};

export const GroupsTab = memo(function GroupsTab({ groups, onDelete, onEditPermissions }: Props) {
    const handleDelete = useCallback((id: string) => () => onDelete(id), [onDelete]);


    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6">Groups</Typography>
            </Stack>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Rank</TableCell>
                        <TableCell>Root</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {groups.map((g) => (
                        <TableRow key={g.id} hover>
                            <TableCell>{g.name}</TableCell>
                            <TableCell>{g.code}</TableCell>
                            <TableCell>{g.rank}</TableCell>
                            <TableCell>{g.is_root ? "Yes" : "No"}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => onEditPermissions(g)} aria-label="Group permissions">
                                    <MdKey />
                                </IconButton>
                                <IconButton size="small" onClick={handleDelete(g.id)} aria-label="Delete group">
                                    <MdDeleteOutline />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {groups.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5}>No groups found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
});
