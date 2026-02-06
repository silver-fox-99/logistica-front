import { useMemo } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
} from "@mui/material";
import { FiRefreshCw } from "react-icons/fi";

import { useNotifications } from "@/features/notifications/list/model/useNotifications";
import { NotificationType, type Notification } from "@/entities/notification/model/types";

const TABS: Array<{ label: string; type?: NotificationType }> = [
    { label: "All", type: undefined },
    { label: "Registration", type: NotificationType.REGISTRATION },
    { label: "Reviews", type: NotificationType.REVIEW },
    { label: "Plan changes", type: NotificationType.PLAN_CHANGE },
    { label: "Cargo created", type: NotificationType.CARGO_CREATED },
    { label: "Transport created", type: NotificationType.TRANSPORT_CREATED },
];

function typeLabel(t: NotificationType) {
    switch (t) {
        case NotificationType.REGISTRATION:
            return "Registration";
        case NotificationType.REVIEW:
            return "Review";
        case NotificationType.PLAN_CHANGE:
            return "Plan change";
        case NotificationType.CARGO_CREATED:
            return "Cargo created";
        case NotificationType.TRANSPORT_CREATED:
            return "Transport created";
        default:
            return t;
    }
}

function formatTime(iso: string) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(d);
}

export default function NotificationsPage() {
    const {
        type,
        setType,
        q,
        setQ,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        data,
        loading,
        error,
        reload,
    } = useNotifications();

    const tabIndex = useMemo(() => {
        const idx = TABS.findIndex((t) => t.type === type);
        return idx >= 0 ? idx : 0;
    }, [type]);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack>
                    <Typography variant="h5" fontWeight={800}>
                        Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Search by user ID or phone. Filter by category tabs.
                    </Typography>
                </Stack>

                <Tooltip title="Refresh">
          <span>
            <IconButton onClick={() => void reload()} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : <FiRefreshCw />}
            </IconButton>
          </span>
                </Tooltip>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack sx={{ p: 2 }} spacing={2}>
                    <Tabs
                        value={tabIndex}
                        onChange={(_, idx) => setType(TABS[idx]?.type)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {TABS.map((t) => (
                            <Tab key={t.label} label={t.label} />
                        ))}
                    </Tabs>

                    <TextField
                        fullWidth
                        label="Search"
                        placeholder="User ID (uuid) or phone"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell width={170}>Time</TableCell>
                                    <TableCell width={170}>Type</TableCell>
                                    <TableCell width={280}>User</TableCell>
                                    <TableCell width={170}>Phone</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {items.map((n: Notification) => (
                                    <TableRow key={n.id} hover>
                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                                            {formatTime(n.created_at)}
                                        </TableCell>

                                        <TableCell>
                                            <Chip size="small" label={typeLabel(n.type)} />
                                        </TableCell>

                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                                            {n.user_id ?? "—"}
                                        </TableCell>

                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                                            {n.phone ?? "—"}
                                        </TableCell>

                                        <TableCell>{n.message}</TableCell>
                                    </TableRow>
                                ))}

                                {!loading && items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="text.secondary">
                                                No notifications found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Stack direction="row" alignItems="center" gap={1.5}>
                                                <CircularProgress size={18} />
                                                <Typography variant="body2">Loading...</Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={(_, next) => setPage(next)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </TableContainer>
                </Stack>
            </Paper>
        </Box>
    );
}
