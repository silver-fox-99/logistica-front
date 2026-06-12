import { useMemo } from "react";
import {
    Alert,
    Box,
    Button,
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
import { FiRefreshCw, FiCheck, FiCheckSquare } from "react-icons/fi";

import { useNotifications } from "@/features/notifications/list/model/useNotifications";
import { NotificationType, type Notification } from "@/entities/notification/model/types";
import {useAdminAccessStore} from "@/entities/adminAccess/model/adminAccess.store.ts";
import {viewCode} from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

const TABS: Array<{ label: string; type?: NotificationType }> = [
    { label: "Все", type: undefined },
    { label: "Регистрация", type: NotificationType.REGISTRATION },
    { label: "Отзывы", type: NotificationType.REVIEW },
    { label: "Оплата тарифа", type: NotificationType.PLAN_CHANGE },
    { label: "Создан груз", type: NotificationType.CARGO_CREATED },
    { label: "Создан транспорт", type: NotificationType.TRANSPORT_CREATED },
    { label: "Создана компания", type: NotificationType.COMPANY_CREATED },
    { label: "Создан тендер", type: NotificationType.TENDER_CREATED },
];

function typeLabel(t: NotificationType) {
    switch (t) {
        case NotificationType.REGISTRATION:
            return "Регистрация";
        case NotificationType.REVIEW:
            return "Отзыв";
        case NotificationType.PLAN_CHANGE:
            return "Оплата тарифа";
        case NotificationType.CARGO_CREATED:
            return "Создан груз";
        case NotificationType.TRANSPORT_CREATED:
            return "Создан транспорт";
        case NotificationType.COMPANY_CREATED:
            return "Создана компания";
        case NotificationType.TENDER_CREATED:
            return "Создан тендер";
        default:
            return t;
    }
}

function formatTime(iso: string) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ru-RU", {
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
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const tabIndex = useMemo(() => {
        const idx = TABS.findIndex((t) => t.type === type);
        return idx >= 0 ? idx : 0;
    }, [type]);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const canViewNotifications = useAdminAccessStore((s) => s.hasPermission(viewCode('NOTIFICATIONS' as any)));

    if (!canViewNotifications) return <NoAccess/>

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack>
                    <Typography variant="h5" fontWeight={800}>
                        Уведомления
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Поиск по ID пользователя или телефону. Фильтрация по категориям во вкладках.
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" gap={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={markAllAsRead}
                        startIcon={<FiCheckSquare />}
                    >
                        Прочитать все
                    </Button>
                    <Tooltip title="Обновить">
                        <span>
                            <IconButton onClick={() => void reload()} disabled={loading}>
                                {loading ? <CircularProgress size={18} /> : <FiRefreshCw />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
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
                        label="Поиск"
                        placeholder="ID пользователя (uuid) или телефон"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell width={170}>Время</TableCell>
                                    <TableCell width={170}>Тип</TableCell>
                                    <TableCell width={280}>Пользователь</TableCell>
                                    <TableCell width={170}>Телефон</TableCell>
                                    <TableCell>Сообщение</TableCell>
                                    <TableCell width={100} align="right">Действия</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {items.map((n: Notification) => (
                                    <TableRow
                                        key={n.id}
                                        hover
                                        sx={{
                                            bgcolor: n.is_read ? "transparent" : "rgba(25, 118, 210, 0.04)",
                                            fontWeight: n.is_read ? "normal" : "bold",
                                            "&:hover": {
                                                bgcolor: n.is_read ? "action.hover" : "rgba(25, 118, 210, 0.08) !important",
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: "inherit" }}>
                                            {formatTime(n.created_at)}
                                        </TableCell>

                                        <TableCell>
                                            <Chip size="small" label={typeLabel(n.type)} />
                                        </TableCell>

                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: "inherit" }}>
                                            {n.user_id ?? "—"}
                                        </TableCell>

                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: "inherit" }}>
                                            {n.phone ?? "—"}
                                        </TableCell>

                                        <TableCell sx={{ fontWeight: "inherit" }}>{n.message}</TableCell>

                                        <TableCell align="right">
                                            {!n.is_read && (
                                                <Tooltip title="Прочитано">
                                                    <IconButton size="small" onClick={() => void markAsRead(n.id)}>
                                                        <FiCheck style={{ color: "#2e7d32" }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {!loading && items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Уведомления не найдены.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Stack direction="row" alignItems="center" gap={1.5}>
                                                <CircularProgress size={18} />
                                                <Typography variant="body2">Загрузка...</Typography>
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
                            labelRowsPerPage="Строк на странице:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}–${to} из ${count !== -1 ? count : `больше чем ${to}`}`
                            }
                        />
                    </TableContainer>
                </Stack>
            </Paper>
        </Box>
    );
}
