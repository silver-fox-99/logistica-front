import { create } from "zustand";
import { userRouteInterestApi, type CreateRouteInterestPayload } from "@/shared/api/userRouteInterestApi";
import type { UserRouteInterest } from "./types";

interface UserRouteInterestsState {
    interests: UserRouteInterest[];
    loading: boolean;
    error: string | null;
    fetchInterests: () => Promise<void>;
    createInterest: (payload: CreateRouteInterestPayload) => Promise<boolean>;
    deleteInterest: (id: string) => Promise<boolean>;
}

export const useUserRouteInterestsStore = create<UserRouteInterestsState>((set, get) => ({
    interests: [],
    loading: false,
    error: null,

    fetchInterests: async () => {
        set({ loading: true, error: null });
        try {
            const res = await userRouteInterestApi.list();
            if (res.status && res.data) {
                if (Array.isArray(res.data)) {
                    set({ interests: res.data });
                } else if (typeof res.data === "object") {
                    set({ interests: [res.data as any] });
                } else {
                    set({ interests: [] });
                }
            } else {
                set({ interests: [] });
            }
        } catch (err: any) {
            console.error("Failed to fetch user route interests:", err);
            set({ error: err?.response?.data?.message || "Failed to fetch interests" });
        } finally {
            set({ loading: false });
        }
    },

    createInterest: async (payload: CreateRouteInterestPayload) => {
        set({ loading: true, error: null });
        try {
            const res = await userRouteInterestApi.create(payload);
            if (res.status) {
                await get().fetchInterests();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error("Failed to create user route interest:", err);
            set({ error: err?.response?.data?.message || "Failed to create interest" });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    deleteInterest: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const res = await userRouteInterestApi.delete(id);
            if (res.status) {
                set({
                    interests: get().interests.filter((item) => item.id !== id)
                });
                return true;
            }
            return false;
        } catch (err: any) {
            console.error("Failed to delete user route interest:", err);
            set({ error: err?.response?.data?.message || "Failed to delete interest" });
            return false;
        } finally {
            set({ loading: false });
        }
    },
}));
