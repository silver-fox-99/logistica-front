import React, { useEffect, useState, useMemo } from "react";
import {
    Container, Stack, Typography, Card, CardContent, Button, Tabs, Tab,
    Box, List, ListItem, ListItemText, Divider,
    CircularProgress, TextField, InputAdornment, IconButton, Pagination, Chip,
    useTheme, useMediaQuery
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCheck } from "react-icons/fi";
import { useUserNotificationsStore } from "@/entities/notification/model/userNotifications.store";
import { RouteInterestSettings } from "@/features/user-notifications/ui/RouteInterestSettings";

// Relative time formatter helper
function formatRelativeTime(dateString: string, t: any): string {
    try {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        if (isNaN(diffMs)) return "";

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t("notifications.time.justNow", "Только что");
        if (diffMins < 60) return `${diffMins} м. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        return `${diffDays} дн. назад`;
    } catch {
        return "";
    }
}

function getNotificationColor(type: string): string {
    const tLower = type.toLowerCase();
    if (tLower === "system_update" || tLower === "system_updates") {
        return "warning.main";
    }
    if (tLower === "promotion") {
        return "error.main";
    }
    if (tLower === "news") {
        return "info.main";
    }
    if (tLower.includes("tender_win") || tLower.includes("win")) {
        return "success.main";
    }
    if (tLower.includes("bid") || tLower.includes("tender")) {
        return "info.main";
    }
    if (tLower.includes("review")) {
        return "warning.main";
    }
    if (tLower.includes("success") || tLower.includes("verified")) {
        return "success.main";
    }
    return "primary.main";
}

export default function UserNotificationsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const {
        notifications,
        total,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useUserNotificationsStore();

    const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const handleItemClick = async (notif: any) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        if (notif.metadata?.link) {
            navigate(notif.metadata.link);
        }
    };

    useEffect(() => {
        void fetchNotifications(currentPage, 15);
    }, [currentPage]);

    const handleMarkAll = async () => {
        await markAllAsRead();
    };

    const handleMarkSingle = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await markAsRead(id);
    };

    // Client-side filtering & searching based on current page contents
    const filteredNotifications = useMemo(() => {
        return notifications.filter((notif) => {
            // Tab filter
            if (activeTab === "unread" && notif.is_read) return false;
            if (activeTab === "read" && !notif.is_read) return false;

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = notif.title?.toLowerCase().includes(query);
                const msgMatch = notif.message.toLowerCase().includes(query);
                const typeMatch = notif.type.toLowerCase().includes(query);
                return titleMatch || msgMatch || typeMatch;
            }

            return true;
        });
    }, [notifications, activeTab, searchQuery]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: "all" | "unread" | "read") => {
        setActiveTab(newValue);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const totalPages = Math.ceil(total / 15) || 1;

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Stack spacing={3}>
                {/* Title and Action Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={800} color="text.primary">
                            {t("notifications.title", "Уведомления")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("notifications.subtitle", "Просматривайте системные события и уведомления платформы")}
                        </Typography>
                    </Stack>
                    {notifications.some((n) => !n.is_read) && (
                        <Button
                            variant="outlined"
                            startIcon={<FiCheck />}
                            onClick={handleMarkAll}
                            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, height: 40 }}
                        >
                            {t("notifications.markAllAsRead", "Прочитать все")}
                        </Button>
                    )}
                </Box>

                <RouteInterestSettings />

                {/* Filters and Search Bar */}
                <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                sx={{
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    width: { xs: "100%", sm: "auto" },
                                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minWidth: 80 }
                                }}
                            >
                                <Tab label={t("notifications.filterAll", "Все")} value="all" />
                                <Tab label={t("notifications.filterUnread", "Непрочитанные")} value="unread" />
                                <Tab label={t("notifications.filterRead", "Прочитанные")} value="read" />
                            </Tabs>

                            <TextField
                                size="small"
                                placeholder={t("notifications.searchPlaceholder", "Поиск по уведомлениям...")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiSearch size={16} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ width: { xs: "100%", sm: 260 }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
                            <CircularProgress size={36} />
                        </Box>
                    ) : filteredNotifications.length === 0 ? (
                        <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
                            <Typography variant="h6" fontWeight={700} color="text.secondary" mb={1}>
                                {t("notifications.emptyTitle", "Ничего не найдено")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("notifications.emptyDescription", "У вас нет уведомлений, соответствующих выбранным критериям.")}
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {filteredNotifications.map((notif, index) => {
                                const color = getNotificationColor(notif.type);
                                return (
                                    <React.Fragment key={notif.id}>
                                        <ListItem
                                            onClick={notif.metadata?.link ? () => void handleItemClick(notif) : undefined}
                                            sx={{
                                                p: { xs: 1.5, sm: 2.5 },
                                                bgcolor: notif.is_read ? "transparent" : "action.hover",
                                                transition: "all 0.2s",
                                                alignItems: "flex-start",
                                                position: "relative",
                                                cursor: notif.metadata?.link ? "pointer" : "default",
                                                "&:hover": notif.metadata?.link ? {
                                                    bgcolor: notif.is_read ? "action.hover" : "action.selected",
                                                } : undefined,
                                                "&::before": !notif.is_read ? {
                                                    content: '""',
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 4,
                                                    bgcolor: "primary.main"
                                                } : undefined
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} mb={0.5}>
                                                        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                                                            <Typography variant="subtitle1" fontWeight={notif.is_read ? 600 : 700} color="text.primary">
                                                                {notif.title || t(`notifications.types.${notif.type.toUpperCase()}`, "Уведомление")}
                                                            </Typography>
                                                            {(() => {
                                                                const badgeLabel = notif.metadata?.badge || (
                                                                    ["SYSTEM_UPDATE", "PROMOTION", "NEWS"].includes(notif.type.toUpperCase())
                                                                        ? t(`notifications.types.${notif.type.toUpperCase()}`)
                                                                        : null
                                                                );
                                                                return badgeLabel ? (
                                                                    <Chip
                                                                        label={badgeLabel}
                                                                        size="small"
                                                                        sx={{
                                                                            fontSize: "0.7rem",
                                                                            fontWeight: 700,
                                                                            color: "#fff",
                                                                            bgcolor: color || "primary.main",
                                                                            borderRadius: 1.5,
                                                                            height: 20,
                                                                            px: 1
                                                                        }}
                                                                    />
                                                                ) : null;
                                                            })()}
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatRelativeTime(notif.created_at, t)}
                                                        </Typography>
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "flex-end" }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word", lineHeight: 1.6, flex: 1, width: "100%" }}>
                                                            {notif.message}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ alignSelf: { xs: "flex-end", sm: "auto" }, mt: { xs: 1.5, sm: 0 } }}>
                                                            {notif.metadata?.link && (
                                                                <Button
                                                                    size="small"
                                                                    variant="text"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(notif.metadata.link);
                                                                    }}
                                                                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem", p: 0.5 }}
                                                                >
                                                                    {t("notifications.goToLink", "Перейти")} →
                                                                </Button>
                                                            )}
                                                            {!notif.is_read && (
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={(e) => void handleMarkSingle(e, notif.id)}
                                                                    title={t("notifications.markAsReadSingle", "Отметить как прочитанное")}
                                                                    sx={{
                                                                        border: "1px solid",
                                                                        borderColor: "primary.light",
                                                                        p: 0.5,
                                                                        borderRadius: 1.5,
                                                                        bgcolor: "primary.lighter",
                                                                        "&:hover": {
                                                                            bgcolor: "primary.light",
                                                                            color: "#fff"
                                                                        }
                                                                    }}
                                                                >
                                                                    <FiCheck size={16} />
                                                                </IconButton>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                        {index < filteredNotifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}
                </Card>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>
                )}
            </Stack>
        </Container>
    );
}
