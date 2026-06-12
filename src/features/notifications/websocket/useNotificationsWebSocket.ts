import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import type { Notification } from "@/entities/notification/model/types";
import { useUnreadNotificationsStore } from "@/entities/notification/model/unreadNotifications.store";

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
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket connected to notifications namespace");
        });

        socket.on("connect_error", (err) => {
            console.warn("WebSocket notifications connection error:", err.message);
        });

        socket.on("notification", (notification: Notification) => {
            // Show toast popup
            toast.info(`Новое уведомление: ${notification.message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Increment unread notifications count
            useUnreadNotificationsStore.getState().increment();

            // Dispatch custom event to let components (like NotificationsPage) update in real-time
            window.dispatchEvent(
                new CustomEvent<Notification>("admin_notification_received", {
                    detail: notification,
                })
            );
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);
}
