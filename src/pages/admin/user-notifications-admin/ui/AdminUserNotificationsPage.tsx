import { useEffect, useState, useCallback } from "react";
import {
    Button,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import {
    userNotificationsAdminApi,
    type AdminBroadcast,
    type CreateBroadcastDto
} from "@/shared/api/userNotificationsAdminApi.ts";
import BroadcastsTable from "./BroadcastsTable";
import CreateBroadcastDialog from "./CreateBroadcastDialog";

export default function AdminUserNotificationsPage() {
    const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Состояние поиска
    const [searchQuery, setSearchQuery] = useState("");
    const [activeQuery, setActiveQuery] = useState("");

    // Состояние диалогового окна
    const [openDialog, setOpenDialog] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const loadData = useCallback(async (currentPage: number, currentRowsPerPage: number, queryText: string) => {
        setLoading(true);
        try {
            const res = await userNotificationsAdminApi.listBroadcasts({
                limit: currentRowsPerPage,
                page: currentPage + 1,
                q: queryText.trim() || undefined,
            });
            setBroadcasts(res.data?.data || []);
            setTotal(res.data?.total || 0);
        } catch (error: any) {
            console.error("Failed to load broadcasts:", error);
            toast.error("Не удалось загрузить историю рассылок");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData(page, rowsPerPage, activeQuery);
    }, [page, rowsPerPage, activeQuery, loadData]);

    const handleSearchSubmit = () => {
        setPage(0);
        setActiveQuery(searchQuery);
    };

    const handleSearchClear = () => {
        setSearchQuery("");
        setPage(0);
        setActiveQuery("");
    };

    const handleCreateBroadcast = async (dto: CreateBroadcastDto) => {
        setCreateLoading(true);
        try {
            await userNotificationsAdminApi.createBroadcast(dto);
            toast.success("Глобальная рассылка успешно запущена!");
            setOpenDialog(false);
            setPage(0);
            void loadData(0, rowsPerPage, activeQuery);
        } catch (error: any) {
            console.error("Failed to create broadcast:", error);
            toast.error("Ошибка при создании рассылки");
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
            {/* Хедер страницы */}
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight={700}>
                        Рассылка уведомлений пользователям
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление глобальными уведомлениями и объявлениями для клиентов
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<FiRefreshCw />}
                        onClick={() => void loadData(page, rowsPerPage, activeQuery)}
                        sx={{ borderRadius: 2, textTransform: "none", height: 40 }}
                    >
                        Обновить
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<FiPlus />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ borderRadius: 2, textTransform: "none", height: 40 }}
                    >
                        Создать рассылку
                    </Button>
                </Stack>
            </Stack>

            {/* Панель поиска */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ maxWidth: 600, width: "100%" }}>
                <TextField
                    placeholder="Поиск по заголовку или сообщению..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearchSubmit();
                        }
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    onClick={handleSearchSubmit}
                    sx={{ textTransform: "none", borderRadius: 2, height: 40, px: 3 }}
                >
                    Найти
                </Button>
                {activeQuery && (
                    <Button
                        variant="text"
                        color="inherit"
                        onClick={handleSearchClear}
                        sx={{ textTransform: "none", height: 40 }}
                    >
                        Сбросить
                    </Button>
                )}
            </Stack>

            {/* Таблица истории рассылок */}
            <BroadcastsTable
                broadcasts={broadcasts}
                total={total}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(newVal) => {
                    setRowsPerPage(newVal);
                    setPage(0);
                }}
            />

            {/* Диалоговое окно создания рассылки */}
            <CreateBroadcastDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSubmit={handleCreateBroadcast}
                loading={createLoading}
            />
        </Stack>
    );
}
