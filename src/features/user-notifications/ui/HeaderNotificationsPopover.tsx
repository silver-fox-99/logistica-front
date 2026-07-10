import React, { useEffect, useState } from "react";
import {
    IconButton, Badge, Popover, Box, Typography, Button, List,
    ListItem, ListItemText, Divider, Stack, CircularProgress, Chip
} from "@mui/material";
import { FiBell } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserNotificationsStore } from "@/entities/notification/model/userNotifications.store";
import type { UserNotification } from "@/shared/api/userNotificationsApi";

// Simple relative time formatter helper
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

export default function HeaderNotificationsPopover() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const {
        unreadNotifications,
        unreadCount,
        unreadLoading,
        fetchUnreadNotifications,
        markAsRead,
        markAllAsRead
    } = useUserNotificationsStore();

    // Fetch count of notifications on mount
    useEffect(() => {
        void fetchUnreadNotifications(10);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        // Refresh when opening the popover
        void fetchUnreadNotifications(10);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notif: UserNotification) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        handleClose();
        // If there's a link or metadata to redirect, we can navigate there.
        if (notif.metadata?.link) {
            navigate(notif.metadata.link);
        } else {
            navigate("/dashboard/notifications");
        }
    };

    const handleMarkAll = async () => {
        await markAllAsRead();
    };

    const handleViewAll = () => {
        handleClose();
        navigate("/dashboard/notifications");
    };

    const open = Boolean(anchorEl);
    const id = open ? "notifications-popover" : undefined;
    const latestNotifications = unreadNotifications.slice(0, 5);

    return (
        <>
            <IconButton
                aria-describedby={id}
                onClick={handleClick}
                size="large"
                sx={{
                    color: "text.primary",
                    transition: "transform 0.2s",
                    "&:hover": {
                        transform: "scale(1.05)",
                    }
                }}
            >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    <FiBell size={22} />
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    sx: {
                        width: "calc(100vw - 32px)",
                        maxWidth: 360,
                        maxHeight: 480,
                        borderRadius: 3,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        border: "1px solid",
                        borderColor: "divider",
                        mt: 1.5,
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {t("notifications.title", "Уведомления")}
                    </Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkAll}
                            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
                        >
                            {t("notifications.markAllAsRead", "Прочитать все")}
                        </Button>
                    )}
                </Box>
                <Divider />

                {/* Content List */}
                <Box sx={{ maxHeight: 340, overflowY: "auto" }}>
                    {unreadLoading && unreadNotifications.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : latestNotifications.length === 0 ? (
                        <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("notifications.empty", "У вас нет уведомлений")}
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {latestNotifications.map((notif, index) => {
                                const color = getNotificationColor(notif.type);
                                return (
                                    <React.Fragment key={notif.id}>
                                        <ListItem
                                            onClick={() => void handleNotificationClick(notif)}
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                cursor: "pointer",
                                                bgcolor: notif.is_read ? "transparent" : "action.hover",
                                                transition: "background-color 0.2s",
                                                alignItems: "flex-start",
                                                "&:hover": {
                                                    bgcolor: "action.selected",
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: "hidden", flex: 1 }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={notif.is_read ? 600 : 700}
                                                                color="text.primary"
                                                                sx={{
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap"
                                                                }}
                                                            >
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
                                                                            fontSize: "0.65rem",
                                                                            fontWeight: 700,
                                                                            color: "#fff",
                                                                            bgcolor: color || "primary.main",
                                                                            borderRadius: 1,
                                                                            height: 16,
                                                                            px: 0.75,
                                                                            "& .MuiChip-label": { px: 0.5 },
                                                                            flexShrink: 0
                                                                        }}
                                                                    />
                                                                ) : null;
                                                            })()}
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                                            {formatRelativeTime(notif.created_at, t)}
                                                        </Typography>
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.5,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",
                                                            wordBreak: "break-word"
                                                        }}
                                                    >
                                                        {notif.message}
                                                    </Typography>
                                                }
                                            />
                                            {!notif.is_read && (
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        bgcolor: "primary.main",
                                                        alignSelf: "center",
                                                        ml: 1,
                                                        flexShrink: 0
                                                    }}
                                                />
                                            )}
                                        </ListItem>
                                        {index < latestNotifications.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}
                </Box>

                {/* Footer */}
                <Divider />
                <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                    <Button
                        fullWidth
                        size="small"
                        onClick={handleViewAll}
                        sx={{ textTransform: "none", fontWeight: 600, py: 0.75 }}
                    >
                        {t("notifications.viewAll", "Показать все")}
                    </Button>
                </Box>
            </Popover>
        </>
    );
}
