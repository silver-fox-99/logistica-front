import { useEffect, useState } from "react";
import {
    Paper, Stack, Typography, Switch, Box, CircularProgress, Alert, AlertTitle
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { FiBell, FiPlusSquare, FiTrendingUp, FiAward, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { useUserStore } from "@/entities/user/model/user.store.ts";
import { profileApi } from "@/shared/api/profileApi.ts";

interface NotificationSettings {
    notify_new_tenders: boolean;
    notify_my_tender_bids: boolean;
    notify_tender_win: boolean;
    notify_tender_finished: boolean;
}

export default function NotificationSettingsCard() {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);

    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingField, setSavingField] = useState<string | null>(null);

    const isTelegramConnected = !!user?.telegram_chat_id;

    // Загрузка настроек с бэкенда
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.id) return;
            try {
                const res = await profileApi.getNotificationSettings();
                if (res?.data) {
                    setSettings(res.data);
                }
            } catch (error: any) {
                console.error("Failed to fetch notification settings:", error);
                toast.error(t("profile.notifications.loadError", "Не удалось загрузить настройки уведомлений"));
            } finally {
                setLoading(false);
            }
        };

        void fetchSettings();
    }, [user?.id, t]);

    // Обработчик переключения тумблера
    const handleToggle = async (field: keyof NotificationSettings) => {
        if (!settings) return;

        const originalValue = settings[field];
        const newValue = !originalValue;

        // Оптимистичное обновление интерфейса
        setSettings({
            ...settings,
            [field]: newValue
        });
        setSavingField(field);

        try {
            await profileApi.updateNotificationSettings({ [field]: newValue });
            // Беззвучное автосохранение
        } catch (error: any) {
            console.error(`Failed to update notification settings for ${field}:`, error);
            // Откат изменений в случае ошибки
            setSettings({
                ...settings,
                [field]: originalValue
            });
            toast.error(t("profile.notifications.saveError", "Не удалось сохранить изменения"));
        } finally {
            setSavingField(null);
        }
    };

    if (loading) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 180 }}>
                <CircularProgress size={30} />
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                    borderColor: "primary.light",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.02)"
                }
            }}
        >
            <Stack spacing={2.5}>
                {/* Шапка карточки */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.lighter",
                            color: "primary.main",
                        }}
                    >
                        <FiBell size={20} />
                    </Box>
                    <Stack spacing={0.2}>
                        <Typography variant="h6" fontWeight={700}>
                            {t("profile.notifications.title", "Настройки уведомлений")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("profile.notifications.subtitle", "Персонализация уведомлений вашей логистической платформы")}
                        </Typography>
                    </Stack>
                </Stack>

                {/* Баннер-предупреждение, если Telegram не привязан */}
                {!isTelegramConnected && (
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            borderRadius: 1.5,
                            "& .MuiAlert-message": { width: "100%" }
                        }}
                    >
                        <AlertTitle fontWeight={700}>
                            {t("profile.notifications.warningTitle", "Telegram не привязан")}
                        </AlertTitle>
                        {t("profile.notifications.warningDesc", "Для получения этих уведомлений вам необходимо сначала привязать свой Telegram-аккаунт в блоке выше.")}
                    </Alert>
                )}

                {/* Список настроек */}
                {settings && (
                    <Stack spacing={2}>
                        {/* Настройка 1: Новые тендеры */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "grey.100",
                                transition: "all 0.2s ease",
                                opacity: isTelegramConnected ? 1 : 0.6,
                                "&:hover": isTelegramConnected ? {
                                    borderColor: "grey.200",
                                    bgcolor: "grey.25",
                                } : {}
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 2 }}>
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "info.lighter",
                                        color: "info.main",
                                    }}
                                >
                                    <FiPlusSquare size={18} />
                                </Box>
                                <Stack spacing={0.2}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t("profile.notifications.newTenders", "Новые тендеры")}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("profile.notifications.newTendersDesc", "Уведомления о создании новых тендеров на платформе")}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {savingField === "notify_new_tenders" && <CircularProgress size={16} />}
                                <Switch
                                    checked={settings.notify_new_tenders}
                                    onChange={() => void handleToggle("notify_new_tenders")}
                                    disabled={!isTelegramConnected || savingField === "notify_new_tenders"}
                                    color="primary"
                                />
                            </Box>
                        </Box>

                        {/* Настройка 2: Ставки в моих тендерах */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "grey.100",
                                transition: "all 0.2s ease",
                                opacity: isTelegramConnected ? 1 : 0.6,
                                "&:hover": isTelegramConnected ? {
                                    borderColor: "grey.200",
                                    bgcolor: "grey.25",
                                } : {}
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 2 }}>
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "warning.lighter",
                                        color: "warning.main",
                                    }}
                                >
                                    <FiTrendingUp size={18} />
                                </Box>
                                <Stack spacing={0.2}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t("profile.notifications.myTenderBids", "Ставки в моих тендерах")}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("profile.notifications.myTenderBidsDesc", "Уведомления о том, что кто-то сделал ставку в вашем тендере")}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {savingField === "notify_my_tender_bids" && <CircularProgress size={16} />}
                                <Switch
                                    checked={settings.notify_my_tender_bids}
                                    onChange={() => void handleToggle("notify_my_tender_bids")}
                                    disabled={!isTelegramConnected || savingField === "notify_my_tender_bids"}
                                    color="primary"
                                />
                            </Box>
                        </Box>

                        {/* Настройка 3: Победа в тендере */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "grey.100",
                                transition: "all 0.2s ease",
                                opacity: isTelegramConnected ? 1 : 0.6,
                                "&:hover": isTelegramConnected ? {
                                    borderColor: "grey.200",
                                    bgcolor: "grey.25",
                                } : {}
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 2 }}>
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "success.lighter",
                                        color: "success.main",
                                    }}
                                >
                                    <FiAward size={18} />
                                </Box>
                                <Stack spacing={0.2}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t("profile.notifications.tenderWin", "Победа в тендере")}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("profile.notifications.tenderWinDesc", "Уведомления о том, что вы победили в тендере")}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {savingField === "notify_tender_win" && <CircularProgress size={16} />}
                                <Switch
                                    checked={settings.notify_tender_win}
                                    onChange={() => void handleToggle("notify_tender_win")}
                                    disabled={!isTelegramConnected || savingField === "notify_tender_win"}
                                    color="primary"
                                />
                            </Box>
                        </Box>

                        {/* Настройка 4: Завершение тендера */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "grey.100",
                                transition: "all 0.2s ease",
                                opacity: isTelegramConnected ? 1 : 0.6,
                                "&:hover": isTelegramConnected ? {
                                    borderColor: "grey.200",
                                    bgcolor: "grey.25",
                                } : {}
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 2 }}>
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "secondary.lighter",
                                        color: "secondary.main",
                                    }}
                                >
                                    <FiCheckCircle size={18} />
                                </Box>
                                <Stack spacing={0.2}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t("profile.notifications.tenderFinished", "Завершение тендеров")}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("profile.notifications.tenderFinishedDesc", "Уведомления о завершении тендеров, в которых вы принимали участие")}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {savingField === "notify_tender_finished" && <CircularProgress size={16} />}
                                <Switch
                                    checked={settings.notify_tender_finished}
                                    onChange={() => void handleToggle("notify_tender_finished")}
                                    disabled={!isTelegramConnected || savingField === "notify_tender_finished"}
                                    color="primary"
                                />
                            </Box>
                        </Box>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
