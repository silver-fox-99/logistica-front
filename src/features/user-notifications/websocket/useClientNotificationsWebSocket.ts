import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { useUserNotificationsStore } from "@/entities/notification/model/userNotifications.store";
import type { UserNotification } from "@/shared/api/userNotificationsApi";

export function useClientNotificationsWebSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        const wsUrl = import.meta.env.VITE_API_URL || "http://localhost:3080";

        // Connect to the /client-notifications namespace
        const socket = io(`${wsUrl}/client-notifications`, {
            auth: {
                token: refreshToken,
            },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket connected to client-notifications namespace");
        });

        socket.on("connect_error", (err) => {
            console.warn("WebSocket client-notifications connection error:", err.message);
        });

        socket.on("notification", (notification: UserNotification) => {
            const store = useUserNotificationsStore.getState();
            
            // Avoid adding duplicates if already present
            const exists = store.unreadNotifications.some(n => n.id === notification.id);
            if (!exists) {
                // Increment unread count in store
                store.setUnreadCount(store.unreadCount + 1);
                
                // Add new notification to top of list
                useUserNotificationsStore.setState({
                    unreadNotifications: [notification, ...store.unreadNotifications].slice(0, 10),
                    notifications: [notification, ...store.notifications]
                });
            }

            // Show toast popup
            toast.info(`Новое уведомление: ${notification.message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);
}
