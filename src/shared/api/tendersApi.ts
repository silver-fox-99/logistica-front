import api from "@/shared/api/axios";
import type {
    AddTenderBlacklistPhonePayload,
    ConfirmTenderCodePayload,
    CreateTenderBidPayload,
    CreateTenderPayload,
    Tender,
    TenderListParams,
    TenderListResponse,
    UpdateTenderPayload
} from "@/entities/tender/model/types.ts";


export const tendersApi = {
    list: async (params?: TenderListParams) => {
        const { data } = await api.get<TenderListResponse>("/tenders/list", { params });
        return data;
    },

    create: async (payload: CreateTenderPayload) => {
        const { data } = await api.post<{ status: boolean; data: Tender; message: string }>(
            "/tenders/create",
            payload,
        );
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<{ status: boolean; data: Tender; message: string }>(
            `/tenders/${id}/info`,
        );
        return data.data;
    },

    update: async (id: string, payload: UpdateTenderPayload) => {
        const { data } = await api.patch<{ status: boolean; data: Tender; message: string }>(
            `/tenders/${id}`,
            payload,
        );
        return data.data;
    },

    cancel: async (id: string) => {
        const { data } = await api.delete<{ status: boolean; data: Tender; message: string }>(
            `/tenders/${id}`,
        );
        return data.data;
    },

    myActive: async (params?: TenderListParams) => {
        const { data } = await api.get<TenderListResponse>("/tenders/my/active", { params });
        return data;
    },

    myIncomplete: async (params?: TenderListParams) => {
        const { data } = await api.get<TenderListResponse>("/tenders/my/incomplete", { params });
        return data;
    },

    myArchive: async (params?: TenderListParams) => {
        const { data } = await api.get<TenderListResponse>("/tenders/my/archive", { params });
        return data;
    },

    myBids: async (params?: TenderListParams) => {
        const { data } = await api.get<TenderListResponse>("/tenders/my/bids", { params });
        return data;
    },

    myWins: async (params?: TenderListParams) => {
        const { data } = await api.get<TenderListResponse>("/tenders/my/wins", { params });
        return data;
    },

    createOrUpdateBid: async (id: string, payload: CreateTenderBidPayload) => {
        const { data } = await api.post<{ status?: boolean; data: unknown; message?: string }>(`/tenders/${id}/bid`, payload);
        return data.data;
    },

    selectWinner: async (id: string, bidId: string) => {
        const { data } = await api.post<{
            status?: boolean;
            data: { owner_code?: string; confirmation?: unknown };
            message?: string;
        }>(`/tenders/${id}/select-winner/${bidId}`);
        return data.data;
    },

    confirmCode: async (id: string, payload: ConfirmTenderCodePayload) => {
        const { data } = await api.post<{ status?: boolean; data: unknown; message?: string }>(`/tenders/${id}/confirm-code`, payload);
        return data.data;
    },

    addBlacklistPhone: async (payload: AddTenderBlacklistPhonePayload) => {
        const { data } = await api.post("/tenders/blacklist/phones", payload);
        return data.data;
    },

    removeBlacklistPhone: async (id: string) => {
        const { data } = await api.delete(`/tenders/blacklist/phones/${id}`);
        return data.data;
    },

    getCode: async (tenderId: string) => {
        const {data} = await api.get(`/tenders/${tenderId}/get-code`);
        return data.data;
    }
};
