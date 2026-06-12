import { create } from "zustand";
import { notificationsApi } from "@/shared/api/notifications.api";

interface UnreadNotificationsState {
    count: number;
    setCount: (count: number) => void;
    increment: () => void;
    decrement: () => void;
    fetchCount: () => Promise<void>;
}

export const useUnreadNotificationsStore = create<UnreadNotificationsState>((set) => ({
    count: 0,
    setCount: (count) => set({ count }),
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
    fetchCount: async () => {
        try {
            const res = await notificationsApi.list({ is_read: false, limit: 1 });
            set({ count: res.total });
        } catch (err) {
            console.error("Failed to fetch unread notifications count:", err);
        }
    },
}));
