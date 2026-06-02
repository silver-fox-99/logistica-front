import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Pagination,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiPlus } from "react-icons/fi";

import type { TelegramNotificationConfig } from "@/entities/telegram-notification/model/types";
import { TelegramConfigDialog } from "@/features/admin-telegram-notifications/create-edit-config/ui/TelegramConfigDialog";
import { TelegramSendAdsDialog } from "@/features/admin-telegram-notifications/send-ads/ui/TelegramSendAdsDialog";
import { TelegramConfigsTable } from "@/widgets/admin-telegram-notifications/configs-table/ui/TelegramConfigsTable";
import { useAdminTelegramNotificationsPage } from "../model/useAdminTelegramNotificationsPage";
import { FaRegNewspaper } from "react-icons/fa";

export default function AdminTelegramNotificationsPage() {
    const {
        items,
        loading,
        submitting,
        error,
        filters,
        pages,
        total,
        setSearch,
        setPage,
        createConfig,
        updateConfig,
        toggleConfig,
        removeConfig,
        sendAds
    } = useAdminTelegramNotificationsPage();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [sendAdsDialogOpen, setSendAdsDialogOpen] = useState(false);
    const [selected, setSelected] = useState<TelegramNotificationConfig | null>(null);

    const openCreate = () => {
        setSelected(null);
        setDialogOpen(true);
    };

    const openEdit = (item: TelegramNotificationConfig) => {
        setSelected(item);
        setDialogOpen(true);
    };

    const handleDelete = async (item: TelegramNotificationConfig) => {
        const ok = window.confirm(`Вы действительно хотите удалить конфигурацию ботов "${item.name}"?`);
        if (!ok) return;
        await removeConfig(item.id);
    };

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={2}
            >
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Telegram-уведомления
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление ботами, каналами и параметрами доставки сообщений о грузах и транспорте.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2} sx={{ alignSelf: { xs: "stretch", md: "center" } }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<FaRegNewspaper />}
                        onClick={() => setSendAdsDialogOpen(true)}
                        sx={{ flex: 1 }}
                    >
                        Разослать рекламу
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<FiPlus />}
                        onClick={openCreate}
                        sx={{ flex: 1 }}
                    >
                        Добавить бота
                    </Button>
                </Stack>
            </Stack>

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
            >
                <TextField
                    label="Поиск"
                    placeholder="Поиск по названию"
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: { md: 320 } }}
                />

                <Typography variant="body2" color="text.secondary">
                    Всего конфигураций: {total}
                </Typography>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TelegramConfigsTable
                items={items}
                loading={loading}
                onEdit={openEdit}
                onToggle={toggleConfig}
                onDelete={handleDelete}
            />

            {pages > 1 ? (
                <Stack direction="row" justifyContent="center">
                    <Pagination
                        page={filters.page}
                        count={pages}
                        onChange={(_, page) => setPage(page)}
                        color="primary"
                    />
                </Stack>
            ) : null}

            <TelegramConfigDialog
                open={dialogOpen}
                config={selected}
                submitting={submitting}
                onClose={() => setDialogOpen(false)}
                onSubmit={(payload) => {
                    if (selected?.id) {
                        return updateConfig(selected.id, payload);
                    }
                    return createConfig(payload);
                }}
            />

            <TelegramSendAdsDialog
                open={sendAdsDialogOpen}
                configs={items}
                submitting={submitting}
                onClose={() => setSendAdsDialogOpen(false)}
                onSubmit={sendAds}
            />
        </Stack>
    );
}