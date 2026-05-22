import { create } from "zustand";

type TenderWorkspaceAccessState = {
    tenderId: string;
    canManage: boolean;
    setAccess: (params: { tenderId: string; canManage: boolean }) => void;
    clearAccess: () => void;
};

export const useTenderWorkspaceAccessStore = create<TenderWorkspaceAccessState>()((set) => ({
    tenderId: "",
    canManage: false,
    setAccess: ({ tenderId, canManage }) => set({ tenderId, canManage }),
    clearAccess: () => set({ tenderId: "", canManage: false }),
}));
