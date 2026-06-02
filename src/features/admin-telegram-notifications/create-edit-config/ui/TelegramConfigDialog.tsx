import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
} from "@mui/material";

import type {
    CreateTelegramNotificationConfigPayload,
    TelegramNotificationConfig,
} from "@/entities/telegram-notification/model/types";

type Props = {
    open: boolean;
    config?: TelegramNotificationConfig | null;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateTelegramNotificationConfigPayload) => Promise<boolean> | boolean;
};

function normalizeChatIds(value: string) {
    return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
}

export function TelegramConfigDialog(props: Props) {
    const { open, config, submitting, onClose, onSubmit } = props;

    const [name, setName] = useState("");
    const [botToken, setBotToken] = useState("");
    const [chatIdsText, setChatIdsText] = useState("");
    const [sendCargo, setSendCargo] = useState(true);
    const [sendTransport, setSendTransport] = useState(true);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!open) return;

        setName(config?.name ?? "");
        setBotToken(config?.bot_token ?? "");
        setChatIdsText((config?.chat_ids ?? []).join("\n"));
        setSendCargo(config?.send_cargo ?? true);
        setSendTransport(config?.send_transport ?? true);
        setIsActive(config?.is_active ?? true);
    }, [open, config]);

    const isEdit = Boolean(config?.id);

    const chatIdsPreview = useMemo(() => normalizeChatIds(chatIdsText), [chatIdsText]);

    const handleSubmit = async () => {
        const payload: CreateTelegramNotificationConfigPayload = {
            name: name.trim(),
            bot_token: botToken.trim(),
            chat_ids: normalizeChatIds(chatIdsText),
            send_cargo: sendCargo,
            send_transport: sendTransport,
            is_active: isActive,
        };

        const ok = await onSubmit(payload);
        if (ok) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? "Редактирование конфигурации Telegram" : "Создание конфигурации Telegram"}</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <TextField
                        label="Название"
                        placeholder="Например, Основной бот"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Токен бота"
                        placeholder="Введите токен бота (от BotFather)"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="ID чатов / каналов"
                        placeholder={"По одному ID на строку, например:\n-1001234567890\n-1009876543210"}
                        value={chatIdsText}
                        onChange={(e) => setChatIdsText(e.target.value)}
                        fullWidth
                        multiline
                        minRows={5}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={sendCargo}
                                onChange={(e) => setSendCargo(e.target.checked)}
                            />
                        }
                        label="Отправлять сообщения о грузах"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={sendTransport}
                                onChange={(e) => setSendTransport(e.target.checked)}
                            />
                        }
                        label="Отправлять сообщения о транспорте"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        }
                        label="Активен"
                    />

                    <TextField
                        label="Количество распознанных каналов"
                        value={chatIdsPreview.length}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={submitting}>
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={
                        submitting ||
                        !name.trim() ||
                        !botToken.trim() ||
                        normalizeChatIds(chatIdsText).length === 0
                    }
                >
                    {isEdit ? "Сохранить" : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}