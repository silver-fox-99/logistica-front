import { useState } from "react";
import {
    Paper, Stack, Typography, Button, Box, CircularProgress, Chip, Collapse
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaTelegramPlane } from "react-icons/fa";
import { FiCheckCircle, FiInfo, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { useUserStore } from "@/entities/user/model/user.store.ts";
import { profileApi } from "@/shared/api/profileApi.ts";
import { authApi } from "@/shared/api/authApi.ts";

export default function TelegramBindingCard() {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);

    const [loading, setLoading] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [checking, setChecking] = useState(false);

    const isConnected = !!user?.telegram_chat_id;

    // Функция ручной проверки статуса привязки
    const checkBindingStatus = async (showFeedback = true) => {
        setChecking(true);
        try {
            const res = await authApi.getMe();
            if (res.data?.telegram_chat_id) {
                setUser(res.data);
                toast.success(t("profile.telegramBinding.successToast"));
                setIsWaiting(false);
            } else if (showFeedback) {
                toast.info(t("profile.telegramBinding.waitingToast"));
            }
        } catch (error: any) {
            console.error("Failed to check telegram status:", error);
            if (showFeedback) {
                toast.error("Не удалось проверить статус привязки. Попробуйте еще раз.");
            }
        } finally {
            setChecking(false);
        }
    };

    // Обработчик подключения
    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await profileApi.getTelegramLink();
            if (res?.url) {
                // Открываем бота в новой вкладке
                window.open(res.url, "_blank", "noopener,noreferrer");
                // Переходим в режим ожидания (показываем кнопку ручной проверки)
                setIsWaiting(true);
            } else {
                toast.error("Не удалось сгенерировать ссылку привязки.");
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || "Ошибка подключения Telegram";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: isConnected ? "success.light" : "divider",
                bgcolor: "background.paper",
                transition: "all 0.3s ease-in-out",
                boxShadow: isConnected ? "0 4px 20px rgba(46, 125, 50, 0.05)" : "none",
                "&:hover": {
                    borderColor: isConnected ? "success.main" : "primary.light",
                    boxShadow: isConnected 
                        ? "0 6px 24px rgba(46, 125, 50, 0.08)"
                        : "0 6px 20px rgba(0, 0, 0, 0.02)"
                }
            }}
        >
            <Stack spacing={2}>
                {/* Заголовок и статус */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: isConnected ? "success.lighter" : "primary.lighter",
                                color: isConnected ? "success.main" : "primary.main",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <FaTelegramPlane size={20} />
                        </Box>
                        <Stack spacing={0.2}>
                            <Typography variant="h6" fontWeight={700}>
                                {t("profile.telegramBinding.title")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isConnected 
                                    ? t("profile.telegramBinding.connectedDesc") 
                                    : t("profile.telegramBinding.description")
                                }
                            </Typography>
                        </Stack>
                    </Stack>

                    <Chip
                        icon={isConnected ? <FiCheckCircle style={{ color: "inherit" }} /> : <FiInfo style={{ color: "inherit" }} />}
                        label={isConnected ? t("profile.telegramBinding.connected") : t("profile.telegramBinding.notConnected")}
                        color={isConnected ? "success" : "default"}
                        variant={isConnected ? "filled" : "outlined"}
                        size="medium"
                        sx={{
                            fontWeight: 600,
                            px: 1,
                            borderRadius: 1.5,
                            "& .MuiChip-icon": { marginLeft: 0.5 }
                        }}
                    />
                </Box>

                {/* Инструкции для неподключенного пользователя */}
                <Collapse in={!isConnected}>
                    <Box 
                        sx={{ 
                            p: 2, 
                            borderRadius: 1.5, 
                            bgcolor: "grey.50", 
                            border: "1px dashed", 
                            borderColor: "grey.200", 
                            mb: 0.5 
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1}>
                            {t("profile.telegramBinding.instructionsTitle")}
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary" display="flex" gap={1}>
                                <span style={{ fontWeight: 600, color: "var(--mui-palette-primary-main, #1976d2)" }}>1.</span>
                                {t("profile.telegramBinding.step1")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" display="flex" gap={1}>
                                <span style={{ fontWeight: 600, color: "var(--mui-palette-primary-main, #1976d2)" }}>2.</span>
                                {t("profile.telegramBinding.step2")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" display="flex" gap={1}>
                                <span style={{ fontWeight: 600, color: "var(--mui-palette-primary-main, #1976d2)" }}>3.</span>
                                {t("profile.telegramBinding.step3")}
                            </Typography>
                        </Stack>
                    </Box>
                </Collapse>

                {/* Панель кнопок и статуса ожидания */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", width: "100%" }}>
                    <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
                        {isWaiting && !isConnected && (
                            <Button
                                variant="outlined"
                                onClick={() => void checkBindingStatus(true)}
                                disabled={checking}
                                startIcon={checking ? <CircularProgress size={16} color="inherit" /> : <FiRefreshCw />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                    borderColor: "primary.light",
                                }}
                            >
                                {checking ? t("profile.telegramBinding.checkingStatus") : t("profile.telegramBinding.checkStatus")}
                            </Button>
                        )}

                        {!isConnected && (
                            <Button
                                variant="contained"
                                onClick={handleConnect}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FaTelegramPlane />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                                    background: "linear-gradient(45deg, #229ED9, #2AABEE)",
                                    "&:hover": {
                                        background: "linear-gradient(45deg, #1d8bc0, #2497d4)",
                                        boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
                                    }
                                }}
                            >
                                {loading ? t("profile.telegramBinding.connecting") : t("profile.telegramBinding.connect")}
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
}
