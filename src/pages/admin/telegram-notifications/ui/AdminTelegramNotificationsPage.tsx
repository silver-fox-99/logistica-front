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
import { TelegramConfigsTable } from "@/widgets/admin-telegram-notifications/configs-table/ui/TelegramConfigsTable";
import { useAdminTelegramNotificationsPage } from "../model/useAdminTelegramNotificationsPage";

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
    } = useAdminTelegramNotificationsPage();

    const [dialogOpen, setDialogOpen] = useState(false);
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
        const ok = window.confirm(`Delete telegram config "${item.name}"?`);
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
                        Telegram notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage bots, channels and delivery settings for cargo and transport messages.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<FiPlus />}
                    onClick={openCreate}
                >
                    Add config
                </Button>
            </Stack>

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
            >
                <TextField
                    label="Search"
                    placeholder="Search by name"
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: { md: 320 } }}
                />

                <Typography variant="body2" color="text.secondary">
                    Total: {total}
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
        </Stack>
    );
}