import { create } from "zustand";
import { userNotificationsApi, type UserNotification } from "@/shared/api/userNotificationsApi";

interface UserNotificationsState {
    notifications: UserNotification[];
    unreadNotifications: UserNotification[];
    unreadCount: number;
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    unreadLoading: boolean;
    fetchNotifications: (page?: number, limit?: number, is_read?: boolean) => Promise<void>;
    fetchUnreadNotifications: (limit?: number) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    setUnreadCount: (count: number) => void;
}

export const useUserNotificationsStore = create<UserNotificationsState>((set, get) => ({
    notifications: [],
    unreadNotifications: [],
    unreadCount: 0,
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    unreadLoading: false,

    fetchNotifications: async (page = 1, limit = 20, is_read?: boolean) => {
        set({ loading: true });
        try {
            const res = await userNotificationsApi.list({ page, limit, is_read });
            if (res.status && res.data) {
                const list = res.data.data ?? [];
                const unreadInList = list.filter((n) => !n.is_read).length;
                
                set({
                    notifications: list,
                    total: res.data.total ?? 0,
                    page: res.data.page ?? page,
                    limit: res.data.limit ?? limit,
                    // If fetching unread explicitly, use backend total. Otherwise compute from list or preserve.
                    unreadCount: is_read === false ? (res.data.total ?? list.length) : (is_read === undefined ? unreadInList : get().unreadCount),
                });
            }
        } catch (err) {
            console.error("Failed to fetch user notifications:", err);
        } finally {
            set({ loading: false });
        }
    },

    fetchUnreadNotifications: async (limit = 10) => {
        set({ unreadLoading: true });
        try {
            const res = await userNotificationsApi.list({ page: 1, limit, is_read: false });
            if (res.status && res.data) {
                const list = res.data.data ?? [];
                set({
                    unreadNotifications: list,
                    unreadCount: res.data.total ?? list.length,
                });
            }
        } catch (err) {
            console.error("Failed to fetch unread notifications:", err);
        } finally {
            set({ unreadLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        // Optimistic update
        const originalNotifications = [...get().notifications];
        const updatedNotifications = originalNotifications.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        );
        const originalUnread = [...get().unreadNotifications];
        const updatedUnread = originalUnread.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        );
        const originalUnreadCount = get().unreadCount;
        const newUnreadCount = Math.max(0, originalUnreadCount - 1);

        set({
            notifications: updatedNotifications,
            unreadNotifications: updatedUnread,
            unreadCount: newUnreadCount,
        });

        try {
            await userNotificationsApi.markAsRead(id);
        } catch (err) {
            console.warn(`Backend markAsRead failed, keeping optimistic UI change:`, err);
        }
    },

    markAllAsRead: async () => {
        // Optimistic update
        const originalNotifications = [...get().notifications];
        const updatedNotifications = originalNotifications.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
        }));
        const originalUnread = [...get().unreadNotifications];
        const updatedUnread = originalUnread.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
        }));

        set({
            notifications: updatedNotifications,
            unreadNotifications: updatedUnread,
            unreadCount: 0,
        });

        try {
            await userNotificationsApi.markAllAsRead();
        } catch (err) {
            console.warn(`Backend markAllAsRead failed, keeping optimistic UI change:`, err);
        }
    },

    setUnreadCount: (unreadCount) => set({ unreadCount }),
}));
