import {
    Card, CardHeader, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Stack,
} from "@mui/material";
import type { PowerUser } from "@/shared/api/dashboardApi";

export default function PowerUsersTable({ rows }: { rows: PowerUser[] }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Power users" subheader="By ads and updates" />
            <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell align="right">Ads</TableCell>
                            <TableCell align="right">Updates</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((u) => (
                            <TableRow key={u.user_id}>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar sx={{ width: 26, height: 26 }}>
                                            {(u.first_name?.[0] || "").toUpperCase()}
                                        </Avatar>
                                        <span>{[u.first_name, u.last_name].filter(Boolean).join(" ") || u.user_id}</span>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right">{u.ads}</TableCell>
                                <TableCell align="right">{u.updates}</TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow><TableCell colSpan={3}>No data</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
