import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { NotificationType, type Notification } from "@/entities/notification/model/types";
import { useUnreadNotificationsStore } from "@/entities/notification/model/unreadNotifications.store";

function getGroupedNotificationLabel(type: NotificationType, count: number): string {
    switch (type) {
        case NotificationType.REGISTRATION:
            return `Зарегистрировано новых пользователей: ${count}`;
        case NotificationType.REVIEW:
            return `Получено новых отзывов: ${count}`;
        case NotificationType.PLAN_CHANGE:
            return `Изменений тарифных планов: ${count}`;
        case NotificationType.CARGO_CREATED:
            return `Добавлено новых грузов: ${count}`;
        case NotificationType.TRANSPORT_CREATED:
            return `Добавлено нового транспорта: ${count}`;
        case NotificationType.COMPANY_CREATED:
            return `Создано новых компаний: ${count}`;
        case NotificationType.TENDER_CREATED:
            return `Создано новых тендеров: ${count}`;
        default:
            return `Получено новых уведомлений (${count})`;
    }
}

export function useNotificationsWebSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        const wsUrl = import.meta.env.VITE_API_URL || "http://localhost:3080";

        // Connect to the /notifications namespace
        const socket = io(`${wsUrl}/notifications`, {
            auth: {
                token: refreshToken,
            },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket connected to notifications namespace");
        });

        socket.on("connect_error", (err) => {
            console.warn("WebSocket notifications connection error:", err.message);
        });

        let buffer: Notification[] = [];
        let timeoutId: any = null;

        const processBuffer = () => {
            if (buffer.length === 0) return;

            if (buffer.length === 1) {
                const notif = buffer[0];
                toast.info(`Новое уведомление: ${notif.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                // Group by type
                const grouped = buffer.reduce((acc, notif) => {
                    acc[notif.type] = (acc[notif.type] || 0) + 1;
                    return acc;
                }, {} as Record<NotificationType, number>);

                const types = Object.keys(grouped) as NotificationType[];

                if (types.length === 1) {
                    const type = types[0];
                    const count = grouped[type];
                    toast.info(getGroupedNotificationLabel(type, count), {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    toast.info(`Получено новых уведомлений: ${buffer.length}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            }

            buffer = [];
            timeoutId = null;
        };

        socket.on("notification", (notification: Notification) => {
            // Increment unread notifications count
            useUnreadNotificationsStore.getState().increment();

            // Dispatch custom event to let components update in real-time
            window.dispatchEvent(
                new CustomEvent<Notification>("admin_notification_received", {
                    detail: notification,
                })
            );

            // Buffer notifications for grouping toast popups
            buffer.push(notification);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(processBuffer, 400);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);
}
