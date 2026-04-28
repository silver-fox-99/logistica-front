import api from "@/shared/api/axios";
import type {CargoInitData, CreateCargoDto} from "@/entities/cargo/model/types.ts";


type InitResponse = {
    status: boolean;
    data: CargoInitData;
    message: string;
};

type CreateResponse<T = unknown> = {
    status: boolean;
    data: T;
    message: string;
};

export const cargoApi = {
    async init() {
        const { data } = await api.get<InitResponse>("/cargo/init");
        return data.data;
    },

    async create(payload: CreateCargoDto) {
        const { data } = await api.post<CreateResponse>("/cargo/create", payload);
        return data;
    },

    async info(id: string) {
        const { data } = await api.get<CreateResponse>(`/cargo/${id}/info`);
        return data?.data ?? data;
    },

    async viewCount(id: string) {
        const { data } = await api.get<CreateResponse>(`/cargo/${id}/view-count`);
        return data;
    },

    async publicInfo(id: string) {
        const { data } = await api.get<CreateResponse>(`/cargo/public/${id}/info`);
        return data?.data ?? data;
    },
};