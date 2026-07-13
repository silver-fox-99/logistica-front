import { useEffect, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Switch,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  FiBell,
  FiPlusSquare,
  FiTrendingUp,
  FiAward,
  FiCheckCircle,
  FiMapPin,
  FiGift,
  FiSmartphone,
  FiMail,
  FiMonitor,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useUserStore } from "@/entities/user/model/user.store.ts";
import { profileApi } from "@/shared/api/profileApi.ts";

interface NotificationSettings {
  notify_new_tenders: boolean;
  notify_my_tender_bids: boolean;
  notify_tender_win: boolean;
  notify_tender_finished: boolean;
  notify_route_matches: boolean;
  notify_system_updates: boolean;
  channel_in_app: boolean;
  channel_telegram: boolean;
  channel_email: boolean;
}

const defaultSettings: NotificationSettings = {
  notify_new_tenders: true,
  notify_my_tender_bids: true,
  notify_tender_win: true,
  notify_tender_finished: true,
  notify_route_matches: true,
  notify_system_updates: true,
  channel_in_app: true,
  channel_telegram: true,
  channel_email: false,
};

export default function NotificationSettingsCard() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  const isTelegramConnected = !!user?.telegram_chat_id;
  const isEmailVerified = !!user?.email_verified_at && !!user?.email;

  const fetchSettings = async () => {
    if (!user?.id) return;
    try {
      const res = await profileApi.getNotificationSettings();
      if (res?.data) {
        setSettings({
          ...defaultSettings,
          ...res.data,
        });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error("Failed to fetch notification settings:", error);
      // Откат к значениям по умолчанию в случае ошибки
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка настроек с бэкенда
  useEffect(() => {
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
      [field]: newValue,
    });
    setSavingField(field);

    try {
      await profileApi.updateNotificationSettings({ [field]: newValue });
    } catch (error: any) {
      console.error(
        `Failed to update notification settings for ${field}:`,
        error,
      );
      // Откат изменений в случае ошибки
      setSettings({
        ...settings,
        [field]: originalValue,
      });
      toast.error(
        t("profile.notifications.saveError", "Не удалось сохранить изменения"),
      );
    } finally {
      setSavingField(null);
    }
  };

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 180,
        }}
      >
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
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.02)",
        },
      }}
    >
      <Stack spacing={3}>
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
            <Typography variant="h6" fontWeight={600}>
              {t("profile.notifications.title", "Настройки уведомлений")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(
                "profile.notifications.subtitle",
                "Персонализация уведомлений вашей логистической платформы",
              )}
            </Typography>
          </Stack>
        </Stack>

        {/* 1. КАНАЛЫ ДОСТАВКИ */}
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {t(
              "profile.notifications.channelsTitle",
              "Каналы получения уведомлений",
            )}
          </Typography>

          {/* На сайте (In-App) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "grey.100",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ pr: 2 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.lighter",
                  color: "primary.main",
                }}
              >
                <FiMonitor size={18} />
              </Box>
              <Stack spacing={0.2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {t("profile.notifications.channelInApp", "Внутри сайта")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    "profile.notifications.channelInAppDesc",
                    "Мгновенные уведомления (колокольчик) в шапке сайта",
                  )}
                </Typography>
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {savingField === "channel_in_app" && (
                <CircularProgress size={16} />
              )}
              <Switch
                checked={settings?.channel_in_app ?? true}
                onChange={() => void handleToggle("channel_in_app")}
                disabled={savingField === "channel_in_app"}
                color="primary"
              />
            </Box>
          </Box>

          {/* В Telegram */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "grey.100",
              opacity: isTelegramConnected ? 1 : 0.6,
              bgcolor: isTelegramConnected ? "background.paper" : "grey.50",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ pr: 2 }}
            >
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
                <FiSmartphone size={18} />
              </Box>
              <Stack spacing={0.2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {t("profile.notifications.channelTelegram", "Telegram-бот")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isTelegramConnected
                    ? t(
                        "profile.notifications.channelTelegramDesc",
                        "Личные уведомления в привязанный аккаунт Telegram",
                      )
                    : t(
                        "profile.notifications.channelTelegramRequired",
                        "Необходимо привязать Telegram-аккаунт в блоке выше",
                      )}
                </Typography>
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {savingField === "channel_telegram" && (
                <CircularProgress size={16} />
              )}
              <Switch
                checked={
                  isTelegramConnected && (settings?.channel_telegram ?? true)
                }
                onChange={() => void handleToggle("channel_telegram")}
                disabled={
                  !isTelegramConnected || savingField === "channel_telegram"
                }
                color="primary"
              />
            </Box>
          </Box>

          {/* По E-mail */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "grey.100",
              opacity: isEmailVerified ? 1 : 0.6,
              bgcolor: isEmailVerified ? "background.paper" : "grey.50",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ pr: 2 }}
            >
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
                <FiMail size={18} />
              </Box>
              <Stack spacing={0.2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {t("profile.notifications.channelEmail", "Электронная почта")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEmailVerified
                    ? t(
                        "profile.notifications.channelEmailDesc",
                        "Важные сводки и обновления на ваш подтвержденный email",
                      )
                    : t(
                        "profile.notifications.channelEmailRequired",
                        "Необходимо подтвердить E-mail в блоке выше",
                      )}
                </Typography>
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {savingField === "channel_email" && (
                <CircularProgress size={16} />
              )}
              <Switch
                checked={isEmailVerified && (settings?.channel_email ?? false)}
                onChange={() => void handleToggle("channel_email")}
                disabled={!isEmailVerified || savingField === "channel_email"}
                color="primary"
              />
            </Box>
          </Box>
        </Stack>

        <Divider />

        {/* 2. НАСТРОЙКИ СОБЫТИЙ */}
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {t(
              "profile.notifications.eventsTitle",
              "О каких событиях уведомлять",
            )}
          </Typography>

          {settings && (
            <Stack spacing={2}>
              {/* Настройка: Новые тендеры */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ pr: 2 }}
                >
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
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t("profile.notifications.newTenders", "Новые тендеры")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "profile.notifications.newTendersDesc",
                        "Уведомления о создании новых тендеров на платформе",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {savingField === "notify_new_tenders" && (
                    <CircularProgress size={16} />
                  )}
                  <Switch
                    checked={settings.notify_new_tenders}
                    onChange={() => void handleToggle("notify_new_tenders")}
                    disabled={savingField === "notify_new_tenders"}
                    color="primary"
                  />
                </Box>
              </Box>

              {/* Настройка: Ставки в моих тендерах */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ pr: 2 }}
                >
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
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t(
                        "profile.notifications.myTenderBids",
                        "Ставки в моих тендерах",
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "profile.notifications.myTenderBidsDesc",
                        "Уведомления о том, что кто-то сделал ставку в вашем тендере",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {savingField === "notify_my_tender_bids" && (
                    <CircularProgress size={16} />
                  )}
                  <Switch
                    checked={settings.notify_my_tender_bids}
                    onChange={() => void handleToggle("notify_my_tender_bids")}
                    disabled={savingField === "notify_my_tender_bids"}
                    color="primary"
                  />
                </Box>
              </Box>

              {/* Настройка: Победа в тендере */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ pr: 2 }}
                >
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
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t("profile.notifications.tenderWin", "Победа в тендере")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "profile.notifications.tenderWinDesc",
                        "Уведомления о том, что вы победили в тендере",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {savingField === "notify_tender_win" && (
                    <CircularProgress size={16} />
                  )}
                  <Switch
                    checked={settings.notify_tender_win}
                    onChange={() => void handleToggle("notify_tender_win")}
                    disabled={savingField === "notify_tender_win"}
                    color="primary"
                  />
                </Box>
              </Box>

              {/* Настройка: Завершение тендера */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ pr: 2 }}
                >
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
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t(
                        "profile.notifications.tenderFinished",
                        "Завершение тендеров",
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "profile.notifications.tenderFinishedDesc",
                        "Уведомления о завершении тендеров, в которых вы принимали участие",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {savingField === "notify_tender_finished" && (
                    <CircularProgress size={16} />
                  )}
                  <Switch
                    checked={settings.notify_tender_finished}
                    onChange={() => void handleToggle("notify_tender_finished")}
                    disabled={savingField === "notify_tender_finished"}
                    color="primary"
                  />
                </Box>
              </Box>

              {/* Настройка: Просматриваемые маршруты */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ pr: 2 }}
                >
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
                    <FiMapPin size={18} />
                  </Box>
                  <Stack spacing={0.2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t(
                        "profile.notifications.routeMatches",
                        "Интересные маршруты",
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "profile.notifications.routeMatchesDesc",
                        "Появление нового транспорта/грузов по маршрутам, которые вы часто ищете",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {savingField === "notify_route_matches" && (
                    <CircularProgress size={16} />
                  )}
                  <Switch
                    checked={settings.notify_route_matches}
                    onChange={() => void handleToggle("notify_route_matches")}
                    disabled={savingField === "notify_route_matches"}
                    color="primary"
                  />
                </Box>
              </Box>

              {/* Настройка: Новости и акции */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ pr: 2 }}
                >
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
                    <FiGift size={18} />
                  </Box>
                  <Stack spacing={0.2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t(
                        "profile.notifications.systemUpdates",
                        "Новости и скидки",
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "profile.notifications.systemUpdatesDesc",
                        "Скидки на тарифы, обновления сайта, спецпредложения и новости платформы",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {savingField === "notify_system_updates" && (
                    <CircularProgress size={16} />
                  )}
                  <Switch
                    checked={settings.notify_system_updates}
                    onChange={() => void handleToggle("notify_system_updates")}
                    disabled={savingField === "notify_system_updates"}
                    color="primary"
                  />
                </Box>
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
